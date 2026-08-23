const checkboxMaisCartoes = document.querySelector('.checkbox-pagamento');
const checkboxes = document.querySelectorAll('.checkbox-cartao');

let ultimoCartaoMarcado;

checkboxes.forEach(function(checkboxAtual){
    checkboxAtual.addEventListener('click', () =>{
        const containerInput = checkboxAtual.closest('.container-cartao').querySelector('.input-cartao');

        const inputValor = containerInput.querySelector('.valor-cartao');
        const tituloValor = containerInput.querySelector('.input-titulo');

        if(checkboxMaisCartoes.checked){
            if(checkboxAtual.checked){
                ultimoCartaoMarcado = checkboxAtual;
                inputValor.classList.remove('escondido')
                tituloValor.classList.remove('escondido')
            }else{
                inputValor.classList.add('escondido');
                tituloValor.classList.add('escondido');
                inputValor.value = '';
            }
            return;
        }  
    
        
        checkboxes.forEach(function(outroCartao){
                    
            if(outroCartao.checked &&  outroCartao !== checkboxAtual){
                outroCartao.checked = false;
            }

            const containerOutro = outroCartao.closest('.container-cartao').querySelector('.input-cartao');
            containerOutro.querySelector('.valor-cartao').classList.add('escondido');
            containerOutro.querySelector('.input-titulo').classList.add('escondido');
        });
        ultimoCartaoMarcado = checkboxAtual;
    });
    
    
});        

checkboxMaisCartoes.addEventListener('change', function(){
    if(this.checked === false ){
        checkboxes.forEach(function(checkbox){
            const containerInput = checkbox.closest('.container-cartao').querySelector('.input-cartao');
            const inputValor = containerInput.querySelector('.valor-cartao');
            const tituloValor = containerInput.querySelector('.input-titulo');

            if(checkbox.checked && checkbox != ultimoCartaoMarcado ){
                checkbox.checked = false;
            }
            inputValor.classList.add('escondido');
            tituloValor.classList.add('escondido');
            inputValor.value = '';
        })
    }
});

function getCartoesComValor(){
  const cartoesMarcados = document.querySelectorAll('.checkbox-cartao:checked');

  return Array.from(cartoesMarcados).map(checkbox => {
    const inputValor = checkbox.closest('.container-cartao').querySelector('.valor-cartao');

    return{
      elemento: checkbox,
      valor: parseFloat(inputValor.value)
    }
  })
}

function validarValoresCartoes() {
  const cartoes = getCartoesComValor();

  if (cartoes.length <= 1) {
    return { valido: true, mensagem: '' };
  }

  const totalCupons = getTotalCupons();
  const subtotalCompra = 35; 

  const valorRestanteAposCupons = subtotalCompra - totalCupons;

  for (const cartao of cartoes) {
    if (cartao.valor < 10) {
     
      const excecaoValida = totalCupons > 0 && valorRestanteAposCupons < 10;

      if (!excecaoValida) {
        return {
          valido: false,
          mensagem: 'Cada cartão precisa de no mínimo R$10,00 (exceto quando cupons cobrem o restante).'
        };
      }
    }
  }

  return { valido: true, mensagem: '' };
}

const containerCartoes = document.querySelector('.pagamento-card');

containerCartoes.addEventListener('input', (evento) => {
  if (evento.target.classList.contains('valor-cartao')) {
    atualizarEstadoBotaoFinalizar();
  }
});

function atualizarEstadoBotaoFinalizar() {
  const botaoFinalizar = document.querySelector('.btn-modal-abrir');
  const mensagemErro = document.getElementById('mensagem-erro-cartoes');
  const resultado = validarValoresCartoes();

  mensagemErro.textContent = resultado.mensagem;
  botaoFinalizar.disabled = !resultado.valido;
}