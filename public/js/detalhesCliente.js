const GENERO_LABEL = { H: 'Masculino', M: 'Feminino', N: 'Prefiro não informar', O: 'Outros' };

const params = new URLSearchParams(window.location.search);
const clienteId = params.get('id');

document.addEventListener('DOMContentLoaded', function () {

    carregarDadosCliente();
});

function apenasNumeros(valor) {
    return valor.replace(/\D/g, '');
}

function mascararTelefone(valor) {
    let v = apenasNumeros(valor).slice(0, 11);
    v = v.replace(/^(\d{2})(\d)/, '($1) $2');
    v = v.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
    return v;
}

async function carregarDadosCliente() {
    try {
        const response = await fetch(`http://localhost:3000/api/detalhesCliente/${clienteId}`);

        if (!response.ok) {
            throw new Error('Erro ao carregar dados do cliente');
        }

        const cliente = await response.json();

        const dataFormatada = new Date(cliente.dadosCadastrais.dataNasc).toLocaleDateString('pt-BR');
        const cpfFormatado = cliente.dadosCadastrais.cpf .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

        document.getElementById('nome').textContent = cliente.dadosCadastrais.nome ?? '';
        document.getElementById('data-nascimento').textContent = dataFormatada?? '';
        document.getElementById('genero').textContent = GENERO_LABEL[cliente.dadosCadastrais.genero] ?? '';
        document.getElementById('email').textContent = cliente.dadosCadastrais.email ?? '';
        document.getElementById('cpf').textContent = cpfFormatado ?? '';
        document.getElementById('telefone').textContent = cliente.dadosCadastrais.telefone ? mascararTelefone(cliente.dadosCadastrais.telefone) : '';
        renderizarEnderecos(cliente.dadosCadastrais.enderecos);
    } catch (erro) {
        console.error(erro);
        exibirErroServidor('Não foi possível carregar os dados do cliente.');
    }
}

function renderizarEnderecos(enderecos) {
    const container = document.getElementById('container-enderecos');

    if (!enderecos || enderecos.length === 0) {
        container.innerHTML = '<p class="sem-endereco">Nenhum endereço cadastrado.</p>';
        return;
    }

    container.innerHTML = enderecos.map(end => {
        const cepFormatado = end.end_cep ? end.end_cep.replace(/(\d{5})(\d{3})/, "$1-$2") : '';

        const tipoExtenso = end.end_tipoEndereco === 'C' ? 'Cobrança' : 'Entrega';

        const complementoText = end.end_complemento ? `, ${end.end_complemento}` : '';

        const enderecoTexto = `${end.end_logradouro} ${end.end_numero}${complementoText}, ${end.end_bairro}, ${end.end_cidade}, ${end.end_estado}, ${cepFormatado}, ${end.end_pais}`;

        return `
            <div class="card_endereco">
                <div class="card-header">
                    <span>${tipoExtenso}</span>
                    <span class="ponto">•</span>
                    <span class="nome-endereco">[${end.end_nomeEndereco || 'Sem apelido'}]</span>
                </div>
                <div class="card-corpo">
                    ${enderecoTexto}
                </div>
            </div>
        `;
    }).join('');
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

