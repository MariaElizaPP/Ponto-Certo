// Seleção dos elementos do HTML 
const botaoAbrir = document.getElementById('abrir-chatbot');
const botaoFechar = document.getElementById('fechar-chatbot');
const chatbot = document.getElementById('chatbot');

const campoMensagem = document.getElementById('campo-mensagem');
const listaMensagens = document.getElementById('lista-mensagens');
const botaoEnviar = document.getElementById('botao-enviar');

// Pega o ID do cliente salvo no localStorage (ajustado para o nome correto)
const clienteId = localStorage.getItem('clienteId');

let sessaoId = null; // Guarda o ID da sessão atual para manter o histórico ativo

// Abrir e fechar o chat 
botaoAbrir.addEventListener('click', function () {
    chatbot.classList.add('aberto');
});

botaoFechar.addEventListener('click', function () {
    chatbot.classList.remove('aberto');
});

// Adicionar mensagem do usuário na tela 
function adicionarMensagemUsuario(texto) {
    const novaMensagem = document.createElement('li');
    novaMensagem.classList.add('mensagem', 'mensagem-usuario');
    novaMensagem.innerHTML = `<p>${texto}</p>`;

    listaMensagens.appendChild(novaMensagem);
    listaMensagens.scrollTop = listaMensagens.scrollHeight;
}

// Adicionar mensagem do bot na tela
function adicionarMensagemBot(texto, mensagemId) {
    const novaMensagem = document.createElement('li');
    novaMensagem.classList.add('mensagem', 'mensagem-bot');

    let htmlFeedback = '';
    if (mensagemId) {
        htmlFeedback = `
            <div class="feedback-container" data-msg-id="${mensagemId}">
                <span>Esta resposta foi útil?</span>
                <div class="feedback-acoes">
                    <button type="button" class="btn-feedback" onclick="enviarFeedback(${mensagemId}, 'util', this)">👍 Sim</button>
                    <button type="button" class="btn-feedback" onclick="enviarFeedback(${mensagemId}, 'nao_util', this)">👎 Não</button>
                </div>
            </div>
        `;
    }

    novaMensagem.innerHTML = `
        <div class="conteudo-bot">
            <p>${texto}</p>
            ${htmlFeedback}
        </div>
    `;
 
    listaMensagens.appendChild(novaMensagem);
    listaMensagens.scrollTop = listaMensagens.scrollHeight;
}

// Função para enviar o feedback (Item 7)
async function enviarFeedback(msgId, feedback, elementoBotao) {
    try {
        const resposta = await fetch('http://localhost:3000/api/chat/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ msgId, feedback })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            const container = elementoBotao.closest('.feedback-container');
            container.innerHTML = `<span class="feedback-sucesso">✔ Feedback (${feedback === 'util' ? 'Útil' : 'Não útil'}) registrado com sucesso!</span>`;
        } else {
            alert('Erro ao registrar feedback: ' + dados.mensagem);
        }
    } catch (error) {
        console.error('Erro de rede ao enviar feedback:', error);
        alert('Erro de conexão ao enviar feedback.');
    }
}

// Função principal: enviar mensagem (ADICIONADO 'async' AQUI)
async function enviarMensagem() {
    const textoDigitado = campoMensagem.value.trim();

    if (textoDigitado === '') {
        return; 
    }

    adicionarMensagemUsuario(textoDigitado);
    campoMensagem.value = ''; 

    // Indicador visual de carregamento
    const idCarregando = 'carregando-' + Date.now();
    const liCarregando = document.createElement('li');
    liCarregando.id = idCarregando;
    liCarregando.classList.add('mensagem', 'mensagem-bot');
    liCarregando.innerHTML = `<p><em>Pontinho está digitando...</em></p>`;
    listaMensagens.appendChild(liCarregando);
    listaMensagens.scrollTop = listaMensagens.scrollHeight;

    try {
        // Requisição real para a rota do Node.js (/chat)
        const respostaServidor = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cliId: clienteId, // Corrigido para usar a variável correta
                sessaoId: sessaoId, 
                mensagem: textoDigitado
            })
        });

        // Remove o "digitando..."
        if (document.getElementById(idCarregando)) {
            document.getElementById(idCarregando).remove();
        }

        if (!respostaServidor.ok) {
            throw new Error('Erro ao processar a mensagem no servidor.');
        }

        const dados = await respostaServidor.json();

        // Atualiza o ID da sessão e exibe a resposta da IA junto com o ID para o feedback
        sessaoId = dados.sessaoId;
        adicionarMensagemBot(dados.texto, dados.mensagemId);

    } catch (error) {
        console.error('Erro:', error);
        if (document.getElementById(idCarregando)) {
            document.getElementById(idCarregando).remove();
        }
        adicionarMensagemBot('Desculpe, ocorreu um erro ao conectar com o assistente. Tente novamente mais tarde.');
    }
}

// Eventos que disparam o envio 
botaoEnviar.addEventListener('click', enviarMensagem);

campoMensagem.addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter' && !evento.shiftKey) {
        evento.preventDefault();
        enviarMensagem();
    }
});