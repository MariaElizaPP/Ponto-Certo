const express = require('express');
const router = express.Router();
const exportacaoController = require('../controllers/exportacaoController');

router.get('/exportacao/vendas', exportacaoController.vendas);

module.exports = router;