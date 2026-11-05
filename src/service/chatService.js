const { GeminiService } = require('./geminiService');
const { ChatModel } = require('../models/chatModel');

class ChatService {

    constructor() {
        this.model = new ChatModel();
        this.gemini = new GeminiService();
    }

    async processar({ cliId, sessaoId, mensagem }) {
        if (!cliId || !mensagem) {
            throw { status: 400, mensagem: 'Cliente e mensagem são obrigatórios.' };
        }

        // 1. Busca ou cria a sessão do chat no banco
        const sessao = await this.model.obterOuCriarSessao(cliId, sessaoId);

        // 2. Busca compras passadas do cliente
        const compras = await this.model.buscarPedidosRecentes(cliId, 3);
        const textoCompras = compras.length > 0
            ? compras.map(c => `- ${c.nome}`).join('\n')
            : 'Nenhuma compra anterior.';

        // 3. BUSCA OS PRODUTOS NO BANCO DE DADOS
        // Trazemos os produtos disponíveis na loja para servir de base estrita
        let produtosDisponiveis = await this.model.buscarProdutosPorTermos([mensagem], 16);
        
        if (produtosDisponiveis.length === 0) {
            produtosDisponiveis = await this.model.buscarProdutosPorTermos([''], 16); 
        }

        const textoProdutos = produtosDisponiveis.length > 0
            ? produtosDisponiveis.map(p => `[ID: ${p.id}] Nome: ${p.nome} | Preço: R$ ${p.preco}`).join('\n')
            : 'Nenhum produto cadastrado.';

        // 4. Prompt blindado com instrução negativa severa
        const promptComRegras = `
Você é o Pontinho, o assistente virtual exclusivo da loja Ponto Certo (crochê e tricô).
ATENÇÃO: VOCÊ É PROIBIDO DE CITAR QUALQUER PRODUTO QUE NÃO ESTEJA NA LISTA ABAIXO.
Se o cliente pedir algo que NÃO está na lista abaixo, você DEVE responder obrigatoriamente: "Desculpe, não temos esse produto disponível no momento em nossa loja." e não cite nenhum outro item.
SEJA BREVE E CURTO: Responda em no máximo 2 frases (ou máximo de 200 caracteres). Nunca faça textos longos.
IMPORTANTE: Da lista abaixo, selecione e recomende APENAS de 1 a 3 itens que tenham mais relação com o que o cliente pediu. Nunca cite todos os produtos de uma vez.
HISTÓRICO DE COMPRAS DO CLIENTE:
${textoCompras}

LISTA OFICIAL DE PRODUTOS DISPONÍVEIS NA LOJA (ÚNICOS PERMITIDOS):
${textoProdutos}

PERGUNTA DO CLIENTE:
${mensagem}
        `;

        // 5. Envia para o Gemini responder
        const respostaTexto = await this.gemini.responder(promptComRegras);

        // 6. Salva as mensagens no banco de dados
        await this.model.salvarMensagem(sessao.id, 'cliente', mensagem);
        const mensagemId = await this.model.salvarMensagem(sessao.id, 'bot', respostaTexto);

        // 7. Retorna a resposta final
        return {
            sessaoId: sessao.id,
            mensagemId,
            texto: respostaTexto,
            produtosRecomendados: produtosDisponiveis
        };
    }
}

module.exports = { ChatService };