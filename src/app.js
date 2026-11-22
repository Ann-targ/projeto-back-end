const express = require('express');

const app = express();

// Permite que a API entenda JSON
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API funcionando' });
});

module.exports = app;


