const express = require('express');
const router = express.Router();
const trocaController = require('../controllers/trocaController');

router.post('/solicitar', trocaController.solicitar);
router.get('/solicitacoes', trocaController.solicitacoes);
router.patch('/solicitacoes/aprovar/:trocaId', trocaController.aprovarTroca);
router.patch('/solicitacoes/reprovar/:trocaId', trocaController.reprovarTroca);


module.exports = router;