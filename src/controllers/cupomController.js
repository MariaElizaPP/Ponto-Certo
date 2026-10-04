const { CupomService } = require('../service/cupomService');


async function validar(req, res) {
    try {
        const service = new CupomService();
        const cupom  = await service.validar(req.params.codigo, req.query.cliId);

        return res.status(200).json(cupom);
    } catch (error) {
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao buscar o cupom.' });
    }
}

async function listar(req, res) {
    try {
        const service = new CupomService();
        const cupons = await service.listar(req.params.cliId);

        return res.status(200).json(cupons);
    } catch (error) {
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao listar os cupons.' });
    }
}




module.exports = { validar,listar }