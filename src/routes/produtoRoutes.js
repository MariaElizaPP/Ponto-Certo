const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

router.get('/vitrine', produtoController.listarEstoque);
router.get('/detalhesProduto/:id', produtoController.detalhesProduto);


module.exports = router;