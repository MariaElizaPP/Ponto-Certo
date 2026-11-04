require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

(async () => {
    const ai = new GoogleGenAI({}); // lê GEMINI_API_KEY do ambiente

    const interaction = await ai.interactions.create({
        model: process.env.GEMINI_MODEL,
        input: 'Diga olá em uma frase, como assistente de uma loja de crochê.'
    });

    console.log(interaction.output_text);
})();