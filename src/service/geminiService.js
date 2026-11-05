const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({}); // Usa a GEMINI_API_KEY do ambiente

class GeminiService {

    async responder(entrada, historicoAnterior = []) {
        try {
            // 1. Criamos uma sessão de chat enviando o histórico (se houver)
            const chat = ai.chats.create({
                model: process.env.GEMINI_MODEL,
                history: historicoAnterior
            });

            // 2. Enviamos a mensagem atual do usuário
            const resultado = await chat.sendMessage({
                message: entrada
            });

            // 3. Pegamos a resposta em texto da IA
            const respostaTexto = resultado.text;

            return {
                texto: respostaTexto,
                // Opcional: se quiser depois extrair produtos, podemos simplificar aqui também
            };

        } catch (erro) {
            console.error('[Gemini Error]', erro);
            throw new Error('O assistente está indisponível no momento.');
        }
    }
}

module.exports = { GeminiService };