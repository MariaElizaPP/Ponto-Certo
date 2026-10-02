const { CarrinhoModel } = require('../models/carrinhoModel');

class CarrinhoService {

    async adicionarItem(cliId, vprId, quantidade) {

        if (!vprId) {
            throw {
                status: 400, mensagem: 'O id da variação do produto é obrigátorio'
            };
        }

        if (!quantidade || quantidade <= 0) {

            throw { status: 400, mensagem: 'A quantidade deve ser maior que zero' };

        }


        const carrinhoModel = new CarrinhoModel();

        const precoInfo = await carrinhoModel.buscarPrecoVariacao(vprId);
        if (!precoInfo) {
            throw { status: 404, mensagem: 'Variação do produto não encontrada' };
        }


        const estoqueInfo = await carrinhoModel.buscarEstoquePorVariacao(vprId);
        if (!estoqueInfo || estoqueInfo.est_quantidade < quantidade) {
            throw { status: 400, mensagem: 'Quantidade solicitada indisponível em estoque.' };
        }

        let carrinho = await carrinhoModel.buscarCarrinhoCliente(cliId);
        let crr_id = carrinho ? carrinho.crr_id : await carrinhoModel.criarCarrinho(cliId)

        const itemExistente = await carrinhoModel.buscarItemCarrinho(crr_id, vprId);

        if (itemExistente) {
            const novaQuantidade = itemExistente.itm_quantidade + quantidade;

            if (estoqueInfo.est_quantidade < novaQuantidade) {
                throw { status: 400, mensagem: 'Quantidade solicitada indisponível em estoque' };
            }

            await carrinhoModel.atualizarQuantidadeItem(itemExistente.itm_id, novaQuantidade);
        } else {
            await carrinhoModel.inserirItem(crr_id, vprId, quantidade, precoInfo.prd_preco);
        }

        return { mensagem: 'Item adicionado ao carrinho com sucesso' };
    }

    async mostrarCarrinho(cliId) {
        if (!cliId) throw { status: 400, message: 'O id do cliente é obrigatório' };

        const carrinhoModel = new CarrinhoModel();

        const carrinho = await carrinhoModel.mostrarCarrinho(cliId);

        return carrinho;
    }

    async atualizarQuantidade(cliId, vprId, quantidade) {
        if (!vprId) {
            throw { status: 400, mensagem: 'O id da variação do produto é obrigatório.' };
        }
        if (!quantidade || quantidade <= 0) {
            throw { status: 400, mensagem: 'A quantidade deve ser maior que zero.' };
        }

        const carrinhoModel = new CarrinhoModel();

        const carrinho = await carrinhoModel.buscarCarrinhoCliente(cliId);
        if (!carrinho) {
            throw { status: 404, mensagem: 'Carrinho não encontrado para este cliente.' };
        }

        const item = await carrinhoModel.buscarItemCarrinho(carrinho.crr_id, vprId);
        if (!item) {
            throw { status: 404, mensagem: 'Item não encontrado no carrinho.' };
        }

        const estoqueInfo = await carrinhoModel.buscarEstoquePorVariacao(vprId);
        if (!estoqueInfo || estoqueInfo.est_quantidade < quantidade) {
            throw { status: 400, mensagem: 'Quantidade solicitada indisponível em estoque.' };
        }

        await carrinhoModel.atualizarQuantidadeItem(item.itm_id, quantidade);
        return {messagem:"Item atualizado com sucesso"}

    }

    async deletarItem(cliId, vprId) {
        if (!vprId) {
            throw { status: 400, mensagem: 'O id da variação do produto é obrigatório.' };
        }

        const carrinhoModel = new CarrinhoModel();

        const carrinho = await carrinhoModel.buscarCarrinhoCliente(cliId);
        if (!carrinho) {
            throw { status: 404, mensagem: 'Carrinho não encontrado para este cliente.' };
        }

        const item = await carrinhoModel.buscarItemCarrinho(carrinho.crr_id, vprId);
        if (!item) {
            throw { status: 404, mensagem: 'Item não encontrado no carrinho.' };
        }

        await carrinhoModel.deletarItem(vprId, carrinho.crr_id);

        return {messagem:"Item excluído com sucesso"}


    }

}

module.exports = { CarrinhoService };