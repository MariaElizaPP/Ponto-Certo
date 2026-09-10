const { CartaoModel } = require('../models/cartaoModel');

class CartaoService {
    validarLuhn(numero) {
        let soma = 0;
        let alternar = false;

        for (let i = numero.length - 1; i >= 0; i--) {
            let n = parseInt(numero[i], 10);
            if (alternar) {
                n *= 2;
                if (n > 9) n -= 9;
            }
            soma += n;
            alternar = !alternar;
        }

        return soma % 10 === 0;
    }
    async cadastrarCartao(dados) {
        const { cliId, bandeiraCartao, numeroCartao, nomeCartao, cvv, preferencial } = dados;

        if (!cliId) throw { status: 400, mensagem: "O id do cliente é obrigatório" };
        if (!numeroCartao) throw { status: 400, mensagem: "O numero do cartão é obrigatório" };
        if (!bandeiraCartao) throw { status: 400, mensagem: "A bandeira do cartão é obrigatório" };
        if (!nomeCartao) throw { status: 400, mensagem: "O nome no cartão é obrigatório" };
        if (!cvv) throw { status: 400, mensagem: "O código de segurança do cartão é obrigatório" };

        const validarNumero = await this.validarLuhn(numeroCartao);

        if (!validarNumero) {
            throw { status: 400, mensagem: "Número do cartão não é válido." };
        }

        const model = new CartaoModel();
        await model.cadastrarCartao(dados);

    }

    async listarCartoes(cliId) {
        if (!cliId) throw { status: 400, mensagem: "É necessário informar o cliente vinculado ao cartão" };
        const model = new CartaoModel();
        const cartoes = await model.listarCartoes(cliId);

        return cartoes;
    }

    async deletar(cliId, id) {
        const model = new CartaoModel();
        const cartao = await model.buscarPorId(cliId, id);
        if (!cartao) throw { status: 404, mensagem: "Cartão não encontrado" }

        const eraPreferencial = cartao.car_preferencial === true || cartao.car_preferencial === 1;

        const deletado = await model.deletar(cliId, id);
        if (!deletado) throw { status: 404, mensagem: "Cartão não encontrado" };

        if (eraPreferencial) {
            const restantes = await model.listarCartoes(cliId);
            if (restantes.length > 0) {
                await model.marcarPreferencial(cliId, restantes[0].car_id);
            }
        }

    }

    async definirPreferencial(cliId, id) {
        const model = new CartaoModel();
        const cartao = await model.buscarPorId(cliId, id);
        if (!cartao) throw { status: 404, mensagem: "Cartão não encontrado" };

        await model.limparPreferencial(cliId);
        const marcado = await model.marcarPreferencial(cliId, id);
        if (!marcado) throw { status: 500, mensagem: "Erro ao definir cartão preferencial" };

        return await model.buscarPorId(cliId, id);

    }


}

module.exports = { CartaoService };

