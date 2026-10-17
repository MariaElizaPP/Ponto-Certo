// Traduz o status que vem do banco para um texto mais amigável ao administrador.
// "etapa" define quais ações aparecem na linha (RF0042 e RF0044).
const STATUS = {
    'EM TROCA': { texto: 'Troca solicitada', etapa: 'solicitada' },
    'TROCA AUTORIZADA': { texto: 'Troca autorizada (aguardando recebimento)', etapa: 'autorizada' },
    'TROCADO': { texto: 'Troca concluída' },
    'RECUSADO': { texto: 'Troca negada' }
};
//guarda todas as solicitações e a partir dela vai dá pra renderizar a tabela 
let trocas = [];

// Garante que o JavaScript só vai rodar após todo o HTML da página estar carregado
document.addEventListener('DOMContentLoaded', () => {
    
    carregarTrocas(); // Faz a primeira busca de dados no Back-End assim que a página abre
 
    document.getElementById('campo-busca').addEventListener('input', renderizarTrocas);    // Monitora o campo de busca: a cada letra digitada, filtra a lista na memória e redesenha a tabela
});

// Procura qual botão de confirmação foi clicado e chama processarTroca()
// com a ação (que também é o final da rota) e o id da solicitação
document.addEventListener('click', (e) => {
    const autorizar = e.target.closest('.btn-confirmar-autorizar');
    if (autorizar) {
        processarTroca('autorizar', autorizar.dataset.id);
        return;
    }
 
    const reprovar = e.target.closest('.btn-confirmar-reprovar');
    if (reprovar) {
        processarTroca('reprovar', reprovar.dataset.id);
        return;
    }
 
    // RF0044: o administrador informa se os itens retornam ao estoque
    const receber = e.target.closest('.btn-confirmar-recebimento');
    if (receber) {
        processarTroca('confirmarRecebimento', receber.dataset.id, {
            retornaEstoque: receber.dataset.retorna === 'true'
        });
    }
});
//objetivo da função: buscar no backend todas as solicitações de troca e exibi-las na tabela do admin
async function carregarTrocas() {

     try {
        const res = await fetch('http://localhost:3000/api/solicitacoes');
        const resultado = await res.json();
 
        if (!res.ok) {
            exibirErroServidor(resultado.mensagem);
            return;
        }
 
        trocas = resultado;
        renderizarTrocas();
 
    } catch (error) {
        console.error(error);
        exibirErroServidor('Erro ao conectar com o servidor');
    }
}

// Envia ao back-end a decisão do administrador.
// Rotas: PATCH /api/solicitacoes/autorizar/:id
//        PATCH /api/solicitacoes/reprovar/:id
//        PATCH /api/solicitacoes/confirmarRecebimento/:id  (corpo: { retornaEstoque }

async function processarTroca(acao, trocaId, corpo) {
    try {
        const opcoes = { method: 'PATCH' };
 
        if (corpo) {
            opcoes.headers = { 'Content-Type': 'application/json' };
            opcoes.body = JSON.stringify(corpo);
        }
 
        const res = await fetch(`http://localhost:3000/api/solicitacoes/${acao}/${trocaId}`, opcoes);
        const resultado = await res.json().catch(() => ({}));
 
        if (!res.ok) {
            exibirErroServidor(resultado.mensagem || 'Erro ao processar a solicitação');
        } else {
            mostrarToast(resultado.mensagem, 'sucesso');
        }
 
    } catch (error) {
        console.error(error);
        exibirErroServidor('Erro ao conectar com o servidor');
    }
 
    // Recarrega sempre: mostra o novo status ou o estado real se deu erro
    await carregarTrocas();
}

// Monta e exibe a tabela
function renderizarTrocas() {
    const tbody = document.getElementById('tabela-trocas');
    const filtro = document.getElementById('campo-busca').value.trim().toLowerCase();
 
    // Filtra pelo nome do produto, ignorando maiúsculas e minúsculas
    const lista = trocas.filter((t) => (t.prd_nome || '').toLowerCase().includes(filtro));
 
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">Nenhuma solicitação encontrada.</td></tr>';
        return;
    }
 
    tbody.innerHTML = lista.map(linhaTroca).join('');
}
 
 // Monta o HTML de uma solicitação. As ações dependem do status:
//   EM TROCA          -> Autorizar / Reprovar
//   TROCA AUTORIZADA  -> Confirmar recebimento
//   TROCADO / RECUSADO -> nenhuma ação
function linhaTroca(t) {
    const status = STATUS[t.stt_status] || { texto: t.stt_status };
 
    let acoes = '<td></td>';
 
    if (status.etapa === 'solicitada') {
        acoes = `<td class="acoes-tabela">
             <button type="button" class="botao-aprovar" data-modal="modal-abrir-autorizar-${t.str_id}">Autorizar Troca</button>
             ${modalAutorizar(t.str_id)}
             <button type="button" class="botao-reprovar" data-modal="modal-abrir-reprovar-${t.str_id}">Reprovar Troca</button>
             ${modalReprovar(t.str_id)}
           </td>`;
    } else if (status.etapa === 'autorizada') {
        acoes = `<td class="acoes-tabela">
             <button type="button" class="botao-aprovar" data-modal="modal-abrir-receber-${t.str_id}">Confirmar Recebimento</button>
             ${modalConfirmarRecebimento(t.str_id)}
           </td>`;
    }
 
    return `
        <tr>
            <td>${esc(t.cli_nome)}</td>
            <td>${esc(t.prd_nome)}</td>
            <td>${esc(t.str_quantidade)}</td>
            <td>${formatarMoeda(t.valor)}</td>
            <td>${esc(status.texto)}</td>
            ${acoes}
        </tr>`;
}
 
// Modal de autorização (RF0042). O cupom NÃO é gerado aqui: só no recebimento (RF0045).
function modalAutorizar(id) {
    return `
        <dialog id="modal-abrir-autorizar-${id}" class="modal-abrir">
            <img class="icone-alerta" src="/public/images/modal-alerta.svg" alt="alerta-modal">
            <h3>Autorizar troca?</h3>
            <span>Você realmente deseja autorizar a troca solicitada pelo cliente? O cliente será notificado. O cupom de troca será gerado após a confirmação do recebimento dos itens.</span>
            <div class="botoes-modais">
                <button type="button" class="btn-modal-cancelar" data-modal="modal-abrir-autorizar-${id}">Cancelar</button>
                <button type="button" class="btn-modal-fechar btn-tema-alerta btn-confirmar-autorizar" data-modal="modal-abrir-autorizar-${id}" data-id="${id}">Autorizar</button>
            </div>
        </dialog>`;
}

function modalReprovar(id) {
    return `
        <dialog id="modal-abrir-reprovar-${id}" class="modal-abrir">
            <img class="icone-alerta" src="/public/images/modal-alerta.svg" alt="alerta-modal">
            <h3>Reprovar troca?</h3>
            <span>Você realmente deseja reprovar a troca solicitada pelo cliente?</span>
            <div class="botoes-modais">
                <button type="button" class="btn-modal-cancelar" data-modal="modal-abrir-reprovar-${id}">Cancelar</button>
                <button type="button" class="btn-modal-fechar btn-tema-alerta btn-confirmar-reprovar" data-modal="modal-abrir-reprovar-${id}" data-id="${id}">Reprovar</button>
            </div>
        </dialog>`;
}

// Modal de recebimento (RF0044). Dois botões de confirmação deixam a escolha explícita:
// o administrador sempre informa se os itens retornam ao estoque.
function modalConfirmarRecebimento(id) {
    return `
        <dialog id="modal-abrir-receber-${id}" class="modal-abrir">
            <img class="icone-alerta" src="/public/images/modal-alerta.svg" alt="alerta-modal">
            <h3>Confirmar recebimento?</h3>
            <span>Confirme que os itens da troca foram recebidos e informe se eles devem retornar ao estoque. O cupom de troca será gerado e disponibilizado ao cliente.</span>
            <div class="botoes-modais">
                <button type="button" class="btn-modal-fechar btn-tema-alerta btn-confirmar-recebimento" data-modal="modal-abrir-receber-${id}" data-id="${id}" data-retorna="false">Não retornar ao estoque</button>
                <button type="button" class="btn-modal-fechar btn-tema-alerta btn-confirmar-recebimento" data-modal="modal-abrir-receber-${id}" data-id="${id}" data-retorna="true">Retornar ao estoque</button>
            </div>
        </dialog>`;
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

// O valor vem do banco como string (DECIMAL), por isso a conversão com Number
function formatarMoeda(valor) {
    return Number(valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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



