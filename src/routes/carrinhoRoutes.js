const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/carrinhoController');

router.post('/carrinho/itens', produtoController.adicionarItem);

module.exports = router;