// Seleção dos elementos do HTML 
const botaoAbrir = document.getElementById('abrir-chatbot');
const botaoFechar = document.getElementById('fechar-chatbot');
const chatbot = document.getElementById('chatbot');

const campoMensagem = document.getElementById('campo-mensagem');
const listaMensagens = document.getElementById('lista-mensagens');
const botaoEnviar = document.getElementById('botao-enviar');


// Abrir e fechar o chat 

botaoAbrir.addEventListener('click', function () {
  chatbot.classList.add('aberto');
});

botaoFechar.addEventListener('click', function () {
  chatbot.classList.remove('aberto');
});


// Adicionar mensagem do usuário na tela 

function adicionarMensagemUsuario(texto) {
  const novaMensagem = document.createElement('li');
  novaMensagem.classList.add('mensagem', 'mensagem-usuario');
  novaMensagem.innerHTML = `<p>${texto}</p>`;

  listaMensagens.appendChild(novaMensagem);
  listaMensagens.scrollTop = listaMensagens.scrollHeight;
}


// Adicionar mensagem do bot na tela

function adicionarMensagemBot(texto) {
  const novaMensagem = document.createElement('li');
  novaMensagem.classList.add('mensagem', 'mensagem-bot');
  novaMensagem.innerHTML = `<p>${texto}</p>`;

  listaMensagens.appendChild(novaMensagem);
  listaMensagens.scrollTop = listaMensagens.scrollHeight;
}


//Simular uma resposta do botão//

function responderComoBot(textoDigitado) {
  setTimeout(function () {
    const texto = textoDigitado.toLowerCase();

    if (texto.includes('lã')) {
      adicionarMensagemBot('Temos várias opções de lã disponíveis! Você prefere lã lisa ou texturizada?');
    } else if (texto.includes('preço') || texto.includes('preco')) {
      adicionarMensagemBot('Nossos produtos variam de R$5,90 a R$45,00, dependendo do tipo.');
    } else if (texto.includes('entrega') || texto.includes('frete')) {
      adicionarMensagemBot('O prazo de entrega varia de acordo com o seu CEP. Você pode conferir na tela de pagamento!');
    } else {
      adicionarMensagemBot('Deixa eu verificar isso pra você! Um momento...');
    }
  }, 1500);
}


// Função principal: enviar mensagem

function enviarMensagem() {
  const textoDigitado = campoMensagem.value.trim();

  if (textoDigitado === '') {
    return; 
  }

  adicionarMensagemUsuario(textoDigitado);
  campoMensagem.value = ''; 

  responderComoBot(textoDigitado);
}


//  Eventos que disparam o envio 


botaoEnviar.addEventListener('click', enviarMensagem);


campoMensagem.addEventListener('keydown', function (evento) {
  if (evento.key === 'Enter' && !evento.shiftKey) {
    evento.preventDefault();
    enviarMensagem();
  }
});