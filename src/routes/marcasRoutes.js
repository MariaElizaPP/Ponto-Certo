const express = require('express');
const router = express.Router();
const marcaController = require('../controllers/marcaController');

router.get('/marcas', marcaController.listarMarcas);

module.exports = router;