document.addEventListener("DOMContentLoaded", () => {
  const produtos = document.querySelectorAll(".produto-linha");

  produtos.forEach((produto) => {
    const btnAumentar = produto.querySelector(".botao-aumentar");
    const btnDiminuir = produto.querySelector(".botao-diminuir");
    const quantidadeEl = produto.querySelector(".quantidade-valor");
    const totalProdutoEl = produto.querySelector(".total-produto");
    const btnRemover = produto.querySelector(".btn-modal-fechar");

    const precoUnitario = parseFloat(produto.dataset.preco);

    function atualizarTotalProduto() {
      const quantidade = parseInt(quantidadeEl.textContent);
      const total = precoUnitario * quantidade;
      totalProdutoEl.textContent = formatarMoeda(total);
      atualizarResumo();
    }

    btnAumentar.addEventListener("click", () => {
      let quantidade = parseInt(quantidadeEl.textContent);
      quantidade++;
      quantidadeEl.textContent = quantidade;
      atualizarTotalProduto();
    });

    btnDiminuir.addEventListener("click", () => {
      let quantidade = parseInt(quantidadeEl.textContent);
      if (quantidade > 1) {
        quantidade--;
        quantidadeEl.textContent = quantidade;
        atualizarTotalProduto();
      }
    });

    btnRemover.addEventListener("click", () => {
      produto.remove();
      atualizarResumo();
    });
  });

  function atualizarResumo() {
    const linhas = document.querySelectorAll(".produto-linha");
    let subtotal = 0;

    linhas.forEach((linha) => {
      const preco = parseFloat(linha.dataset.preco);
      const quantidade = parseInt(linha.querySelector(".quantidade-valor").textContent);
      subtotal += preco * quantidade;
    });

    document.querySelector(".valor-subtotal").textContent = formatarMoeda(subtotal);
    document.querySelector(".valor-total").textContent = formatarMoeda(subtotal);
  }

  function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  atualizarResumo();
});