const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { Product, Category, ProductImage, ProductOption } = require('../models');

const MEDIA_DIR = path.join(__dirname, '..', '..', 'media');

// O que vem junto quando buscamos um produto
const include = [
  { model: Category, as: 'categories', attributes: ['id'], through: { attributes: [] } },
  { model: ProductImage, as: 'images' },
  { model: ProductOption, as: 'options' },
];

// Remove campos undefined para não sobrescrever valores sem querer
function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

// Monta o formato de resposta pedido no escopo
function format(p) {
  return {
    id: p.id,
    enabled: p.enabled,
    name: p.name,
    slug: p.slug,
    use_in_menu: p.use_in_menu,
    stock: p.stock,
    description: p.description,
    price: p.price,
    price_with_discount: p.price_with_discount,
    category_ids: p.categories.map((c) => c.id),
    images: p.images.map((i) => ({ id: i.id, content: i.path })),
    options: p.options.map((o) => ({
      id: o.id,
      title: o.title,
      shape: o.shape,
      radius: o.radius,
      type: o.type,
      values: o.values.split(','),
    })),
  };
}

// Salva uma imagem base64 na pasta media e devolve o caminho relativo
function saveImage(content, type) {
  if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true });
  const ext = (type || 'image/png').split('/')[1].replace('jpeg', 'jpg');
  const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const data = content.replace(/^data:.*;base64,/, '');
  fs.writeFileSync(path.join(MEDIA_DIR, name), Buffer.from(data, 'base64'));
  return `media/${name}`;
}

// Converte uma opção do payload para o formato do banco
function parseOption(o) {
  const values = o.values || o.value;
  return clean({
    title: o.title,
    shape: o.shape,
    type: o.type,
    radius: o.radius !== undefined ? parseInt(o.radius, 10) || 0 : undefined,
    values: Array.isArray(values) ? values.join(',') : values,
  });
}

// GET /v1/product/search
exports.search = async (req, res) => {
  const limit = req.query.limit !== undefined ? parseInt(req.query.limit, 10) : 12;
  const page = req.query.page !== undefined ? parseInt(req.query.page, 10) : 1;
  if (Number.isNaN(limit) || Number.isNaN(page) || limit === 0 || limit < -1 || page < 1) {
    return res.status(400).json({ message: 'Parâmetros inválidos' });
  }

  const where = {};

  if (req.query.match) {
    where[Op.or] = [
      { name: { [Op.like]: `%${req.query.match}%` } },
      { description: { [Op.like]: `%${req.query.match}%` } },
    ];
  }

  if (req.query['price-range']) {
    const [min, max] = req.query['price-range'].split('-').map(Number);
    if (Number.isNaN(min) || Number.isNaN(max)) {
      return res.status(400).json({ message: 'price-range inválido' });
    }
    where.price = { [Op.between]: [min, max] };
  }

  if (req.query.category_ids) {
    const ids = req.query.category_ids.split(',').map(Number);
    if (ids.some(Number.isNaN)) {
      return res.status(400).json({ message: 'category_ids inválido' });
    }
    const cats = await Category.findAll({
      where: { id: ids },
      include: [{ model: Product, attributes: ['id'], through: { attributes: [] } }],
    });
    where.id = [...new Set(cats.flatMap((c) => c.Products.map((p) => p.id)))];
  }

  const options = { where, order: [['id', 'ASC']] };
  if (limit !== -1) {
    options.limit = limit;
    options.offset = (page - 1) * limit;
  }

  // 1) acha os produtos da página; 2) busca os detalhes deles
  const { count, rows } = await Product.findAndCountAll(options);
  const full = await Product.findAll({
    where: { id: rows.map((r) => r.id) },
    include,
    order: [['id', 'ASC']],
  });

  return res.status(200).json({ data: full.map(format), total: count, limit, page });
};

// GET /v1/product/:id
exports.getById = async (req, res) => {
  const product = await Product.findByPk(req.params.id, { include });
  if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
  return res.status(200).json(format(product));
};

// POST /v1/product
exports.create = async (req, res) => {
  const {
    enabled, name, slug, use_in_menu, stock, description,
    price, price_with_discount, category_ids, images, options,
  } = req.body;

  if (!name || !slug || price === undefined || price_with_discount === undefined) {
    return res.status(400).json({ message: 'Dados inválidos' });
  }
  if (category_ids !== undefined) {
    if (!Array.isArray(category_ids)) {
      return res.status(400).json({ message: 'category_ids deve ser uma lista' });
    }
    const found = await Category.count({ where: { id: category_ids } });
    if (found !== category_ids.length) {
      return res.status(400).json({ message: 'Categoria inexistente' });
    }
  }
  if ((options || []).some((o) => !o.title || !(o.values || o.value))) {
    return res.status(400).json({ message: 'Opção inválida' });
  }

  const product = await Product.create(clean({
    enabled: !!enabled,
    name,
    slug,
    use_in_menu: !!use_in_menu,
    stock,
    description,
    price,
    price_with_discount,
  }));

  if (category_ids) await product.setCategories(category_ids);

  for (const img of images || []) {
    await ProductImage.create({
      product_id: product.id,
      enabled: true,
      path: saveImage(img.content, img.type),
    });
  }
  for (const opt of options || []) {
    await ProductOption.create({ product_id: product.id, ...parseOption(opt) });
  }

  return res.status(201).json({ message: 'Produto criado' });
};

// PUT /v1/product/:id
exports.update = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Produto não encontrado' });

  const {
    enabled, name, slug, use_in_menu, stock, description,
    price, price_with_discount, category_ids, images, options,
  } = req.body;

  if (category_ids !== undefined) {
    if (!Array.isArray(category_ids)) {
      return res.status(400).json({ message: 'category_ids deve ser uma lista' });
    }
    const found = await Category.count({ where: { id: category_ids } });
    if (found !== category_ids.length) {
      return res.status(400).json({ message: 'Categoria inexistente' });
    }
  }

  await product.update(clean({
    enabled, name, slug, use_in_menu, stock, description, price, price_with_discount,
  }));
  if (category_ids) await product.setCategories(category_ids);

  for (const img of images || []) {
    if (img.id && img.deleted) {
      await ProductImage.destroy({ where: { id: img.id, product_id: product.id } });
    } else if (img.id && img.content) {
      const isUrl = /^https?:\/\//.test(img.content);
      const newPath = isUrl ? img.content : saveImage(img.content, img.type);
      await ProductImage.update({ path: newPath }, { where: { id: img.id, product_id: product.id } });
    } else if (!img.id && img.content) {
      await ProductImage.create({
        product_id: product.id,
        enabled: true,
        path: saveImage(img.content, img.type),
      });
    }
  }

  for (const opt of options || []) {
    if (opt.id && opt.deleted) {
      await ProductOption.destroy({ where: { id: opt.id, product_id: product.id } });
    } else if (opt.id) {
      await ProductOption.update(parseOption(opt), { where: { id: opt.id, product_id: product.id } });
    } else if (opt.title && (opt.values || opt.value)) {
      await ProductOption.create({ product_id: product.id, ...parseOption(opt) });
    }
  }

  return res.status(204).send();
};

// DELETE /v1/product/:id
exports.remove = async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Produto não encontrado' });
  await product.destroy();
  return res.status(204).send();
};