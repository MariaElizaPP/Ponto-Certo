const { FreteService }  = require('../service/freteService');

async function calcular(req, res) {
    try {
        const { cliId, enderecoId, itens } = req.body;

        const service = new FreteService();
        const resultado = await service.calcular(cliId, enderecoId, itens);
        return res.status(200).json(resultado);

    } catch (error) {
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao calcular frete.' });
    }
}

async function estimar(req, res) {
    try {
        const { estado, itens } = req.body;

        const service = new FreteService();
        const resultado = await service.estimar(estado, itens);
        return res.status(200).json(resultado);

    } catch (error) {
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao calcular frete.' });
    }
}

module.exports = {calcular, estimar};
