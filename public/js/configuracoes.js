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

function formatarCpf(cpf){
    if(!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
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

window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        carregarConfiguracoes();
    }
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
        document.getElementById('perfil-cpf').textContent = formatarCpf(dados.cpf) ?? '';
}

function preencherEnderecos(enderecos) {
    const container = document.querySelector('.coluna-endereco');
    const cardModelo = document.querySelector('.endereco-card').cloneNode(true); // guarda antes de remover

    container.querySelectorAll('.endereco-card').forEach(el => el.remove());

    enderecos.forEach((endereco, index) => {
        const card = cardModelo.cloneNode(true);

        card.querySelector('.linha-cep').textContent = endereco.end_nomeEndereco;
        card.querySelector('.linha-nome').textContent = montarEnderecoCompleto(endereco);

        card.dataset.enderecoId = endereco.end_id;

        const modal = card.querySelector('dialog');
        const novoIdModal = `modal-endereco-${index}`;
        modal.id = novoIdModal;
        card.querySelectorAll('[data-modal]').forEach(el => {
            el.dataset.modal = novoIdModal;
        });

        const linkAlterar = card.querySelector('.link-alterar');
        if(linkAlterar){
            linkAlterar.href = `/src/views/pagamento/alterar_endereco.html?enderecoId=${endereco.end_id}`;
        }

        container.appendChild(card);
    });
}

function preencherCartoes(cartoes) {
    const container = document.querySelector('.coluna-cartoes');
    const listaModelo = document.querySelector('.lista-cartoes').cloneNode(true); 

    container.querySelectorAll('.lista-cartoes').forEach(el => el.remove()); 

    cartoes.forEach((cartao, index) => {
        const lista = listaModelo.cloneNode(true);
        const card = lista.querySelector('.cartoes-card');

         card.dataset.cartaoId = cartao.car_id;

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

document.addEventListener('click', function (e) {

    const btnRemover = e.target.closest('.btn-tema-alerta');
    if (btnRemover) {
        const card = btnRemover.closest('.cartoes-card');
        if (card) {
            excluirCartao(card.dataset.cartaoId);
            return;
        }
        
    }

    const btnRemoverEndereco = e.target.closest('.btn-tema-alerta');
    if (btnRemoverEndereco) {
        const card = btnRemoverEndereco.closest('.endereco-card');
        if (card) {
            deletarEndereco(card.dataset.enderecoId);
            return;
        }
        
    }

    const btnPreferencial = e.target.closest('.botao-definir-preferencial');
    console.log('btnPreferencial:', btnPreferencial);
    if (btnPreferencial) {
        const card = btnPreferencial.closest('.cartoes-card');
        console.log('card encontrado:', card);
        if (card) {
            definirPreferencial(card.dataset.cartaoId);
        }
    }
});

async function definirPreferencial(cartaoId) {
    try {
        const response = await fetch(`http://localhost:3000/api/cliente/${clienteId}/definirPreferencial/${cartaoId}`, {
            method: 'PATCH'
        });

        const dados = await response.json();

        if (!response.ok) {
            mostrarToast(dados.mensagem || 'Erro ao definir cartão preferencial', 'erro');
            return;
        }
        mostrarToast('Cartão definido como preferencial', 'sucesso');
        carregarConfiguracoes();
    } catch (erro) {
        console.error(erro); 
        mostrarToast('Não foi possível conectar ao servidor', 'erro');
    }
}

async function excluirCartao(cartaoId) {
    try {
        const response = await fetch(`http://localhost:3000/api/cliente/${clienteId}/cartoes/${cartaoId}`, {
            method: 'DELETE'
        });

        const dados = await response.json();

        if (!response.ok) {
            mostrarToast(dados.mensagem || 'Erro ao remover o cartão', 'erro');
            return;
        }

        mostrarToast(dados.mensagem, 'sucesso');
        carregarConfiguracoes();

    } catch (erro) {
        console.error(erro);
        mostrarToast('Não foi possível conectar ao servidor', 'erro');
    }
}


async function deletarEndereco(enderecoId) {

    try{
        const response = await fetch(`http://localhost:3000/api/deletarEndereco/${clienteId}/${enderecoId}`, {
            method: 'DELETE'
        });

        const dados = await response.json();

        if (!response.ok){
            mostrarToast (dados.mensagem || 'Erro ao excluir o endereço', 'erro');
            return;
        }
        mostrarToast('Endereço excluído', 'sucesso');
        carregarConfiguracoes();
    } catch(erro){
        console.error(erro);
        mostrarToast('Não foi possível conectar ao servidor', 'erro');
    }
    
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
