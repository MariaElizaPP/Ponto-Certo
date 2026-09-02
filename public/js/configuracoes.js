const clienteId = localStorage.getItem('clienteId');
const GENERO_LABEL = { H: 'Masculino', M: 'Feminino', N: 'Prefiro não informar', O: 'Outros' };

function formatarTelefone(telefone) {
    if (!telefone) return '';
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }
    if (numeros.length === 10) {
        return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }
    return telefone;
}

function formatarCep(cep) {
    if (!cep) return '';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
}

function montarEnderecoCompleto(endereco) {
    const partes = [
        `${endereco.end_logradouro}, ${endereco.end_numero}`,
        endereco.end_complemento,
        endereco.end_bairro,
        endereco.end_cidade,
        endereco.end_estado,
        formatarCep(endereco.end_cep),
        endereco.end_pais
    ].filter(Boolean);

    return partes.join(', ');
}

document.addEventListener('DOMContentLoaded', function () {
    if (!clienteId) {
        window.location.href = '../../src/views/login.html';
        return;
    }
    carregarConfiguracoes();
});

async function carregarConfiguracoes() {
    try {
        const [dadosRes, cartoesRes, enderecosRes] = await Promise.all([
            fetch(`http://localhost:3000/api/dadosCadastrais/${clienteId}`),
            fetch(`http://localhost:3000/api/listarCartoes/${clienteId}`),
            fetch(`http://localhost:3000/api/listarEnderecos/${clienteId}`)
        ]);

        if (!dadosRes.ok || !cartoesRes.ok || !enderecosRes.ok) {
            exibirErroServidor("Erro ao carregar os dados da conta");
        }

        const dados = await dadosRes.json();
        const cartoes = await cartoesRes.json();
        const enderecos = await enderecosRes.json();

        preencherPerfil(dados);
        preencherEnderecos(enderecos);
        preencherCartoes(cartoes);
    } catch (error) {
        console.log(error);
        exibirErroServidor("Não foi possível carregar as configurações da conta.");
    }
}

function preencherPerfil(dados) {
    document.getElementById('perfil-nome').textContent = dados.nome ?? '',
        document.getElementById('perfil-genero').textContent = GENERO_LABEL[dados.genero] ?? dados.genero ?? '';
    document.getElementById('perfil-telefone').textContent = formatarTelefone(dados.telefone),
        document.getElementById('perfil-cpf').textContent = dados.cpf ?? '';
}

function preencherEnderecos(enderecos) {
    const container = document.querySelector('.coluna-endereco');
    const cardModelo = document.querySelector('.endereco-card').cloneNode(true); // guarda antes de remover

    container.querySelectorAll('.endereco-card').forEach(el => el.remove());

    enderecos.forEach((endereco, index) => {
        const card = cardModelo.cloneNode(true);

        card.querySelector('.linha-cep').textContent = endereco.end_nomeEndereco;
        card.querySelector('.linha-nome').textContent = montarEnderecoCompleto(endereco);

        const modal = card.querySelector('dialog');
        const novoIdModal = `modal-endereco-${index}`;
        modal.id = novoIdModal;
        card.querySelectorAll('[data-modal="modal-abrir-1"]').forEach(el => {
            el.dataset.modal = novoIdModal;
        });

        container.appendChild(card);
    });
}

function preencherCartoes(cartoes) {
    const container = document.querySelector('.coluna-cartoes');
    const listaModelo = document.querySelector('.lista-cartoes').cloneNode(true); // guarda antes de remover

    container.querySelectorAll('.lista-cartoes').forEach(el => el.remove()); // limpa gerações anteriores, se a função rodar de novo

    cartoes.forEach((cartao, index) => {
        const lista = listaModelo.cloneNode(true);
        const card = lista.querySelector('.cartoes-card');

        card.querySelector('.linha-cartao').textContent = cartao.bdr_nome ?? '';
        card.querySelectorAll('.linha-nome')[0].textContent = cartao.car_nomeImpresso ?? '';
        card.querySelectorAll('.linha-nome')[1].textContent = `${cartao.car_numero.slice(0, 4)} **** **** ****`;

        const principal = card.querySelector('.cartao-principal');
        if (principal) principal.style.display = cartao.car_preferencial ? '' : 'none';

        const modal = card.querySelector('dialog');
        const novoIdModal = `modal-cartao-${index}`;
        modal.id = novoIdModal;
        card.querySelectorAll('[data-modal]').forEach(el => el.dataset.modal = novoIdModal);

        container.appendChild(lista);
    });
}

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
