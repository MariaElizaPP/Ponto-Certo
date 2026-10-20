// Essa variável armazena, na memória do navegador, as notificações recebidas do backend. Ela é utilizada para montar os cards, verificar quais foram lidas e identificar a notificação clicada.
let notificacoes = [];

// Garante que o JavaScript só vai rodar após todo o HTML da página estar carregado
document.addEventListener('DOMContentLoaded', () => {

    carregarNotificacoes(); // Faz a primeira busca de dados no Back-End assim que a página abre

    document.getElementById('btn-marcar-todas').addEventListener('click', marcarTodasLidas);
});

//fluxo: procurar o card que foi clicado e, caso ele seja encontrado, chamar abrirNotificacao() com o ID da notificação
document.addEventListener('click', (e) => {
    const card = e.target.closest('.notificacao');
    if (card) {
        abrirNotificacao(card.dataset.id);
    }
});


function obterCliId() {
    return localStorage.getItem('clienteId');
}

//objetivo da função: buscar no backend todas as notificações não lidas do cliente e exibi-las na lista
async function carregarNotificacoes() {

    const cliId = obterCliId();

    if (!cliId) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/notificacoes/${cliId}`);
        const resultado = await res.json();

        if (!res.ok) {
            exibirErroServidor(resultado.mensagem);
            return;
        }

        notificacoes = resultado;
        renderizarNotificacoes();

    } catch (error) {
        console.error(error);
        exibirErroServidor('Erro ao conectar com o servidor');
    }

    // fluxo: front chama carregarNotificacoes() -> fetch () envia o get para /api/notificacoes/:cliId -> rota -> controller (listarNaoLidas) -> service (listarNaoLidas) -> Model (listarNaoLidas - consulta o banco e devolve os dados) -> notificacoes = resultado -> renderizarNotificacoes() -> lista atualizada
}

//objetivo: enviar ao backend que uma notificação foi lida. Devolve true se deu certo e false se deu erro
async function marcarLida(ntfId) {

    const cliId = obterCliId();

    try {
        const res = await fetch(
            `http://localhost:3000/api/notificacoes/${cliId}/${ntfId}`,
            {
                method: 'PATCH'
            }
        );

        const resultado = await res.json();

        if (!res.ok) {
            exibirErroServidor(resultado.mensagem);
            return false;
        }

        // atualiza o estado na memória para o card ficar com o estilo de lida
        const notificacao = notificacoes.find((n) => String(n.ntf_id) === String(ntfId));
        if (notificacao) {
            notificacao.lida = true;
        }

        return true;

    } catch (error) {
        console.error(error);
        exibirErroServidor('Erro ao conectar com o servidor');
        return false;
    }

    //fluxo: front (clique no card) -> abrirNotificacao() chama marcarLida() com o id -> fetch( ) envia uma requisição PATCH para a rota -> rota (router.patch('/notificacoes/:cliId/:ntfId', notificacaoController.marcarLida)) -> controller (marcarLida) -> service (marcarLida) -> model (marcarLida) -> resposta do back -> sucesso "notificacao.lida = true" e erro "exibirErroServidor() e catch"
}

//objetivo: abrir/fechar o texto completo do card e marcar a notificação como lida
async function abrirNotificacao(ntfId) {
    const notificacao = notificacoes.find((n) => String(n.ntf_id) === String(ntfId));
    if (!notificacao) return;

    notificacao.aberta = !notificacao.aberta;

    if (!notificacao.lida) {
        await marcarLida(ntfId);
    }

    renderizarNotificacoes();
}

//objetivo: marcar todas as notificações que ainda não foram lidas
async function marcarTodasLidas() {
    const pendentes = notificacoes.filter((n) => !n.lida);

    const resultados = await Promise.all(pendentes.map((n) => marcarLida(n.ntf_id)));

    renderizarNotificacoes();

    if (resultados.every(Boolean)) {
        mostrarToast('Notificações marcadas como lidas.', 'sucesso');
    }
}

//objetivo: montar e exibir a lista
function renderizarNotificacoes() {
    // Obtém a lista (ul) e o botão de marcar todas.
    const lista = document.getElementById('lista-notificacoes');
    const botao = document.getElementById('btn-marcar-todas');

    // Só habilita o botão se existir alguma notificação não lida.
    botao.disabled = notificacoes.every((n) => n.lida);

    // Exibe uma mensagem caso não exista nenhuma notificação.
    if (notificacoes.length === 0) {
        lista.innerHTML = '<li class="notificacao-vazia">Você não tem notificações novas.</li>';
        return;
    }

    // Gera os cards e insere o HTML na lista.
    lista.innerHTML = notificacoes.map(linhaNotificacao).join('');
}

//objetivo: Monta o HTML de uma notificação
function linhaNotificacao(n) {
    // Adiciona as classes conforme o estado da notificação (lida e aberta).
    const classes = `notificacao${n.lida ? ' lida' : ''}${n.aberta ? ' aberta' : ''}`;

    // Retorna o card HTML com os dados da notificação.
    return `
        <li class="${classes}" data-id="${esc(n.ntf_id)}">
            <p class="notificacao-texto">${esc(n.ntf_mensagem)}</p>
            <time class="notificacao-data">${esc(formatarData(n.ntf_criadoEm))}</time>
            <span class="notificacao-ponto"></span>
        </li>`;
}

// Transforma a data que vem do banco em "22/09/2025 • 11:30h"
function formatarData(valor) {
    const data = new Date(valor);
    if (isNaN(data)) return '';

    const dia = data.toLocaleDateString('pt-BR');
    const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return `${dia} • ${hora}h`;
}

// Trata os valores antes de inseri-los no HTML, evitando que sejam interpretados como código.
function esc(valor) {
    // Cria um elemento div temporário.
    const div = document.createElement('div');

    // Insere o valor como texto; se for null ou undefined, utiliza uma string vazia.
    div.textContent = valor ?? '';

    // Retorna o conteúdo convertido em HTML escapado.
    return div.innerHTML;
}

function mostrarToast(mensagem, tipo = 'erro') {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.className = `toast mostrar ${tipo}`;

    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

function exibirErroServidor(mensagem) {
    mostrarToast(mensagem, 'erro');
}
