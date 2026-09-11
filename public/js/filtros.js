const abrirFiltro = document.getElementById("abrirFiltro");
const fecharFiltro = document.getElementById("fecharFiltro");
const painelFiltro = document.getElementById("painelFiltro");
const limparFiltro = document.getElementById("limparFiltro");
const aplicarFiltro = document.getElementById("aplicarFiltro");
const inputBusca = document.getElementById('buscaCliente');

let clientes = []
async function carregarClientes(params = new URLSearchParams()) {
    const resposta = await fetch(`http://localhost:3000/api/clientes?${params.toString()}`);
    clientes = await resposta.json();
    aplicarBuscaRenderizar();
}

function aplicarBuscaRenderizar() {
    const termo = normalizar(inputBusca.value);

    if (!termo) {
        renderizarTabela(clientes);
        return;
    }

    const filtrados = clientes.filter(cliente => {
        return (
            normalizar(cliente.cli_nome).includes(termo) ||
            normalizar(cliente.cli_cpf).includes(termo) ||
            normalizar(cliente.cli_telefone).includes(termo) ||
            normalizar(cliente.cli_email).includes(termo)
        );
    });

    renderizarTabela(filtrados);
}

inputBusca.addEventListener('input', aplicarBuscaRenderizar);

function apenasNumeros(valor) {
    return valor.replace(/\D/g, '');
}

function mascararTelefone(valor) {
    let v = apenasNumeros(valor).slice(0, 11);
    v = v.replace(/^(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    return v;
}

function mascararCpf(cpf){
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

document.addEventListener("DOMContentLoaded", function () {
    carregarClientes();
});


abrirFiltro.addEventListener("click", function () {
    painelFiltro.classList.add("ativo");
});


fecharFiltro.addEventListener("click", function () {
    painelFiltro.classList.remove("ativo");
});


limparFiltro.addEventListener("click", function () {
    painelFiltro.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
        checkbox.checked = false;
    });
    document.getElementById("data_nascimento").value = "";
    inputBusca.value = "";

    carregarClientes();
});


aplicarFiltro.addEventListener("click", function () {
    const generosSelecionados = painelFiltro.querySelectorAll('input[name="genero"]:checked');
    const dataNascimento = document.getElementById("data_nascimento").value;

    const params = new URLSearchParams();
    generosSelecionados.forEach(function (checkbox) {
        params.append("genero", checkbox.value);
    });
    if (dataNascimento) params.append("dataNascimento", dataNascimento);

    carregarClientes(params);
    painelFiltro.classList.remove("ativo");
});


function renderizarTabela(clientes) {
    const tbody = document.querySelector(".tabela-master tbody");
    tbody.innerHTML = ""; 
    
    clientes.forEach(function (cliente) {
        const dataFormatada = new Date(cliente.cli_dataNasc).toLocaleDateString('pt-BR');

        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${mascararCpf(cliente.cli_cpf)}</td>
            <td>${cliente.cli_nome}</td>
            <td>${cliente.cli_email}</td>
            <td>${mascararTelefone(cliente.cli_telefone)}</td>
            <td>${dataFormatada}</td>
            <td class="acoes-tabela">
                <label class="status-produto" data-modal="modal-abrir-${cliente.cli_id}">
                    <input type="checkbox" ${cliente.cli_ativo ? "checked" : ""}>
                    <span class="slider-status"></span>
                </label>
                <dialog id="modal-abrir-${cliente.cli_id}" class="modal-abrir">
                    <img class="icone-alerta" src="/public/images/modal-alerta.svg" alt="alerta-modal">
                    <h3>Alterar o status do cliente?</h3>
                    <span>Você realmente deseja alterar o status do cliente na plataforma?</span>
                    <div class="botoes-modais">
                        <button class="btn-modal-cancelar" data-modal="modal-abrir-${cliente.cli_id}">Cancelar</button>
                        <button class="btn-modal-fechar btn-tema-alerta" data-modal="modal-abrir-${cliente.cli_id}">Confirmar</button>
                    </div>
                </dialog>
                <a href="/admin/detalhes_clientes.html?id=${cliente.cli_id}" class="botao-detalhes"><img src="/public/images/detalhes-roxo.svg" alt=""></a>

            </td>
        `;
        tbody.appendChild(linha);
    });
}

function normalizar(texto) {
    if (!texto) return '';
    return texto
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[.\-\s()]/g, '')      
        .toLowerCase();
}

document.addEventListener('click', function (e) {
    if (e.target.matches('.status-produto input[type="checkbox"]')) {
        e.preventDefault();
    }
});

document.addEventListener('click', async function (e) {
    const confirmBtn = e.target.closest('.btn-tema-alerta[data-modal^="modal-abrir-"]');
    if (!confirmBtn) return;

    const modalId = confirmBtn.getAttribute('data-modal');
    const clienteId = modalId.replace('modal-abrir-', '');
    const checkbox = document.querySelector(`label[data-modal="${modalId}"] input[type="checkbox"]`);
    if (!checkbox) return;

    const novoStatus = !checkbox.checked; 

    try {
        const resposta = await fetch(`http://localhost:3000/api/cliente/alterarStatus/${clienteId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ativo: novoStatus })
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            mostrarToast(dados.mensagem || 'Erro ao alterar status do cliente', 'erro');
            return;
        }

        checkbox.checked = novoStatus;
        mostrarToast(novoStatus ? 'Cliente ativado' : 'Cliente inativado', 'sucesso');
    } catch (erro) {
        console.error(erro);
        mostrarToast('Não foi possível conectar ao servidor', 'erro');
    }
});


function mostrarErro(id, mensagem) {
    document.getElementById(id).classList.add('erro');
    document.getElementById('erro-' + id).textContent = mensagem;
}

function limparErros() {
    document.querySelectorAll('.placeholder, select').forEach(campo => campo.classList.remove('erro'));
    document.querySelectorAll('.erro-msg').forEach(span => span.textContent = '');
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