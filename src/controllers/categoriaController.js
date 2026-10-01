const {CategoriaService} = require('../service/categoriaService');

async function listar(req, res) {
    try {
        const service = new CategoriaService();
        const categorias = await service.listar();
        return res.status(200).json(categorias);
    } catch (error) {
        console.log(error);
        return res.status(500).json({mensagem: 'Erro ao buscar categorias.'})
    }
}

module.exports = {listar};