const { ProdutoModel } = require('../models/produtoModel');

class ProdutoService {
    async listarEstoque(filtros) {
        const produtoModel = new ProdutoModel();
        return produtoModel.listarEstoque(filtros);

    }

    async detalhesProduto(id) {
        const produtoModel = new ProdutoModel();
        if (!id) {
            throw { status: 400, mensagem: 'O id do produto é obrigatório.' };
        }
        const detalhesProduto = await produtoModel.detalhesProduto(id);

        return {

            id: detalhesProduto[0].prd_id,
            nome: detalhesProduto[0].prd_nome,
            preco: detalhesProduto[0].prd_preco,
            descricao: detalhesProduto[0].prd_descricao,
            imagemProduto: detalhesProduto[0].prd_imgUrl,
            variacoes: detalhesProduto.map(detalhesProduto => ({
                id: detalhesProduto.vpr_id,
                cor: detalhesProduto.vpr_cor,
                tamanho: detalhesProduto.vpr_tamanho,
                sku: detalhesProduto.vpr_sku,
                imagemUrl: detalhesProduto.vpr_imgUrl
            }))

        };
    }
}

module.exports = { ProdutoService };