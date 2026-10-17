const express = require('express');
const router = express.Router();
const trocaController = require('../controllers/trocaController');

router.post('/solicitar', trocaController.solicitar);
router.get('/solicitacoes', trocaController.solicitacoes);
router.patch('/solicitacoes/autorizar/:trocaId', trocaController.autorizar);
router.patch('/solicitacoes/reprovar/:trocaId', trocaController.reprovarTroca);
router.patch('/solicitacoes/confirmarRecebimento/:trocaId', trocaController.confirmarRecebimento);

module.exports = router;