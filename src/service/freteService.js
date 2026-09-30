const { EnderecoModel } = require('../models/enderecoModel');

class FreteService {
    calcularFrete(estado, totalItens) {
        const tabela = {
            'AC': { base: 29.50, prazo: 10 },
            'AM': { base: 28.00, prazo: 11 },
            'AL': { base: 24.50, prazo: 8 },
            'AP': { base: 29.50, prazo: 6 },
            'BA': { base: 21.00, prazo: 4 },
            'CE': { base: 24.90, prazo: 5 },
            'DF': { base: 18.90, prazo: 7 },
            'ES': { base: 17.90, prazo: 3 },
            'GO': { base: 18.90, prazo: 4 },
            'MA': { base: 26.90, prazo: 5 },
            'MT': { base: 22.90, prazo: 4 },
            'MS': { base: 19.90, prazo: 3 },
            'MG': { base: 25.90, prazo: 3 },
            'PA': { base: 26.00, prazo: 5 },
            'PB': { base: 24.90, prazo: 5 },
            'PR': { base: 17.50, prazo: 7 },
            'PE': { base: 24.90, prazo: 4 },
            'PI': { base: 25.90, prazo: 13 },
            'RJ': { base: 16.50, prazo: 2 },
            'RN': { base: 24.50, prazo: 5 },
            'RS': { base: 19.00, prazo: 4 },
            'RO': { base: 27.90, prazo: 5 },
            'RR': { base: 32.90, prazo: 7 },
            'SC': { base: 18.90, prazo: 3 },
            'SP': { base: 11.90, prazo: 2 },
            'SE': { base: 23.00, prazo: 4 },
            'TO': { base: 22.90, prazo: 10 }, 
        };

        const config = tabela[estado] || { base: 29.90, prazo: 10 };
        const adicionalPorItem = 1.50;
        const valorFrete = config.base + (totalItens - 1) * adicionalPorItem;

        return { valorFrete, prazoDias: config.prazo };
    }

    somarQuantidades(itens) {
        return itens.reduce((total, item) => total + item.itm_quantidade, 0);
    }

    //pagamento
    async calcular(cliId, enderecoId, itens) {
        if (!enderecoId || !itens || itens.length === 0) {
            return res.status(400).json({ erro: 'Endereço e itens são obrigatórios.' });
        }

        const enderecoModel = new EnderecoModel();

        const endereco = await enderecoModel.buscarId(enderecoId, cliId);
        
        const total = this.somarQuantidades(itens);
        return this.calcularFrete(endereco.end_estado, total);

    }

    //carrinho
    //SP, [itens: itm_id: 1, itm_id: 2]
    async estimar(estado, itens) {
        if (!estado || !itens?.length) throw { status: 400, mensagem: 'Estado e itens são obrigatórios' };
        
        const total = this.somarQuantidades(itens);

        return this.calcularFrete(estado, total);
    }

}



module.exports = { FreteService };