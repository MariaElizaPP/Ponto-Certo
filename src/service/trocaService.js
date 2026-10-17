const { TrocaModel } = require('../models/trocaModel');
const { PedidoModel } = require('../models/pedidoModel');


class TrocaService {
    async solicitar(cliId, pedidoId, itens) {
        const model = new TrocaModel();

        if (!cliId) {
            throw {
                status: 400, mensagem: 'O id do cliente é obrigatório.'
            };
        }

        if (!pedidoId) {
            throw {
                status: 400, mensagem: 'O id do pedido é obrigatório.'
            };
        }

        if (!Array.isArray(itens) || itens.length === 0) {
            throw { status: 400, mensagem: 'Deve haver um ou mais itens para troca' };
        }

        for (const item of itens) {
            if (!item.itemId || !Number.isInteger(item.quantidade) || item.quantidade <= 0) {
                throw { status: 400, mensagem: 'Cada item deve ter itemId e quantidade inteira maior que zero.' };
            }
        }

        const pedidoModel = new PedidoModel();
        const pedido = await pedidoModel.buscarPedido(cliId, pedidoId);
        if (!pedido) {
            throw { status: 409, mensagem: 'O pedido não foi encontrado' };
        }

        if (pedido.stp_status != "ENTREGUE") {
            throw { status: 400, mensagem: 'O pedido não possui o status "ENTREGUE"' };
        }

        const statusId = await model.buscarStatusId("EM TROCA");

        const dataSolicitacao = new Date();

        await model.solicitar(statusId, pedidoId, itens, dataSolicitacao);

        return { mensagem: "Troca solicitada com sucesso." };

    }

    async solicitacoes() {

        const model = new TrocaModel();

        return model.exibirSolicitacoes();

    }

    async autorizar(trocaId) {

        if (!trocaId) {
            throw { status: 400, mensagem: "O id da solicitação de troca é obrigatório" }
        }

        const model = new TrocaModel();
        const statusPendenteId = await model.buscarStatusId('EM TROCA');
        const statusAprovadoId = await model.buscarStatusId('TROCA AUTORIZADA');

        await model.autorizarTroca(trocaId, statusAprovadoId, statusPendenteId);
        return { mensagem: "Troca autorizada com sucesso" };

    }

    async confirmarRecebimento(trocaId, retornaEstoque) {
        if (!trocaId) {
            throw { status: 400, mensagem: 'O id da solicitação de troca é obrigatório' };
        }
        if (typeof retornaEstoque !== 'boolean') {
            throw { status: 400, mensagem: 'Informe se os itens devem retornar ao estoque (retornaEstoque: true ou false).' };
        }

        const model = new TrocaModel();
        const statusAutorizadaId = await model.buscarStatusId('TROCA AUTORIZADA');
        const statusTrocadoId = await model.buscarStatusId('TROCADO');

        await model.confirmarRecebimento(trocaId, statusTrocadoId, statusAutorizadaId, retornaEstoque);
        return { mensagem: 'Recebimento confirmado com sucesso' };
    }


    async reprovar(trocaId) {
        if (!trocaId) {
            throw { status: 400, mensagem: "O id da solicitação de troca é obrigatório" };
        }

        const model = new TrocaModel();
        const statusPendenteId = await model.buscarStatusId("EM TROCA");
        const statusRecusadoId = await model.buscarStatusId("RECUSADO");

        await model.reprovar(trocaId, statusRecusadoId, statusPendenteId);

        return { mensagem: "Troca reprovada com sucesso" };
    }
}

module.exports = { TrocaService };