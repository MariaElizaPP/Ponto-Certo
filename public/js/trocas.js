// vai traduzir o que vem do banco pra deixar mais bonitinho para o admin ver
const STATUS = {
    'EM TROCA': {texto: 'Troca solicitada', pendente: true},
    'TROCADO': {texto: 'Troca aceita'},
    'RECUSADO': {texto: 'Troca negada'},
};
//guarda todas as solicitações e a partir dela vai dá pra renderizar a tabela 
let trocas = [];

// Garante que o JavaScript só vai rodar após todo o HTML da página estar carregado
document.addEventListener('DOMContentLoaded', () => {
    
    carregarTrocas(); // Faz a primeira busca de dados no Back-End assim que a página abre
 
    document.getElementById('campo-busca').addEventListener('input', renderizarTrocas);    // Monitora o campo de busca: a cada letra digitada, filtra a lista na memória e redesenha a tabela
});

//fluxo: procurar o botão de reprovação ou aprovar e, caso ele seja encontrado, chamar processarTroca() com a ação e o ID da troca.
document.addEventListener('click', (e) => {
    const aprovar = e.target.closest('.btn-confirmar-aprovar');
    if(aprovar){
        processarTroca('aprovar', aprovar.dataset.id); //ela tem dois argumentos, o 'aprovar' que indica a ação que queremos realizar; e o aprovar.dataset.id que recupera o ID da troca associada ao botão
        return;
    }

     const reprovar = e.target.closest('.btn-confirmar-reprovar');
    if (reprovar) {
        processarTroca('reprovar', reprovar.dataset.id);
    }
});

//objetivo da função: buscar no backend todas as solicitações de troca e exibi-las na tabela do admin
async function carregarTrocas() {

    try {
        const res = await fetch(`http://localhost:3000/api/solicitacoes`);
        const resultado = await res.json();

        if(!res.ok){
            exibirErroServidor(resultado.mensagem);
            return;
        }

        trocas = resultado;
        renderizarTrocas();

    } catch (error) {
          console.error(error);
        exibirErroServidor('Erro ao conectar com o servidor');
    }

    // fluxo: front chama carregarTrocas() -> fetch () envia o get para /api/solicitacoes -> rota -> controller (solicitacoes) -> service(solicitacoes) -> Model (exibirSolicitacoes - consulta o banco e devolve os dados) -> trocas = resultado  -> renderizarTrocas() -> tabela atualizada
}

//objetivo: enviar ao backend a decisão do admin de aprovar ou reprovar uma solicitação de troca

async function processarTroca(acao, trocaId) {
    //sabe o fluxo de procurar o botão e ver se foi aprovado ou reprovado e caso seja um dos dois enviar pra processarTrocar('acao', id da troca) é isso que vai chegar aqui;
    try {
        const res = await fetch(
            `http://localhost:3000/api/solicitacoes/${acao}/${trocaId}`,
            {
                method: 'PATCH'
            }
        );

        const resultado = await res.json();

        if (!res.ok) {
            exibirErroServidor(resultado.mensagem);
        } else {
            mostrarToast(resultado.mensagem);
        }

    } catch (error) {
        console.error(error);
        exibirErroServidor('Erro ao conectar com o servidor');
    }

    //fluxo: front(admini confirma uma ação 'aprovar' ou 'reprovar') -> em js processarTroca() recebe a ação e o id da solicitação -> fetch( ) envia uma requisição PATCH para a rota -> rota (router.patch('/solicitacoes/aprovar/:trocaId', trocaController.aprovarTroca) ou router.patch('/solicitacoes/reprovar/:trocaId', trocaController.reprovarTroca);) -> controller ( aprovarTroca ou  reprovarTroca) -> service (aprovar ou reprovar)-> model (aprovarTroca ou reprovar) -> respota do back -> sucesso "mostrarToast() e carregarTrocas() atualiza a tabela" e erro "exibirErroServidor() e catch"

    await carregarTrocas();
    // recarrega sempre: mostra o novo status ou o estado real se deu erro

}

//objetivo: montar e exibir a tabela 
function renderizarTrocas() {
    // Obtém o corpo da tabela e o texto digitado no campo de busca.
    const tbody = document.getElementById('tabela-trocas');
    const filtro = document.getElementById('campo-busca').value.trim().toLowerCase();
    // Filtra as solicitações pelo nome do produto, ignorando maiúsculas e minúsculas.
    const lista = trocas.filter((t) => (t.prd_nome || '').toLowerCase().includes(filtro));
     // Exibe uma mensagem caso nenhuma solicitação corresponda à pesquisa.
    if (lista.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Nenhuma solicitação encontrada.</td></tr>';
        return;
    }
    // Gera as linhas da tabela e insere o HTML no corpo da tabela.
    tbody.innerHTML = lista.map(linhaTroca).join('');
}
 //obejtivo: Monta o HTML de uma solicitação de troca
function linhaTroca(t) {
    // Obtém o texto e as configurações correspondentes ao status da solicitação.
    const status = STATUS[t.stt_status] || { texto: t.stt_status };
    // Exibe os botões de aprovar e reprovar somente para solicitações pendentes.
    const acoes = status.pendente
        ? `<td class="acoes-tabela">
             <button type="button" class="botao-aprovar" data-modal="modal-abrir-aprovar-${t.str_id}">Aprovar Troca</button>
             ${modalAprovar(t.str_id)}
             <button type="button" class="botao-reprovar" data-modal="modal-abrir-reprovar-${t.str_id}">Reprovar Troca</button>
             ${modalReprovar(t.str_id)}
           </td>`
        : '<td></td>';
   // Retorna a linha HTML com os dados da solicitação e a coluna de ações.
    return `
        <tr>
            <td>${esc(t.cli_nome)}</td>
            <td>${esc(t.ped_id)}</td>
            <td>${esc(t.prd_nome)}</td>
            <td>${esc(status.texto)}</td>
            ${acoes}
        </tr>`;
}

//objetivo: gerar um modal de confirmação para a reprova ou aprova de uma troca

function modalAprovar(id) {
    return `
        <dialog id="modal-abrir-aprovar-${id}" class="modal-abrir">
            <img class="icone-alerta" src="/public/images/modal-alerta.svg" alt="alerta-modal">
            <h3>Aprovar troca?</h3>
            <span>Você realmente deseja aprovar a troca solicitada pelo cliente? Um cupom será gerado e o cliente será notificado.</span>
            <div class="botoes-modais">
                <button type="button" class="btn-modal-cancelar" data-modal="modal-abrir-aprovar-${id}">Cancelar</button>
                <button type="button" class="btn-modal-fechar btn-tema-alerta btn-confirmar-aprovar" data-modal="modal-abrir-aprovar-${id}" data-id="${id}">Aprovar</button>
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



