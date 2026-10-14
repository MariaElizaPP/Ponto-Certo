
const { CarrinhoModel } = require('../models/carrinhoModel');
const { EstoqueModel } = require('../models/estoqueModel');
const parametros = require('../util/parametros');

class CarrinhoService {

    async expirarCarrinhos() {
        const model = new CarrinhoModel();
        return model.expirarCarrinhos();
    }

    async avisarExpiracao() {
        const model = new CarrinhoModel();

        return model.avisarExpiracaoProxima(
            parametros.carrinhoMinutosAviso
        );
    }

    async bloquear(estoqueModel, vprId, quantidade) {
        const ok = await estoqueModel.bloquear(vprId, quantidade);

        if (!ok) {
            throw {
                status: 400,
                mensagem: 'Quantidade solicitada indisponível em estoque.'
            };
        }
    }

    async adicionarItem(cliId, vprId, quantidade) {
        if (!cliId) {
            throw {
                status: 400,
                mensagem: 'O id do cliente é obrigatório.'
            };
        }

        if (!vprId) {
            throw {
                status: 400,
                mensagem: 'O id da variação do produto é obrigatório.'
            };
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            throw {
                status: 400,
                mensagem: 'A quantidade deve ser um número inteiro maior que zero.'
            };
        }

        const model = new CarrinhoModel();
        const estoqueModel = new EstoqueModel();

        await this.expirarCarrinhos();

        const precoInfo = await model.buscarPrecoVariacao(vprId);

        if (!precoInfo) {
            throw {
                status: 404,
                mensagem: 'Variação do produto não encontrada.'
            };
        }

        const carrinho = await model.buscarCarrinhoCliente(cliId);

        const crrId = carrinho
            ? carrinho.crr_id
            : await model.criarCarrinho(cliId);

        const item = await model.buscarItemCarrinho(crrId, vprId);

        const tempoMin = parametros.carrinhoTempoBloqueioMin;

        await this.bloquear(estoqueModel, vprId, quantidade);

        try {
            if (!item) {
                await model.inserirItem(
                    crrId,
                    vprId,
                    quantidade,
                    precoInfo.prd_preco
                );
            } else if (item.itm_expirado) {
                await model.reativarItem(
                    item.itm_id,
                    quantidade,
                    precoInfo.prd_preco
                );
            } else {
                await model.atualizarQuantidadeItem(
                    item.itm_id,
                    item.itm_quantidade + quantidade
                );
            }

            await model.renovarBloqueio(crrId, tempoMin);

        } catch (error) {
            await estoqueModel.liberar(vprId, quantidade);
            throw error;
        }

        return {
            mensagem: 'Item adicionado ao carrinho com sucesso.'
        };
    }

    async mostrarCarrinho(cliId) {
        if (!cliId) {
            throw {
                status: 400,
                mensagem: 'O id do cliente é obrigatório.'
            };
        }

        const model = new CarrinhoModel();

        await this.expirarCarrinhos();

        const tempoMin = parametros.carrinhoTempoBloqueioMin;
        const carrinho = await model.buscarCarrinhoCliente(cliId);

        if (!carrinho) {
            return {
                itens: [],
                removidos: [],
                tempoLimiteMinutos: tempoMin,
                expiraEmMs: null,
                agoraMs: Date.now(),
                podeComprar: false
            };
        }

        const todos = await model.mostrarCarrinho(cliId);

        const itens = todos.filter(
            item => Number(item.itm_expirado) === 0
        );

        const removidos = todos.filter(
            item => Number(item.itm_expirado) === 1
        );

        const prazo = await model.buscarPrazo(carrinho.crr_id);

        return {
            carrinhoId: carrinho.crr_id,
            itens,
            removidos,
            tempoLimiteMinutos: tempoMin,
            expiraEmMs: itens.length > 0 ? prazo.expiraEmMs : null,
            agoraMs: prazo.agoraMs,

            podeComprar: itens.length > 0 && removidos.length === 0
        };
    }

    async atualizarQuantidade(cliId, vprId, quantidade) {
        if (!vprId) {
            throw {
                status: 400,
                mensagem: 'O id da variação do produto é obrigatório.'
            };
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            throw {
                status: 400,
                mensagem: 'A quantidade deve ser um número inteiro maior que zero.'
            };
        }

        const model = new CarrinhoModel();
        const estoqueModel = new EstoqueModel();

        const carrinho = await model.buscarCarrinhoCliente(cliId);

        if (!carrinho) {
            throw {
                status: 404,
                mensagem: 'Carrinho não encontrado para este cliente.'
            };
        }

        const item = await model.buscarItemCarrinho(
            carrinho.crr_id,
            vprId
        );

        if (!item || Number(item.itm_expirado) === 1) {
            throw {
                status: 404,
                mensagem: 'Item ativo não encontrado no carrinho.'
            };
        }

        const diferenca = quantidade - item.itm_quantidade;

        if (diferenca > 0) {
            await this.bloquear(estoqueModel, vprId, diferenca);
        } else if (diferenca < 0) {
            await estoqueModel.liberar(vprId, -diferenca);
        }

        try {
            await model.atualizarQuantidadeItem(item.itm_id, quantidade);
        } catch (error) {
            if (diferenca > 0) {
                await estoqueModel.liberar(vprId, diferenca);
            } else if (diferenca < 0) {
                await this.bloquear(estoqueModel, vprId, -diferenca);
            }

            throw error;
        }

        return {
            mensagem: 'Quantidade atualizada com sucesso.'
        };
    }

    async deletarItem(cliId, vprId) {
        if (!vprId) {
            throw {
                status: 400,
                mensagem: 'O id da variação do produto é obrigatório.'
            };
        }

        const model = new CarrinhoModel();
        const estoqueModel = new EstoqueModel();

        const carrinho = await model.buscarCarrinhoCliente(cliId);

        if (!carrinho) {
            throw {
                status: 404,
                mensagem: 'Carrinho não encontrado para este cliente.'
            };
        }

        const item = await model.buscarItemCarrinho(
            carrinho.crr_id,
            vprId
        );

        if (!item) {
            throw {
                status: 404,
                mensagem: 'Item não encontrado no carrinho.'
            };
        }

        if (Number(item.itm_expirado) === 0) {
            await estoqueModel.liberar(vprId, item.itm_quantidade);
        }

        await model.deletarItem(vprId, carrinho.crr_id);

        return {
            mensagem: 'Item excluído com sucesso.'
        };
    }

    async validarCarrinhoParaCompra(cliId) {
        const carrinho = await this.mostrarCarrinho(cliId);

        if (!carrinho.podeComprar) {
            throw {
                status: 409,
                mensagem:
                    'O carrinho está vazio ou possui itens expirados. ' +
                    'Adicione novamente os produtos expirados ou descarte-os para comprar.'
            };
        }

        return carrinho;
    }
}

module.exports = { CarrinhoService };
