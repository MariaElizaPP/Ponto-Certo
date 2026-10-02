const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.get('/listarDadosPedido/:cliId', pedidoController.listarDadosPagamento);
router.post('/finalizar', pedidoController.finalizarPedido);
router.get('/historico/:cliId', pedidoController.historico);
router.patch('/pedido/:pedId/:acao', pedidoController.atualizarPedido);

module.exports = router;