const { ProdutoService } = require('../service/produtoService');

async function listarEstoque(req, res) {
    try {
        const service = new ProdutoService();
        const { categorias, marcas, faixasPreco } = req.query;
        const produtos = await service.listarEstoque({categorias, marcas, faixasPreco});
        return res.status(200).json(produtos);

    } catch (error) {
        console.log(error);
        return res.status(500).json({mensagem: 'Erro ao buscar os produtos'})
    }
    
}

async function detalhesProduto(req, res) {

    try{
        const service = new ProdutoService();
        const id = req.params.id;

        const detalhesProduto = await service.detalhesProduto(id);

        return res.status(200).json(detalhesProduto);

    }catch (error) {
        console.error(error);
        if (error.status) {
            return res.status(error.status).json({ mensagem: error.mensagem })
        }
        return res.status(500).json({ mensagem: "Erro listar os dados do produto" });
    }
    
}

module.exports = {listarEstoque, detalhesProduto}