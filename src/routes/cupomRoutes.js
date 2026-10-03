const express = require('express');
const router = express.Router();
const cupomController = require('../controllers/cupomController');

router.get('/validarCupom/:codigo', cupomController.validar);

module.exports = router;