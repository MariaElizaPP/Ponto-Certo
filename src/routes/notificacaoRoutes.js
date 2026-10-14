const express = require('express');
const router = express.Router();
const notificacaoController = require('../controllers/notificacaoController');

router.get('/notificacoes/:cliId', notificacaoController.listarNaoLidas);
router.patch ('/notificacoes/:cliId/:ntfId', notificacaoController.marcarLida);

module.exports = router;
