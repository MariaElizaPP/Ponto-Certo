const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

router.post('/cadastrarCliente', clienteController.cadastrar);
router.put('/cliente/:id', clienteController.alterar);
router.put('/cliente/:id/senha', clienteController.alterarSenha);
router.get('/listarDados/:id', clienteController.listarDados);
router.get('/clientes', clienteController.listarTodos);
router.get('/dadosCadastrais/:clienteId', clienteController.dadosCadastrais);

module.exports = router;