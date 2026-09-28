const { EnderecoModel } = require('../models/enderecoModel');
const { CartaoModel } = require('../models/cartaoModel');
const { CarrinhoModel } = require('../models/carrinhoModel');
const { PedidoModel } = require('../models/pedidoModel');
const { CupomModel } = require('../models/cupomModel');
const freteService = require('./freteService');
const Decimal = require('decimal.js');

class PedidoService {
    async listarDadosPagamento(cliId) {

        if (!cliId) {
            throw { status: 400, mensagem: 'O id do cliente é obrigatório.' };
        }

        const enderecoModel = new EnderecoModel();
        const enderecosEntrega = await enderecoModel.listarEnderecosEntrega(cliId);

        const cartaoModel = new CartaoModel();
        const cartoes = await cartaoModel.listarCartoes(cliId);

        const carrinhoModel = new CarrinhoModel();
        const carrinho = await carrinhoModel.mostrarCarrinho(cliId);


        return {
            enderecos: enderecosEntrega,
            cartoes,
            carrinho
        }
    }

    async finalizarPedido( cliId, enderecoId, cartoes = [], cupons = [] ) {
        
        if (!cliId || !enderecoId) {
            throw { status: 400, mensagem: 'Cliente e endereço de entrega são obrigatórios.' };
        }

        if (!Array.isArray(cartoes) || !Array.isArray(cupons)) {
            throw { status: 400, mensagem: 'Cartões e cupons devem ser listas.' };
        }

        if (cartoes.length === 0 && cupons.length === 0) {
            throw { status: 400, mensagem: 'Selecione ao menos uma forma de pagamento.' };
        }

        if (new Set(cupons).size !== cupons.length) {
            throw { status: 400, mensagem: 'Cupom informado mais de uma vez.' };
        }

        if (new Set(cartoes.map(c => c.carId)).size !== cartoes.length) {
            throw { status: 400, mensagem: 'Cartão informado mais de uma vez.' };
        }

        
        const carrinhoModel = new CarrinhoModel();
        const carrinho = await carrinhoModel.mostrarCarrinho(cliId);

        if (!carrinho || carrinho.length === 0) {
            throw { status: 400, mensagem: 'O carrinho está vazio.' };
        }

        const frete = await freteService.calcular(cliId, enderecoId, carrinho);

        const subtotal = carrinho.reduce(
            (total, item) => total.plus(
                new Decimal(item.itm_precoUnitario).times(item.itm_quantidade)
            ),
            new Decimal(0)
        );
        const valorFrete = new Decimal(frete.valorFrete);
        const total = subtotal.plus(valorFrete);

        return {
            valorItens: subtotal.toNumber(),
            valorFrete: valorFrete.toNumber(),
            valorTotal: total.toNumber()
        };
    }
}

module.exports = { PedidoService }