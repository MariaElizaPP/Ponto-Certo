const { EnderecoModel } = require('../models/enderecoModel');
const { CartaoModel } = require('../models/cartaoModel');
const { CarrinhoModel } = require('../models/carrinhoModel');
const { PedidoModel } = require('../models/pedidoModel');
const { CupomModel } = require('../models/cupomModel');
const freteService = require('./freteService');
const Decimal = require('decimal.js');

const MINIMO_POR_CARTAO = new Decimal(10);
const CARTOES_RECUSADOS = [4, 7]; // RN0037 - simulado

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

    async finalizarPedido(cliId, enderecoId, cartoes = [], cupons = []) {

        // validações de entrada
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

        // carrinho
        const carrinhoModel = new CarrinhoModel();
        const carrinho = await carrinhoModel.mostrarCarrinho(cliId);

        if (!carrinho || carrinho.length === 0) {
            throw { status: 400, mensagem: 'O carrinho está vazio.' };
        }

        // frete e total
        const frete = await freteService.calcular(cliId, enderecoId, carrinho);

        const subtotal = carrinho.reduce(
            (soma, item) => soma.plus(
                new Decimal(item.itm_precoUnitario).times(item.itm_quantidade)
            ),
            new Decimal(0)
        );
        const valorFrete = new Decimal(frete.valorFrete);
        const total = subtotal.plus(valorFrete);

        // cupons 
        const cupomModel = new CupomModel();
        const cuponsDb = await cupomModel.buscarPorCodigos(cupons, cliId);

        if (cuponsDb.length !== cupons.length) {
            throw { status: 400, mensagem: 'Um ou mais cupons não existem.' };
        }

        for (const cupom of cuponsDb) {
            if (cupom.cpm_tipoCupom === 'T' && cupom.cpm_cli_id !== cliId) {
                throw { status: 400, mensagem: `Cupom ${cupom.cpm_codigo} não pertence a este cliente.` };
            }
        }

        // cartões precisam existir e pertencer ao cliente
        const cartaoModel = new CartaoModel();
        for (const c of cartoes) {
            const cartao = await cartaoModel.buscarPorId(cliId, c.carId);
            if (!cartao) {
                throw { status: 400, mensagem: `Cartão ${c.carId} não encontrado para este cliente.` };
            }
        }

        // RN0033 a RN0036 - composição do pagamento
        const cuponsPag = cuponsDb.map(c => ({ ...c, valor: new Decimal(c.cpm_valor) }));
        const cartoesPag = cartoes.map(c => ({ carId: c.carId, valor: new Decimal(c.valor) }));

        if (cuponsPag.filter(c => c.cpm_tipoCupom === 'P').length > 1) {
            throw { status: 400, mensagem: 'Apenas um cupom promocional pode ser usado por compra.' };
        }

        const somaCupons = cuponsPag.reduce((s, c) => s.plus(c.valor), new Decimal(0));

        if (cuponsPag.length > 1) {
            const menor = cuponsPag.reduce((m, c) => Decimal.min(m, c.valor), cuponsPag[0].valor);
            if (somaCupons.minus(menor).greaterThanOrEqualTo(total)) {
                throw { status: 400, mensagem: 'Há cupons em excesso para esta compra. Remova um deles.' };
            }
        }

        const valorCupons = Decimal.min(somaCupons, total);
        const troco = somaCupons.minus(valorCupons);
        const restante = total.minus(valorCupons);

        const somaCartoes = cartoesPag.reduce((s, c) => s.plus(c.valor), new Decimal(0));

        if (!somaCartoes.equals(restante)) {
            throw { status: 400, mensagem: `Os cartões devem cobrir exatamente R$ ${restante.toFixed(2)}.` };
        }

        if (cartoesPag.some(c => c.valor.lessThanOrEqualTo(0))) {
            throw { status: 400, mensagem: 'O valor de cada cartão deve ser positivo.' };
        }

        if (cuponsPag.length === 0 && cartoesPag.some(c => c.valor.lessThan(MINIMO_POR_CARTAO))) {
            throw { status: 400, mensagem: 'O valor mínimo por cartão é R$ 10,00.' };
        }

        let faltando = total;
        const cuponsAplicados = cuponsPag.map(c => {
            const aplicado = Decimal.min(c.valor, faltando);
            faltando = faltando.minus(aplicado);
            return { ...c, aplicado };
        });

        // RN0037 - aceite da operadora (simulado)
        let aprovado = true;
        let motivo = null;

        for (const c of cartoesPag) {
            if (CARTOES_RECUSADOS.includes(Number(c.carId))) {
                aprovado = false;
                motivo = 'Transação negada pela operadora.';
                break;
            }
        }

        // grava o pedido
        const pedidoModel = new PedidoModel();
        const resultado = await pedidoModel.finalizarPedido(
            cliId, enderecoId, valorFrete, carrinho, total,
            cuponsAplicados, cartoesPag, aprovado, troco
        );

        if (resultado.conflito) {
            throw {
                status: 409,
                mensagem: 'A disponibilidade de alguns itens mudou. Revise o carrinho.',
                alteracoes: resultado.alteracoes
            };
        }

        return {
            pedId: resultado.pedId,
            status: aprovado ? 'APROVADA' : 'REPROVADA',
            mensagem: aprovado ? 'Compra aprovada com sucesso.' : `Compra reprovada. ${motivo}`,
            valorItens: subtotal.toNumber(),
            valorFrete: valorFrete.toNumber(),
            valorTotal: total.toNumber(),
            prazoDias: frete.prazoDias,
            cupomTrocaGerado: resultado.cupomTroca
        };
    }
}

module.exports = { PedidoService }