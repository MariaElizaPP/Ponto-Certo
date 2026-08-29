const express = require('express');
const clienteRoutes = require('./src/routes/clienteRoutes');
const bandeiraRoutes = require('./src/routes/bandeiraRoutes');

const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
app.use('/api', clienteRoutes);
app.use('/api', bandeiraRoutes);

module.exports = app;