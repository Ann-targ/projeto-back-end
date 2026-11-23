# Projeto Back-end - Digital Store

API REST em Node.js para uma loja virtual, com cadastro de usuários, categorias e produtos, autenticação com JWT e banco de dados MySQL.

**Autora:** ANNE CAROLINE DA SILVA OLIVEIRA

## Tecnologias

- Node.js e Express
- MySQL e Sequelize (com migrations)
- JWT (jsonwebtoken) e bcryptjs

## Pré-requisitos

- Node.js instalado
- MySQL instalado e em execução

## Como rodar o projeto

1. Clone o repositório e entre na pasta:

```bash
git clone https://github.com/Ann-targ/projeto-back-end.git
cd projeto-back-end
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o banco de dados no MySQL:

```sql
CREATE DATABASE projeto_backend;
```

4. Copie o arquivo `.env.example` para `.env` e preencha com a sua senha do MySQL:

```bash
copy .env.example .env
```

5. Crie as tabelas com as migrations:

```bash
npx sequelize-cli db:migrate
```

6. Inicie o servidor:

```bash
npm run dev
```

A API fica disponível em `http://localhost:3000`.

## Estrutura de pastas

```
src/
  config/       conexão com o banco
  controllers/  regras de cada rota
  middleware/   verificação do token JWT
  migrations/   criação das tabelas
  models/       modelos do Sequelize
  routes/       definição das rotas
  app.js        configuração do Express
  server.js     inicialização do servidor
```

## Autenticação

As rotas POST, PUT e DELETE (exceto cadastro de usuário e geração de token) exigem o cabeçalho:

```
Authorization: Bearer <token>
```

O token é obtido em `POST /v1/user/token`.

## Endpoints

### Usuário

| Método | Rota | Token | Resposta de sucesso |
|---|---|---|---|
| GET | /v1/user/:id | não | 200 |
| POST | /v1/user | não | 201 |
| PUT | /v1/user/:id | sim | 204 |
| DELETE | /v1/user/:id | sim | 204 |
| POST | /v1/user/token | não | 200 |

### Categoria

| Método | Rota | Token | Resposta de sucesso |
|---|---|---|---|
| GET | /v1/category/search | não | 200 |
| GET | /v1/category/:id | não | 200 |
| POST | /v1/category | sim | 201 |
| PUT | /v1/category/:id | sim | 204 |
| DELETE | /v1/category/:id | sim | 204 |

### Produto

| Método | Rota | Token | Resposta de sucesso |
|---|---|---|---|
| GET | /v1/product/search | não | 200 |
| GET | /v1/product/:id | não | 200 |
| POST | /v1/product | sim | 201 |
| PUT | /v1/product/:id | sim | 204 |
| DELETE | /v1/product/:id | sim | 204 |

Filtros da busca de produtos: `limit`, `page`, `match`, `category_ids` e `price-range`.

## Códigos de erro

- 400: dados inválidos ou token não enviado
- 401: token inválido
- 404: item não encontrado
- 500: erro interno do servidor

## Documentação da API (swagger)

Com o servidor rodando, acesse 'http://localhost//;3000/api-docs'.