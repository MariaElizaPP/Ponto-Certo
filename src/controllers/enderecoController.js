const { EnderecoService } = require('../service/enderecoService');


async function alterar(req, res) {
    try {
        const service = new EnderecoService();
        const endereco = await service.alterarEndereco(req.params.id, req.body);

        return res.status(200).json({ mensagem: 'Endereço atualizado com sucesso.', endereco});
    } catch (error) {
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao atualizar endereço.' });
    }
}

async function listar(req, res) {
    try{
        const service = new EnderecoService();
        const enderecos = await service.listar(req.params.clienteId);

        return res.status(200).json(enderecos);
    }catch(error){
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao listar os endereços.' });
    }
}


module.exports = { alterar, listar }