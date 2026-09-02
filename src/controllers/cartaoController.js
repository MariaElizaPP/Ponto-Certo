const { CartaoService } = require('../service/cartaoService');


async function cadastrar(req, res) {
    try {
        const service = new CartaoService();
        const cartao = await service.cadastrarCartao(req.body);

        return res.status(200).json({ mensagem: 'Cartão adicionado com sucesso.', cartao});
    } catch (error) {
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao adicionar o cartão.' });
    }
}

async function deletar(req, res) {
    try {
        const service = new CartaoService();
        await service.deletar(req.params.clienteId, req.params.id);

        return res.status(200).json({ mensagem: 'Cartão removido com sucesso.'});
    } catch (error) {
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao remover o cartão.' });
    }
}

async function listar(req, res) {
    try{
        const service = new CartaoService();
        const cartoes = await service.listarCartoes(req.params.clienteId);

        return res.status(200).json(cartoes);
    }catch(error){
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao listar os endereços.' });
    }
}

async function definirPreferencial(req, res) {
    try{
        const service = new CartaoService();
        const cartao = await service.definirPreferencial(req.params.clienteId, req.params.id);

        return res.status(200).json(cartao);
    }catch(error){
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao definir o endereço como preferencial.' });
    }
}


module.exports = { cadastrar, deletar, listar, definirPreferencial }