const {BandeiraModel} = require('../models/bandeiraModel');

async function listar(req, res) {
    try {
        const model = new BandeiraModel();
        const bandeiras = await model.listar();
        return res.status(200).json(bandeiras);
    } catch (error) {
        console.log(error);
        return res.status(500).json({mensagem: 'Erro ao buscar bandeiras.'})
    }
}

module.exports = {listar};