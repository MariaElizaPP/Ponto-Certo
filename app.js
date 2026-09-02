const express = require('express');
const clienteRoutes = require('./src/routes/clienteRoutes');
const bandeiraRoutes = require('./src/routes/bandeiraRoutes');
const enderecoRoutes = require('./src/routes/enderecoRoutes');
const cartaoRoutes = require('./src/routes/cartaoRoutes');

const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use('/api', clienteRoutes);
app.use('/api', bandeiraRoutes);
app.use('/api', enderecoRoutes);
app.use('/api', cartaoRoutes);

module.exports = app;