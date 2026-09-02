const express = require('express');
const router = express.Router();
const enderecoController = require('../controllers/enderecoController');

router.get('/listarEnderecos/:clienteId', enderecoController.listar);
router.put('/alterarEndereco/:id', enderecoController.alterar);

module.exports = router;