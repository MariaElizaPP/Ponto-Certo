const { ChatService } = require('../service/chatService');

const service = new ChatService();

async function processar(req, res) {
    try {
        const { cliId, sessaoId, mensagem } = req.body;
        const resposta = await service.processar({ cliId, sessaoId, mensagem });
        return res.status(200).json(resposta);

    } catch (error) {
        if (error.status)
            return res.status(error.status).json({ mensagem: error.mensagem });
        console.log(error);
        return res.status(500).json({ mensagem: 'Erro ao processar a mensagem.' });
    }
}

module.exports = { processar };