const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use('/media', express.static('media'));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'API funcionando' });
});

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/v1/user', userRoutes);
app.use('/v1/category', categoryRoutes);
app.use('/v1/product', productRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

module.exports = app;