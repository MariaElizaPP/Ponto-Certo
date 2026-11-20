const { GoogleGenAI, Type } = require('@google/genai');

const ai = new GoogleGenAI();

const ESQUEMA = {
    type: Type.OBJECT,
    properties: {
        texto: { type: Type.STRING },
        produtos: { type: Type.ARRAY, items: { type: Type.INTEGER } }
    },
    required: ['texto', 'produtos']
};

async function responder(historico, promptComRegras, mensagemAtual) {
    try {
        const chat = ai.chats.create({
            model: process.env.GEMINI_MODEL,
            history: historico,
            config: {
                systemInstruction: promptComRegras,
                temperature: 0.3,
                responseMimeType: 'application/json',
                responseSchema: ESQUEMA
            }
        });

        const resultado = await chat.sendMessage({ message: mensagemAtual });
        return JSON.parse(resultado.text); // { texto, produtos }
    } catch (error) {
        console.error('Erro ao chamar o Gemini:', error);
        throw { status: 502, mensagem: 'O assistente está indisponível no momento. Tente novamente.' };
    }
}

module.exports = { responder };