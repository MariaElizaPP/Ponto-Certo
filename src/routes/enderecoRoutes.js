const express = require('express');
const router = express.Router();
const enderecoController = require('../controllers/enderecoController');

router.get('/listarEnderecos/:clienteId', enderecoController.listar);
router.post('/cadastrarEndereco', enderecoController.cadastrar);
router.put('/alterarEndereco/:id', enderecoController.alterar);
router.get('/buscarEndereco/:clienteId/:id', enderecoController.buscarPorId);
router.delete('/deletarEndereco/:clienteId/:id', enderecoController.deletar);

module.exports = router;