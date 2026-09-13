function buscaCep() {
    let campoCep = document.getElementById('cep');
    let cep = apenasNumeros(campoCep.value);

    limparErros();

    if (cep === "") {
        return;
    }

    if (!validarFormatoCep(cep)) {
        return;
    }

    let url = "https://brasilapi.com.br/api/cep/v1/" + cep;

    let req = new XMLHttpRequest();
    req.open("GET", url);
    req.send();

    //tratar a resposta da requisicao
    req.onload = function () {
        if (req.status === 200) {
            let endereco = JSON.parse(req.response);
            document.getElementById("logradouro").value = endereco.street;
            document.getElementById("bairro").value = endereco.neighborhood;
            document.getElementById("cidade").value = endereco.city;
            document.getElementById("estado").value = endereco.state;
            document.getElementById("pais").value = "Brasil";

        }
        else if (req.status === 404) {
            mostrarErro('cep', 'CEP não encontrado');
        }
        else if (req.status === 400) {
            mostrarErro('cep', 'Insira um CEP válido');
        }
    }
}

function apenasNumeros(valor) {
    return valor.replace(/\D/g, '');
}

function validarFormatoCep(cep) {

    if (cep.length !== 8) {
        mostrarErro('cep', 'O CEP deve conter 8 dígitos');
        return false;
    }

    if (/^(\d)\1{7}$/.test(cep)) {
        mostrarErro('cep', 'Insira um CEP válido');
        return false;
    }

    return true;
}


function mostrarErro(id, mensagem) {
    document.getElementById(id).classList.add('erro');
    document.getElementById('erro-' + id).textContent = mensagem;
}

function limparErros() {
    document.querySelectorAll('.placeholder').forEach(campo => campo.classList.remove('erro'));
    document.querySelectorAll('.erro-msg').forEach(span => span.textContent = '');
}

window.onload = function () {
    let cep = document.getElementById("cep");
    cep.addEventListener("blur", buscaCep);
}