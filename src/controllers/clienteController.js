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

async function alterarStatus(req, res) {

    try {
        const service = new UserService();
        const {ativo} = req.body
        await service.alterarStatus(req.params.clienteId, ativo);

        return res.status(200).json({ mensagem: 'Status do cliente alterado com sucesso' });
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

async function buscarCliente(req, res){
    try {
        const service = new UserService();
        
        const cliente = await service.buscarCliente(req.params.clienteId);

        return res.status(200).json(cliente);
    } catch (error) {
        console.error(error);
        if (error.status) {
            return res.status(error.status).json({ mensagem: error.mensagem })
        }
        return res.status(500).json({ mensagem: "Erro ao buscar o cliente" });
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
        const service = new UserService();
        const {genero, dataNascimento} = req.query;
        const clientes = await service.listarClientes({genero,dataNascimento});
        return res.status(200).json(clientes);
    } catch (error) {
        console.log(error);
        return res.status(500).json({mensagem: 'Erro ao buscar os clientes'})
    }
}

async function dadosCadastrais(req, res){
    try {
        const service = new UserService();
        const cliente = await service.dadosCadastrais(req.params.clienteId);
        return res.status(200).json(cliente);
    } catch (error) {
        console.log(error);
        return res.status(500).json({mensagem: 'Erro ao buscar os dados do cliente.'});
    }
}

async function deletarCliente(req, res) {
    try{
        const service = new UserService();
        const id = req.params.id;
        await service.deletarCliente(id);

        return res.status(200).json({mensagem: 'Cliente excluído com sucesso'});


    }catch (error) {
        console.error(error);
        if (error.status) {
            return res.status(error.status).json({ mensagem: error.mensagem })
        }
        return res.status(500).json({ mensagem: "Erro ao excluir o cliente" });
    }
}


module.exports = { cadastrar, alterar, buscarCliente, alterarSenha, listarDados, listarTodos, dadosCadastrais, alterarStatus, deletarCliente };