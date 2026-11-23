const { Category } = require('../models');

exports.search = async (req, res) => {
  const limit = req.query.limit !== undefined ? parseInt(req.query.limit, 10) : 12;
  const page = req.query.page !== undefined ? parseInt(req.query.page, 10) : 1;
  if (Number.isNaN(limit) || Number.isNaN(page) || limit === 0 || limit < -1 || page < 1) {
    return res.status(400).json({ message: 'Parâmetros inválidos' });
  }

  const options = { where: {} };
  if (req.query.use_in_menu === 'true') options.where.use_in_menu = true;

  if (req.query.fields) {
    const fields = req.query.fields.split(',');
    const allowed = Object.keys(Category.rawAttributes);
    if (fields.some((f) => !allowed.includes(f))) {
      return res.status(400).json({ message: 'Campo inválido em fields' });
    }
    options.attributes = fields;
  }

  if (limit !== -1) {
    options.limit = limit;
    options.offset = (page - 1) * limit;
  }

  const { count, rows } = await Category.findAndCountAll(options);
  return res.status(200).json({ data: rows, total: count, limit, page });
};

exports.getById = async (req, res) => {
  const category = await Category.findByPk(req.params.id, {
    attributes: ['id', 'name', 'slug', 'use_in_menu'],
  });
  if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
  return res.status(200).json(category);
};

exports.create = async (req, res) => {
  const { name, slug, use_in_menu } = req.body;
  if (!name || !slug) return res.status(400).json({ message: 'Dados inválidos' });
  await Category.create({ name, slug, use_in_menu: !!use_in_menu });
  return res.status(201).json({ message: 'Categoria criada' });
};

exports.update = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
  const { name, slug, use_in_menu } = req.body;
  if (!name || !slug) return res.status(400).json({ message: 'Dados inválidos' });
  await category.update({ name, slug, use_in_menu: !!use_in_menu });
  return res.status(204).send();
};

exports.remove = async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) return res.status(404).json({ message: 'Categoria não encontrada' });
  await category.destroy();
  return res.status(204).send();
};