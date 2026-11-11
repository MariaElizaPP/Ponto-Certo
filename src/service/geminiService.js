const { GoogleGenAI } = require('@google/genai');

// Inicializa o cliente do Gemini usando diretamente a variável de ambiente
const ai = new GoogleGenAI();

async function responder(historico, promptComRegras, mensagemAtual) {
    try {
        // Cria a sessão de chat com o histórico e regras
        const chat = ai.chats.create({
            model: process.env.GEMINI_MODEL,
            history: historico,
            config: {
                systemInstruction: promptComRegras,
                temperature: 0.3,
            }
        });

        // Envia a mensagem atual
        const resultado = await chat.sendMessage({
            message: mensagemAtual
        });

        return resultado.text;
    } catch (error) {
        console.error('Erro ao chamar o Gemini:', error);
        throw { status: 500, mensagem: 'Erro ao se comunicar com a inteligência artificial.' };
    }
}

module.exports = { responder };