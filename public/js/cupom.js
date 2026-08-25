document.addEventListener('DOMContentLoaded', () => {
  const btnAbrir = document.getElementById('btn-abrir-cupom');
  const btnCancelar = document.getElementById('botao-cancelar-cupom');
  const container = document.getElementById('container-campo-cupom');

  btnAbrir.addEventListener('click', () => {
    container.classList.remove('escondido');
    btnAbrir.style.display = 'none';
  });

  btnCancelar.addEventListener('click', () => {
    container.classList.add('escondido');
    btnAbrir.style.display = 'inline';
  });
});

const cuponsDisponiveis = [
  { codigo: 'PROMO10', tipo: 'promocional', valor: 10 },
  { codigo: 'TROCA20', tipo: 'troca', valor: 20 },
  { codigo: 'PROMO25', tipo: 'promocional', valor: 25 },
];

const cuponsAplicados = [];

function aplicarCupom(codigoDigitado){
  const cupom = cuponsDisponiveis.find(c => c.codigo === codigoDigitado);

  if(!cupom){
    return { sucesso: false, mensagem: 'Cupom inválido.' };
  }

  const usoPromocional = cuponsAplicados.some(c => c.tipo === 'promocional');
  if(cupom.tipo === 'promocional' && usoPromocional){
    return{
      sucesso: false,
      mensagem: 'Só é permitido um cupom promocional por compra.'
    };
  }

  const cupomEmUso = cuponsAplicados.some(c => c.codigo === cupom.codigo);
  if(cupomEmUso){
    return{
      sucesso: false,
      mensagem:'Esse cupom já foi aplicado'
    };
  }

  cuponsAplicados.push(cupom);
  return{
    sucesso: true,
    
  };

}

function removerCupom(codigo){
  const index = cuponsAplicados.findIndex(c => c.codigo === codigo);
  if(index !== -1){
    cuponsAplicados.splice(index, 1);

  }
}

function renderizarCuponsAplicados() {
  const lista = document.getElementById('lista-cupons-aplicados');
  lista.innerHTML = '';

  cuponsAplicados.forEach(cupom => {
    const item = document.createElement('div');
    item.className = 'cupom-aplicado';
    item.innerHTML = `
      <span>${cupom.codigo} - R$${cupom.valor.toFixed(2)}</span>
      <img src="/public/images/remover-carrinho.svg" class="botao-remover-cupom" data-codigo="${cupom.codigo}" alt="Remover cupom">
    `;

    
    lista.appendChild(item);
  });

  lista.querySelectorAll('.botao-remover-cupom').forEach(botao => {
    botao.addEventListener('click', () => {
      removerCupom(botao.dataset.codigo);
      renderizarCuponsAplicados();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const btnAbrir = document.getElementById('btn-abrir-cupom');
  const btnCancelar = document.getElementById('botao-cancelar-cupom');
  const btnAplicarCupom = document.getElementById('botao-aplicar');
  const container = document.getElementById('container-campo-cupom');
  const campoCupom = document.querySelector('.campo-cupom');
  const mensagemCupom = document.getElementById('mensagem-cupom');

  btnAbrir.addEventListener('click', () => {
    container.classList.remove('escondido');
    btnAbrir.style.display = 'none';
  });

  btnCancelar.addEventListener('click', () => {
    container.classList.add('escondido');
    btnAbrir.style.display = 'inline';
    campoCupom.value = '';
    mensagemCupom.textContent = '';
  });

  btnAplicarCupom.addEventListener('click', () => {
    const codigo = campoCupom.value.trim().toUpperCase();

    if (!codigo) {
      mensagemCupom.textContent = 'Digite um código de cupom.';
      return;
    }

    const resultado = aplicarCupom(codigo);
    mensagemCupom.textContent = resultado.mensagem;

    if (resultado.sucesso) {
      campoCupom.value = '';
      renderizarCuponsAplicados();
    }
  });
});

function getTotalCupons() {
  return cuponsAplicados.reduce((soma, cupom) => soma + cupom.valor, 0);
}