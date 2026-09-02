const { ClienteModel } = require('../models/clienteModel');
const { UserService } = require('../service/clienteService');

async function cadastrar(req, res) {
    try {
        const service = new UserService();
        await service.cadastrarCliente(req.body);

        return res.status(201).json({ mensagem: 'Cliente cadastrado com sucesso' })
    } catch (error) {
        console.error(error);

        if (error.status) {
            return res.status(error.status).json({ mensagem: error.mensagem });
        }

        return res.status(500).json({ mensagem: 'Erro ao cadastrar cliente' });
    }
}

async function alterar(req, res) {

    try {
        const service = new UserService();
        const id = req.params.id;
        await service.alterarCliente(id, req.body);

        return res.status(200).json({ mensagem: 'Cliente alterado com sucesso' });
    } catch (error) {
        console.error(error);
        if (error.status) {
            return res.status(error.status).json({ mensagem: error.mensagem })
        }
        return res.status(500).json({ mensagem: "Erro ao alterar cliente" });
    }

}

async function alterarSenha(req, res) {

    try {

        const service = new UserService();
        const id = req.params.id;
        const {novaSenha} = req.body;

        await service.alterarSenha(id, novaSenha);

        return res.status(200).json({mensagem: 'Senha alterada com sucesso'});
    } catch (error) {
        console.error(error);
        if (error.status) {
            return res.status(error.status).json({ mensagem: error.mensagem })
        }
        return res.status(500).json({ mensagem: "Erro ao alterar a senha" });
    }
}

async function listarDados(req, res){
    try {
        const service = new UserService();
        const id = req.params.id;

        const dadosCadastrais = await service.listarDados(id);

        return res.status(200).json({ dadosCadastrais });

    } catch (error) {
        console.error(error);
        if (error.status) {
            return res.status(error.status).json({ mensagem: error.mensagem })
        }
        return res.status(500).json({ mensagem: "Erro listar os dados do cliente" });
    }
}

async function listarTodos(req, res) {
    try {
        const model = new ClienteModel();
        const clientes = await model.listarTodos();
        return res.status(200).json(clientes);
    } catch (error) {
        console.log(error);
        return res.status(500).json({mensagem: 'Erro ao buscar os clientes.'})
    }
}

async function dadosCadastrais(req, res){
    try {
        const service = new UserService();
        const cliente = await service.dadosCadastrais(req.params.clienteId);
        return res.status(200).json(cliente);
    } catch (error) {
        console.log(error);
        return res.status(500).json({mensagem: 'Erro ao buscar os dados do cliente.'})
    }
}




module.exports = { cadastrar, alterar, alterarSenha, listarDados, listarTodos, dadosCadastrais }