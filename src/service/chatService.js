const { ChatModel } = require('../models/chatModel');
const { responder } = require('./geminiService');

class ChatService {

    async processar({ cliId, sessaoId, mensagem }) {

        const model = new ChatModel();
        if (!cliId || !mensagem) {
            throw { status: 400, mensagem: 'Cliente e mensagem são obrigatórios.' };
        }

        // 1. Busca ou cria a sessão do chat no banco
        const sessao = await model.obterOuCriarSessao(cliId, sessaoId);

        // 2. BUSCA O HISTÓRICO ANTERIOR DA SESSÃO (ex: últimas 10 mensagens)
        const mensagensAnteriores = await model.buscarHistoricoMensagens(sessao.id, 10);

        // Converte o formato do banco para o padrão exigido pelo SDK do Gemini
        // No banco: 'cliente' vira 'user', 'bot' vira 'model'
        const historicoFormatado = mensagensAnteriores.map(msg => ({
            role: msg.remetente === 'cliente' ? 'user' : 'model',
            parts: [{ text: msg.conteudo }]
        }));

        // 3. Busca compras passadas do cliente
        const compras = await model.buscarPedidosRecentes(cliId, 3);
        const textoCompras = compras.length > 0
            ? compras.map(c => `- ${c.nome}`).join('\n')
            : 'Nenhuma compra anterior.';

        // 4. Busca os produtos no banco de dados
        let produtosDisponiveis = await model.buscarProdutosPorTermos([mensagem], 16);
        if (produtosDisponiveis.length === 0) {
            produtosDisponiveis = await model.buscarProdutosPorTermos([''], 16);
        }

        const textoProdutos = produtosDisponiveis.length > 0
            ? produtosDisponiveis.map(p => `[ID: ${p.id}] Nome: ${p.nome} | Preço: R$ ${p.preco}`).join('\n')
            : 'Nenhum produto cadastrado.';

        // 5. Prompt de regras (System Instructions / Contexto estático da rodada)
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
        `;

        // 6. Envia para o Gemini responder passando o histórico
        const respostaTexto = await responder(
            historicoFormatado,
            promptComRegras,
            mensagem
        );

        // 7. Salva as mensagens no banco de dados para as próximas interações
        await model.salvarMensagem(sessao.id, 'cliente', mensagem);
        const mensagemId = await model.salvarMensagem(sessao.id, 'bot', respostaTexto);

        // 8. Retorna a resposta final
        return {
            sessaoId: sessao.id,
            mensagemId,
            texto: respostaTexto,
            produtosRecomendados: produtosDisponiveis
        };
    }

    // Adicione este método na sua classe ChatService
    async registrarFeedback(msgId, feedback) {
        const model = new ChatModel();
        if (!msgId || !feedback) {
            throw { status: 400, mensagem: 'ID da mensagem e feedback são obrigatórios.' };
        }

        // Valida se o feedback é um valor aceito
        const feedbacksPermitidos = ['util', 'nao_util'];
        if (!feedbacksPermitidos.includes(feedback)) {
            throw { status: 400, mensagem: 'Feedback inválido. Use "util" ou "nao_util".' };
        }

        const atualizado = await model.salvarFeedback(msgId, feedback);
        if (!atualizado) {
            throw { status: 404, mensagem: 'Mensagem não encontrada.' };
        }

        return { mensagem: 'Feedback registrado com sucesso!' };
    }

}

module.exports = { ChatService };