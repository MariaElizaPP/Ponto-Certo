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