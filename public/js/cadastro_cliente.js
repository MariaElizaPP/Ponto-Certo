document.addEventListener('DOMContentLoaded', () => {
    carregarBandeiras();
});


document.querySelector('.cadastrar').addEventListener('click', async function(e){
    e.preventDefault();

    const nomeCompleto = document.getElementById('nome').value.trim();
    const dataNascimento = document.getElementById('data-nascimento').value.trim();
    const genero = document.getElementById('genero').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const confirmarSenha = document.getElementById('confirmar-senha').value.trim();
   

    limparErros();

    let valido = true;

    if (!nomeCompleto){
        mostrarErro('nome', 'O nome é obrigatório');
        valido = false;
    }
    if (!dataNascimento){
        mostrarErro('data-nascimento', 'A data de nascimento é obrigatório');
        valido = false;
    }
    if (!genero){
        mostrarErro('genero', 'O gênero é obrigatório');
        valido = false;
    }
    if (!telefone){
        mostrarErro('telefone', 'O telefone é obrigatório');
        valido = false;
    }
    if (!cpf){
        mostrarErro('cpf', 'O cpf é obrigatório');
        valido = false;
    }
    if (!email){
        mostrarErro('email', 'O email é obrigatório');
        valido = false;
    }
    if (!senha){
        mostrarErro('senha', 'O senha é obrigatório');
        valido = false;
    }
    if (!confirmarSenha){
        mostrarErro('confirmar-senha', 'A confirmação da senha é obrigatória');
        valido = false;
    }
   
    const senhaRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!*@#$%^&(),.?":{}|<>_\-+=~`\[\]\/]).{8,}$/;
    
    if(!senhaRegex.test(senha) ){
        mostrarErro("senha", "A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, minúscula e um caractere especial");
        valido = false;
    }
    
    if(senha !== confirmarSenha){
        mostrarErro("confirmar-senha", "As senhas não coincidem");
        valido = false;
    }

    if(!valido){
        return;
    }

     const dados = {
        nome: nomeCompleto,
        genero,
        dataNascimento,
        cpf: cpf.replace(/\D/g, ''),
        telefone: telefone.replace(/\D/g, ''),
        email,
        senha,
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

function mostrarErro(id, mensagem){
    document.getElementById(id).classList.add('erro');
    document.getElementById('erro-' + id).textContent = mensagem;
}

function limparErros(){
    document.querySelectorAll('.placeholder').forEach(campo => campo.classList.remove('erro'));
    document.querySelectorAll('.erro-msg').forEach(span => span.textContent = '');
}

function exibirErroServidor(mensagem){
    alert(mensagem); // pode trocar depois por um componente de erro mais visual
}

function coletarEnderecos(){
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

function coletarCartoes(){
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

async function carregarBandeiras(){
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

