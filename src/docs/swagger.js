// Documentação da API 
const bearer = [{ bearerAuth: [] }];

const id = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } };

const query = (name, description) => ({
  name, in: 'query', required: false, description, schema: { type: 'string' },
});

const body = (properties) => ({
  required: true,
  content: { 'application/json': { schema: { type: 'object', properties } } },
});

const str = { type: 'string' };
const num = { type: 'number' };
const bool = { type: 'boolean' };

const userBody = { firstname: str, surname: str, email: str };
const categoryBody = { name: str, slug: str, use_in_menu: bool };
const productBody = {
  enabled: bool,
  name: str,
  slug: str,
  use_in_menu: bool,
  stock: { type: 'integer' },
  description: str,
  price: num,
  price_with_discount: num,
  category_ids: { type: 'array', items: { type: 'integer' } },
  images: { type: 'array', items: { type: 'object', properties: { type: str, content: str } } },
  options: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        title: str, shape: str, radius: { type: 'integer' }, type: str,
        values: { type: 'array', items: str },
      },
    },
  },
};

const paginacao = [
  query('limit', 'Itens por página (padrão 12, use -1 para todos)'),
  query('page', 'Número da página (padrão 1)'),
];

module.exports = {
  openapi: '3.0.0',
  info: { title: 'Projeto Back-end - API', version: '1.0.0' },
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
  },
  paths: {
    '/v1/user/token': {
      post: {
        tags: ['Usuário'],
        summary: 'Gera o token JWT',
        requestBody: body({ email: str, password: str }),
        responses: { 200: { description: 'Token gerado' }, 400: { description: 'Dados inválidos' } },
      },
    },
    '/v1/user': {
      post: {
        tags: ['Usuário'],
        summary: 'Cadastra um usuário',
        requestBody: body({ ...userBody, password: str, confirmPassword: str }),
        responses: { 201: { description: 'Criado' }, 400: { description: 'Dados inválidos' } },
      },
    },
    '/v1/user/{id}': {
      get: {
        tags: ['Usuário'],
        summary: 'Busca usuário por id',
        parameters: [id],
        responses: { 200: { description: 'OK' }, 404: { description: 'Não encontrado' } },
      },
      put: {
        tags: ['Usuário'],
        summary: 'Atualiza um usuário',
        security: bearer,
        parameters: [id],
        requestBody: body(userBody),
        responses: {
          204: { description: 'Atualizado' }, 400: { description: 'Dados inválidos' },
          401: { description: 'Token inválido' }, 404: { description: 'Não encontrado' },
        },
      },
      delete: {
        tags: ['Usuário'],
        summary: 'Remove um usuário',
        security: bearer,
        parameters: [id],
        responses: {
          204: { description: 'Removido' }, 401: { description: 'Token inválido' },
          404: { description: 'Não encontrado' },
        },
      },
    },
    '/v1/category/search': {
      get: {
        tags: ['Categoria'],
        summary: 'Lista categorias',
        parameters: [
          ...paginacao,
          query('fields', 'Campos desejados, separados por vírgula'),
          query('use_in_menu', 'true para só as categorias do menu'),
        ],
        responses: { 200: { description: 'OK' }, 400: { description: 'Parâmetros inválidos' } },
      },
    },
    '/v1/category': {
      post: {
        tags: ['Categoria'],
        summary: 'Cria uma categoria',
        security: bearer,
        requestBody: body(categoryBody),
        responses: {
          201: { description: 'Criada' }, 400: { description: 'Dados inválidos' },
          401: { description: 'Token inválido' },
        },
      },
    },
    '/v1/category/{id}': {
      get: {
        tags: ['Categoria'],
        summary: 'Busca categoria por id',
        parameters: [id],
        responses: { 200: { description: 'OK' }, 404: { description: 'Não encontrada' } },
      },
      put: {
        tags: ['Categoria'],
        summary: 'Atualiza uma categoria',
        security: bearer,
        parameters: [id],
        requestBody: body(categoryBody),
        responses: {
          204: { description: 'Atualizada' }, 400: { description: 'Dados inválidos' },
          401: { description: 'Token inválido' }, 404: { description: 'Não encontrada' },
        },
      },
      delete: {
        tags: ['Categoria'],
        summary: 'Remove uma categoria',
        security: bearer,
        parameters: [id],
        responses: {
          204: { description: 'Removida' }, 401: { description: 'Token inválido' },
          404: { description: 'Não encontrada' },
        },
      },
    },
    '/v1/product/search': {
      get: {
        tags: ['Produto'],
        summary: 'Busca produtos',
        parameters: [
          ...paginacao,
          query('match', 'Texto no nome ou na descrição'),
          query('category_ids', 'Ids de categorias, separados por vírgula'),
          query('price-range', 'Faixa de preço, ex: 100-200'),
        ],
        responses: { 200: { description: 'OK' }, 400: { description: 'Parâmetros inválidos' } },
      },
    },
    '/v1/product': {
      post: {
        tags: ['Produto'],
        summary: 'Cria um produto',
        security: bearer,
        requestBody: body(productBody),
        responses: {
          201: { description: 'Criado' }, 400: { description: 'Dados inválidos' },
          401: { description: 'Token inválido' },
        },
      },
    },
    '/v1/product/{id}': {
      get: {
        tags: ['Produto'],
        summary: 'Busca produto por id',
        parameters: [id],
        responses: { 200: { description: 'OK' }, 404: { description: 'Não encontrado' } },
      },
      put: {
        tags: ['Produto'],
        summary: 'Atualiza um produto',
        security: bearer,
        parameters: [id],
        requestBody: body(productBody),
        responses: {
          204: { description: 'Atualizado' }, 400: { description: 'Dados inválidos' },
          401: { description: 'Token inválido' }, 404: { description: 'Não encontrado' },
        },
      },
      delete: {
        tags: ['Produto'],
        summary: 'Remove um produto',
        security: bearer,
        parameters: [id],
        responses: {
          204: { description: 'Removido' }, 401: { description: 'Token inválido' },
          404: { description: 'Não encontrado' },
        },
      },
    },
  },
};