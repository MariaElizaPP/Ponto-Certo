const express = require('express');
const router = express.Router();
const carrinhoController = require('../controllers/carrinhoController');

router.post('/carrinho/itens', carrinhoController.adicionarItem);
router.get('/carrinho/:cliId',carrinhoController.mostrarCarrinho );


module.exports = router;