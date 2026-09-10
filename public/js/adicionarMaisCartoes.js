document.addEventListener('DOMContentLoaded', () => {
  const btnAddCartao = document.getElementById('btn-add-cartao');
  const blocosCartao = document.querySelector('.blocos-cartao');

  let contadorCartao = 1;

  btnAddCartao.addEventListener('click', () => {
    const blocoModelo = blocosCartao.querySelector('.bloco-cartao');
    const novoBloco = blocoModelo.cloneNode(true);

    novoBloco.querySelectorAll('input, select').forEach((campo) => {
      if (campo.type === 'radio') {
        campo.checked = false;
      } else if (campo.tagName === 'SELECT') {
        campo.selectedIndex = 0;
      } else {
        campo.value = '';
      }

      if (campo.id) {
        campo.id = `${campo.id}-${contadorCartao}`;
      }
    });

    novoBloco.querySelectorAll('.erro-msg').forEach((erro) => {
      erro.textContent = '';
      if (erro.id) {
        erro.id = `${erro.id}-${contadorCartao}`;
      }
    });

    novoBloco.querySelectorAll('label[for]').forEach((label) => {
      const forAtual = label.getAttribute('for');
      label.setAttribute('for', `${forAtual}-${contadorCartao}`);
    });

    novoBloco.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.name = 'cartao-preferencial';
    });

    const botaoRemover = document.createElement('button');
    botaoRemover.type = 'button';
    botaoRemover.className = 'botao-remover';
    botaoRemover.textContent = 'Remover cartão';
    botaoRemover.addEventListener('click', () => novoBloco.remove());
    novoBloco.appendChild(botaoRemover);

    blocosCartao.appendChild(novoBloco);
    contadorCartao++;
  });

  const radioInicial = blocosCartao.querySelector('input[type="radio"]');
  if (radioInicial) radioInicial.name = 'cartao-preferencial';
});