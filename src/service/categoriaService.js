const {CategoriaModel} = require('../models/categoriaModel');

class CategoriaService{
    async listar() {
        const model = new CategoriaModel();
        const categorias = await model.listar();

        return categorias;
    }
}

module.exports = {CategoriaService};