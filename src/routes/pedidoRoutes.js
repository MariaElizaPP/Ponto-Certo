const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.get('/listarDadosPedido/:cliId', pedidoController.listarDadosPagamento);
router.post('/finalizar', pedidoController.finalizarPedido);

module.exports = router;