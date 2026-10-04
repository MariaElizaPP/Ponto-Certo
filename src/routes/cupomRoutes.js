const express = require('express');
const router = express.Router();
const cupomController = require('../controllers/cupomController');

router.get('/validarCupom/:codigo', cupomController.validar);
router.get('/listarCupons/:cliId', cupomController.listar);

module.exports = router;