document.addEventListener('DOMContentLoaded', () => {
    carregarBandeiras();
});


document.querySelector('.cadastrar').addEventListener('click', async function (e) {
    e.preventDefault();

    const campoNome = document.getElementById('nome');
    const campoDataNascimento = document.getElementById('data-nascimento');
    const campoGenero = document.getElementById('genero');
    const campoTelefone = document.getElementById('telefone');
    const campoCpf = document.getElementById('cpf');
    const campoEmail = document.getElementById('email');
    const campoSenha = document.getElementById('senha');
    const campoConfirmarSenha = document.getElementById('confirmar-senha');

    limparErros();

    let valido = true;

    if (!campoNome.value.trim()) {
        mostrarErro(campoNome, 'O nome é obrigatório');
        valido = false;
    }
    if (!campoDataNascimento.value.trim()) {
        mostrarErro(campoDataNascimento, 'A data de nascimento é obrigatório');
        valido = false;
    }
    if (!campoGenero.value.trim()) {
        mostrarErro(campoGenero, 'O gênero é obrigatório');
        valido = false;
    }
    if (!campoTelefone.value.trim()) {
        mostrarErro(campoTelefone, 'O telefone é obrigatório');
        valido = false;
    }
    if (!campoCpf.value.trim()) {
        mostrarErro(campoCpf, 'O cpf é obrigatório');
        valido = false;
    }
    if (!campoEmail.value.trim()) {
        mostrarErro(campoEmail, 'O email é obrigatório');
        valido = false;
    }

    if (!campoSenha.value.trim()) {
        mostrarErro(campoSenha, 'O senha é obrigatório');
        valido = false;
    }
    if (!campoConfirmarSenha.value.trim()) {
        mostrarErro(campoConfirmarSenha, 'A confirmação da senha é obrigatória');
        valido = false;
    }

    const senhaRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!*@#$%^&(),.?":{}|<>_\-+=~`\[\]\/]).{8,}$/;

    if (campoSenha.value && !senhaRegex.test(campoSenha.value)) {
        mostrarErro("senha", "A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, minúscula e um caractere especial");
        valido = false;
    }

    if (campoSenha.value && campoConfirmarSenha.value && campoSenha.value !== campoConfirmarSenha.value) {
        mostrarErro("confirmar-senha", "As senhas não coincidem");
        valido = false;
    }

    const blocosEndereco = document.querySelectorAll('.bloco-endereco');
    const camposEndereco = [
        ['tipoResidencia', 'O tipo de residência é obrigatório'],
        ['cep', 'O CEP é obrigatório'],
        ['tipoLogradouro', 'O tipo de logradouro é obrigatório'],
        ['cidade', 'A cidade é obrigatória'],
        ['pais', 'O país é obrigatório'],
        ['estado', 'O estado é obrigatório'],
        ['bairro', 'O bairro é obrigatório'],
        ['logradouro', 'O logradouro é obrigatório'],
        ['nomeEndereco', 'O nome do endereço é obrigatório'],
        ['numero', 'O número é obrigatório'],
        ['tipoEndereco', 'O tipo de endereço é obrigatório'],
    ];

    blocosEndereco.forEach((bloco) => {
        camposEndereco.forEach(([name, mensagem]) => {
            if (!validarCampoBloco(bloco, name, mensagem)) valido = false;
        });
    });

    if (blocosEndereco.length > 0) {
        const tipos = Array.from(blocosEndereco).map((b) => b.querySelector('[name="tipoEndereco"]').value);
        if (!tipos.includes('C')) { mostrarToast('É necessário ao menos um endereço de cobrança.', 'erro'); valido = false; }

        if (!tipos.includes('E')) { mostrarToast('É necessário ao menos um endereço de entrega.', 'erro'); valido = false; }
    }

    const blocosCartao = document.querySelectorAll('.bloco-cartao');
    const camposCartao = [
        ['numeroCartao', 'O número do cartão é obrigatório'],
        ['bandeiraCartao', 'A bandeira é obrigatória'],
        ['nomeCartao', 'O nome impresso é obrigatório'],
        ['cvv', 'O código de segurança é obrigatório'],
    ];

    blocosCartao.forEach((bloco) => {
        camposCartao.forEach(([name, mensagem]) => {
            if (!validarCampoBloco(bloco, name, mensagem)) valido = false;
        });
    });

    if (blocosCartao.length > 0) {
        const preferenciais = Array.from(blocosCartao).filter((b) => b.querySelector('input[type="radio"]').checked);
        if (preferenciais.length !== 1) {
            mostrarToast('Marque exatamente um cartão como preferencial.', 'erro');
            valido = false;
        }
    }

    if (!valido) {
        return;
    }

    const dados = {
        nome: campoNome.value.trim(),
        genero: campoGenero.value,
        dataNascimento: campoDataNascimento.value,
        cpf: campoCpf.value.replace(/\D/g, ''),
        telefone: campoTelefone.value.replace(/\D/g, ''),
        email: campoEmail.value.trim(),
        senha: campoSenha.value,
        enderecos: coletarEnderecos(),
        cartoes: coletarCartoes()
    };

    try {
        const resposta = await fetch('http://localhost:3000/api/cadastrarCliente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            exibirErroServidor(resultado.mensagem);
            return;
        }

        document.getElementById('modal-abrir').showModal();

    } catch (error) {
        console.error(error);
        exibirErroServidor('Erro ao conectar com o servidor');
    }
});

function validarCampoBloco(bloco, name, mensagem) {
    const campo = bloco.querySelector(`[name="${name}"]`);
    if (!campo || !campo.value || !campo.value.toString().trim()) {
        if (campo) mostrarErro(campo, mensagem);
        return false;
    }
    return true;
}

function mostrarErro(campo, mensagem) {
    campo.classList.add('erro');
    const container = campo.closest('.campo, .campo-pequeno, .campo-largo');
    const erroSpan = container ? container.querySelector('.erro-msg') : null;
    if (erroSpan) erroSpan.textContent = mensagem;
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

function coletarEnderecos() {
    const blocos = document.querySelectorAll('.bloco-endereco');
    const enderecos = [];

    blocos.forEach((bloco) => {
        enderecos.push({
            tipoResidencia: bloco.querySelector('[name="tipoResidencia"]').value.trim(),
            cep: bloco.querySelector('[name="cep"]').value.replace(/\D/g, ''),
            tipoLogradouro: bloco.querySelector('[name="tipoLogradouro"]').value.trim(),
            cidade: bloco.querySelector('[name="cidade"]').value.trim(),
            pais: bloco.querySelector('[name="pais"]').value.trim(),
            estado: bloco.querySelector('[name="estado"]').value.trim(),
            bairro: bloco.querySelector('[name="bairro"]').value.trim(),
            logradouro: bloco.querySelector('[name="logradouro"]').value.trim(),
            nomeEndereco: bloco.querySelector('[name="nomeEndereco"]').value.trim(),
            numero: bloco.querySelector('[name="numero"]').value.trim(),
            complemento: bloco.querySelector('[name="complemento"]').value.trim() || null,
            tipoEndereco: bloco.querySelector('[name="tipoEndereco"]').value
        });
    });

    return enderecos;
}

function coletarCartoes() {
    const blocos = document.querySelectorAll('.bloco-cartao');
    const cartoes = [];

    blocos.forEach((bloco) => {
        cartoes.push({
            numeroCartao: bloco.querySelector('[name="numeroCartao"]').value.replace(/\D/g, ''),
            bandeiraCartao: bloco.querySelector('[name="bandeiraCartao"]').value,
            nomeCartao: bloco.querySelector('[name="nomeCartao"]').value.trim(),
            cvv: bloco.querySelector('[name="cvv"]').value.trim(),
            preferencial: bloco.querySelector('input[type="radio"]').checked
        });
    });

    return cartoes;
}

async function carregarBandeiras() {
    try {
        const res = await fetch('http://localhost:3000/api/bandeiras');
        const bandeiras = await res.json();

        const select = document.getElementById('bandeira');
        select.querySelectorAll('option:not([hidden])').forEach((opcao) => opcao.remove());

        bandeiras.forEach((bandeira) => {
            const option = document.createElement('option');
            option.value = bandeira.bdr_id;
            option.textContent = bandeira.bdr_nome;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar bandeiras:', error);
    }
}
