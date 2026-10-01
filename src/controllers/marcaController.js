const {MarcasModel} = require ('../models/marcasModel');

async function listarMarcas(req, res) {

    try {
        const model = new MarcasModel();
        const marcas = await model.listarMarcas();
        return res.status(200).json(marcas);
    } catch (error) {
        console.log(error);
        return res.status(500).json({mensagem: 'Erro ao buscar marcas'});
        
    }
}

module.exports = {listarMarcas};