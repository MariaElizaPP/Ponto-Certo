const PROXIMO_STATUS = {
    'EM PROCESSAMENTO': 'APROVADO',
    'APROVADO': 'EM TRANSPORTE',
    'EM TRANSPORTE': 'ENTREGUE',
};

//armazena a lista de pedidos
let pedidos = [];
//armazena os status dos pedidos
let statusPedidos = [];

//inicializar a tela quando o html estiver carregado
document.addEventListener('DOMContentLoaded', async () => {
    // Atualiza a lista de pedidos sempre que o usuário digitar no campo de busca.
    document.getElementById('campo-busca').addEventListener('input', renderizarPedidos);
    // Busca os status disponíveis no backend antes de carregar os pedidos.
    await carregarStatus();
    //busca os pedidos 
    await carregarPedidos();
});
//objetivo: identificar quando o admin mudar o status do pedido 
document.addEventListener('change', (e) => {
    // Verifica se o elemento alterado é um campo de seleção de status
    if (e.target.classList.contains('select-status')) {
        alterarStatus(e.target);
    }
});
//objetivo: buscar os status e armazenar na variavel
async function carregarStatus() {
    try {
        //requisição GET para consultar os status
        const res = await fetch(`http://localhost:3000/api/statusPedidos`);
        const resultado = await res.json();
 
        if (!res.ok) {
            exibirErroServidor(resultado.mensagem);
            return;
        }
        // Armazena os status recebidos 
        statusPedidos = resultado;
    } catch (error) {
        console.error(error);
        exibirErroServidor('Erro ao conectar com o servidor');
    }

    // Fluxo: carregarStatus() → fetch GET /api/statusPedidos → rota (router.get('/statusPedidos', pedidoController.listarStatus) → controller (listarStatus) → service (listarStatus) -> model (listarStatus) → banco de dados → resposta JSON → armazenamento dos status em statusPedidos.
}
//objetivo: buscar todos os pedidos feitos pelos clientes e atualizar a tabela
async function carregarPedidos() {
    try {
        const res = await fetch(`http://localhost:3000/api/listarPedidos`);
        const resultado = await res.json();
 
        if (!res.ok) {
            exibirErroServidor(resultado.mensagem);
            return;
        }
 
        pedidos = resultado;
        renderizarPedidos();
    } catch (error) {
        console.error(error);
        exibirErroServidor('Erro ao conectar com o servidor');
    }

    // Fluxo: carregarPedidos() → fetch GET /api/listarPedidos → rota (router.get('/listarPedidos', pedidoController.listarPedidos) → controller (listarPedidos) → service (listarPedidos) -> model (listarPedidos) → banco de dados → resposta JSON → armazenamento dos pedidos em pedidos → renderizarPedidos() → exibição dos pedidos na tela.

}

async function alterarStatus(select) {
    // Obtém o ID do pedido e o ID do cliente armazenados no campo de seleção
    const { pedId, cliId } = select.dataset;
    // Desabilita o campo temporariamente durante o processamento
    select.disabled = true;
 
    try {
        // Envia uma requisição PATCH para atualizar o status do pedido
        const res = await fetch(`http://localhost:3000/api/pedido/${pedId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            // Envia o ID do cliente e o ID do novo status no corpo da requisição.
            body: JSON.stringify({ cliId: Number(cliId), statusId: Number(select.value) })
        });
 
        const resultado = await res.json();
 
        if (!res.ok) {
            exibirErroServidor(resultado.mensagem);
        } else {
            mostrarToast(resultado.mensagem, 'sucesso');
        }
    } catch (error) {
        console.error(error);
        exibirErroServidor('Erro ao conectar com o servidor');
    }
 
    // recarrega sempre: mostra o novo status ou volta o select ao estado real se deu erro
    await carregarPedidos();

    /*
        Fluxo: admin altera o status no select → alterarStatus() identifica o pedido e o cliente → envia uma requisição PATCH ao backend com o novo status → recebe a resposta → exibe uma mensagem → recarrega os pedidos para atualizar a tabela.
        */
}
//objetivo: atualizar a tabela conforme o admin digita no campo de bsuca 
function renderizarPedidos() {
    // Obtém o corpo da tabela onde os pedidos serão exibidos
    const tbody = document.getElementById('tabela-pedidos');
    // Obtém o texto digitado no campo de busca, removendo espaços extras
    // e convertendo as letras para minúsculas.
    const filtro = document.getElementById('campo-busca').value.trim().toLowerCase();
    // Filtra os pedidos pelo nome do cliente ou pelo ID do pedido
    const lista = pedidos.filter((p) =>
        (p.cli_nome || '').toLowerCase().includes(filtro) ||
        String(p.ped_id).includes(filtro)
    );
 
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Nenhum pedido encontrado.</td></tr>';
        return;
    }
    // Gera as linhas HTML dos pedidos encontrados e as exibe na tabela.
    tbody.innerHTML = lista.map(linhaPedido).join('');
}

function linhaPedido(p) {
    return `
        <tr>
            <td>${esc(p.data)}</td>
            <td>${esc(p.cli_nome)}</td>
            <td>${esc(p.end_estado)}</td>
            <td>${formatarMoeda(p.ped_totalPedido)}</td>
            <td>${celulaStatus(p)}</td>
        </tr>`;
        /*
        Fluxo: linhaPedido() → recebe os dados de um pedido → monta a linha HTML com a data, cliente, estado, total, status e botão de detalhes → retorna a linha para ser exibida na tabela.
        */
}
 function celulaStatus(p) {
    const proximo = statusPedidos.find((s) => s.stp_status === PROXIMO_STATUS[p.stp_status]);
 
    // sem próximo status permitido: só mostra o texto
    if (!proximo) {
        return esc(formatarStatus(p.stp_status));
    }
 
    // Cria um campo de seleção com o status atual já selecionado
    return `
        <select class="select-status" data-ped-id="${p.ped_id}" data-cli-id="${p.ped_cli_id}">
            <option value="${p.ped_stp_id}" selected>${esc(formatarStatus(p.stp_status))}</option>
            <option value="${proximo.stp_id}">${esc(formatarStatus(proximo.stp_status))}</option>
        </select>`;

        /*
        Fluxo: celulaStatus() → verifica o status atual do pedido → procura o próximo status permitido → se não houver, exibe apenas o status atual → se houver, cria um select com o status atual e a próxima opção permitida.
        */
}

function formatarStatus(status) {
    const texto = (status || '').toLowerCase();
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}
 
function formatarMoeda(valor) {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
 
function esc(valor) {
    const div = document.createElement('div');
    div.textContent = valor ?? '';
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