const express = require('express');
const router = express.Router();
const cartaoController = require('../controllers/cartaoController');

router.get('/listarCartoes/:clienteId', cartaoController.listar);
router.delete('/cliente/:clienteId/cartoes/:id', cartaoController.deletar);
router.patch('/cliente/:clienteId/definirPreferencial/:id', cartaoController.definirPreferencial);
router.post('/cadastrarCartao', cartaoController.cadastrar);

module.exports = router;