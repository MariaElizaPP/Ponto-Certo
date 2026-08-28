document.addEventListener('DOMContentLoaded', () => {
  const btnAddEndereco = document.getElementById('btn-add-endereco');
  const blocosEndereco = document.querySelector('.blocos-endereco');

  let contadorEndereco = 1;

  btnAddEndereco.addEventListener('click', () => {
    const blocoModelo = blocosEndereco.querySelector('.bloco-endereco');
    const novoBloco = blocoModelo.cloneNode(true);

    novoBloco.querySelectorAll('input, select').forEach((campo) => {
      if (campo.tagName === 'SELECT') {
        campo.selectedIndex = 0;
      } else {
        campo.value = '';
      }

      if (campo.id) {
        campo.id = `${campo.id}-${contadorEndereco}`;
      }
    });

    novoBloco.querySelectorAll('.erro-msg').forEach((erro) => {
      erro.textContent = '';
      if (erro.id) {
        erro.id = `${erro.id}-${contadorEndereco}`;
      }
    });

    novoBloco.querySelectorAll('label[for]').forEach((label) => {
      const forAtual = label.getAttribute('for');
      label.setAttribute('for', `${forAtual}-${contadorEndereco}`);
    });

    const botaoRemover = document.createElement('button');
    botaoRemover.type = 'button';
    botaoRemover.className = 'botao-remover';
    botaoRemover.textContent = 'Remover endereço';
    botaoRemover.addEventListener('click', () => novoBloco.remove());
    novoBloco.appendChild(botaoRemover);

    blocosEndereco.appendChild(novoBloco);
    contadorEndereco++;
  });
});