const {NotificacaoService} = require ('../service/notificacaoService');

async function listarNaoLidas(req, res) {

    try {
        const service = new NotificacaoService();

        const resultado = await service.listarNaoLidas(cliId);
        return res.status(200).json(resultado);

    } catch (error) {
        console.log(error);
        const status = error.status || 500;
        const mensagem = error.mensagem || 'Erro ao adicionar item ao carrinho';
        return res.status(status).json({ mensagem });
    }

    async function marcarLida(req,res) {
        try {
            const service = new NotificacaoService();
            const resultado = await service.marcarLida(ntfId, cliId);
            return res.status(status).json({ mensagem });

        } catch (error) {
            console.log(error);
            const status = error.status || 500;
            const mensagem = error.mensagem || 'Erro ao adicionar item ao carrinho';
            return res.status(status).json({ mensagem });     
        }
    }

    async function criar(req, res) {
        try {
            const service = new NotificacaoService();

            const resultado = await service.criar(cliId, mensagem);
            return res.status(200).json(resultado);
        } catch (error) {
            console.log(error);
            const status = error.status || 500;
            const mensagem = error.mensagem || 'Erro ao adicionar item ao carrinho';
            return res.status(status).json({ mensagem });    
        }
        
    }
    
}

module.exports = { listarNaoLidas, marcarLida, criar};