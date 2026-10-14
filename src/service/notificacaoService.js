const { NotificacaoModel } = require('../models/notificacaoModel');

class notificacaoService{
    
    async listarNaoLidas(cliId){
        if (!cliId){
            throw { status: 400, mensagem: 'O id do cliente é obrigatório e deve ser válido' };
        }

        const model = new NotificacaoModel();

        return await model.listarNaoLidas(cliId);
    }

    async marcarLida (ntfId, cliId){
        if (!cliId){
            throw { status: 400, mensagem: 'O id do cliente é obrigatório' };
        }

        if (!ntfId){
            throw { status: 400, mensagem: 'O id do notificação é obrigatório' };
        }

        const model = new NotificacaoModel();

        await model.marcarLida(ntfId, cliId);

        return{
            mensagem: 'Notificação marcada como lida com sucesso.'
        }
        
    }

    async criar(cliId, mensagem){

        if (!cliId){
            throw { status: 400, mensagem: 'O id do cliente é obrigatório' };
        }

        if (!mensagem){
            throw { status: 400, mensagem: 'A mensagem da notificação é obrigatória' };
        }

        const model = new NotificacaoModel();
        await model.criar(cliId, mensagem.trim());

        return {
            mensagem: 'Notificação criada com sucesso'
        }

    }
}

module.exports = {notificacaoService};
