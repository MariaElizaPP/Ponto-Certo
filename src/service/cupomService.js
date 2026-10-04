const { CupomModel } = require('../models/cupomModel');

class CupomService {

    async validar(codigo, cliId) {
        if (!codigo) throw { status: 400, mensagem: 'Cupom obrigatório.' };

        const model = new CupomModel();
        const cupom = await model.buscarParaValidacao(codigo);

        if (!cupom || (cupom.cpm_cli_id != null && cupom.cpm_cli_id !== cliId)) {
            throw { status: 404, mensagem: 'Cupom não encontrado.' };
        }
        if (cupom.usado) {
            throw { status: 400, mensagem: 'Esse cupom já foi utilizado.' };
        }

        return {
            codigo: cupom.cpm_codigo,
            tipo: cupom.cpm_tipoCupom === 'T' ? 'troca' : 'promocional',
            valor: Number(cupom.cpm_valor)

        };
    }

    async listar(cliId) {
        if (!cliId) throw { status: 400, mensagem: 'O id do cliente é obrigatório.' };

        const model = new CupomModel();
        const cupons = await model.listarPorCliente(Number(cliId));

        return cupons.map(c => ({
            codigo: c.cpm_codigo,
            tipo: c.cpm_tipoCupom === 'T' ? 'troca' : 'promocional',
            valor: Number(c.cpm_valor)
        }));
    }

}



module.exports = { CupomService };