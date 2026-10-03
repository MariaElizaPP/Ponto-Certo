const express = require('express');
const clienteRoutes = require('./src/routes/clienteRoutes');
const bandeiraRoutes = require('./src/routes/bandeiraRoutes');
const enderecoRoutes = require('./src/routes/enderecoRoutes');
const cartaoRoutes = require('./src/routes/cartaoRoutes');
const produtoRoutes = require('./src/routes/produtoRoutes');
const carrinhoRoutes = require('./src/routes/carrinhoRoutes');
const freteRoutes = require('./src/routes/freteRoutes');
const pedidoRoutes = require('./src/routes/pedidoRoutes');
const categoriaRoutes = require('./src/routes/categoriaRoutes');
const marcasRoutes = require('./src/routes/marcasRoutes');
const cupomRoutes = require('./src/routes/cupomRoutes');

const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Private-Network', 'true');
  next();
});
app.use('/api', clienteRoutes);
app.use('/api', bandeiraRoutes);
app.use('/api', enderecoRoutes);
app.use('/api', cartaoRoutes);
app.use('/api', produtoRoutes);
app.use('/api', carrinhoRoutes);
app.use('/api', freteRoutes);
app.use('/api', pedidoRoutes);
app.use('/api', categoriaRoutes);
app.use('/api', marcasRoutes);
app.use('/api', cupomRoutes);

module.exports = app;