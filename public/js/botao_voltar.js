document.querySelectorAll('.botao-voltar').forEach(botao => {
  botao.addEventListener('click', () => {
    window.history.back();
  });
});