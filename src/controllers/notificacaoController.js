const { NotificacaoService } = require('../service/notificacaoService');

async function listarNaoLidas(req, res) {
    try {
        const { cliId } = req.params;
        const service = new NotificacaoService();
        const resultado = await service.listarNaoLidas(cliId);
        return res.status(200).json(resultado);
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao listar notificações' });
    }
}

async function marcarLida(req, res) {
    try {
        const { cliId, ntfId } = req.params;
        const service = new NotificacaoService();
        const resultado = await service.marcarLida(ntfId, cliId);
        return res.status(200).json(resultado);
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao marcar notificação como lida' });
    }
}

async function criar(req, res) {
    try {
        const { cliId, mensagem } = req.body;
        const service = new NotificacaoService();
        const resultado = await service.criar(cliId, mensagem);
        return res.status(201).json(resultado);
    } catch (error) {
        console.log(error);
        return res.status(error.status || 500).json({ mensagem: error.mensagem || 'Erro ao criar notificação' });
    }
}

module.exports = { listarNaoLidas, marcarLida, criar };