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

async function cadastrar(req, res) {
    try {
        const service = new EnderecoService();
        const endereco = await service.cadastrarEndereco(req.body);

        return res.status(200).json({ mensagem: 'Endereço cadastrado com sucesso.', endereco});
    } catch (error) {
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao cadastrar o endereço.' });
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

async function buscarPorId(req, res) {
    try{
        const service = new EnderecoService();
        const enderecos = await service.buscarPorId(req.params.clienteId, req.params.id);

        return res.status(200).json(enderecos);
    }catch(error){
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao listar os endereços.' });
    }
}

async function deletar(req, res) {
    try {
        const service = new EnderecoService();
        await service.deletar(req.params.clienteId, req.params.id);

        return res.status(200).json({ mensagem: 'Endereço removido com sucesso.'});
    } catch (error) {
        console.error(error);
        if (error.status) return res.status(error.status).json({ mensagem: error.mensagem });
        return res.status(500).json({ mensagem: 'Erro ao remover o endereço.' });
    }
}


module.exports = { alterar, listar, buscarPorId, deletar, cadastrar }