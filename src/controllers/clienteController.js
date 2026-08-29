const { UserService } = require('../service/clienteService');

async function cadastrar(req, res) {
    try {
        const service = new UserService();
        await service.cadastrarCliente(req.body);

        return res.status(201).json({mensagem: 'Cliente cadastrado com sucesso'})
    } catch (error) {
        console.error(error);

        if(error.status) {
            return res.status(error.status).json({mensagem: error.mensagem});
        }

        return res.status(500).json({ mensagem: 'Erro ao cadastrar cliente' });
    }
}


module.exports = { cadastrar }