const cuponsAplicados = [];

document.addEventListener('DOMContentLoaded', () => {
  const btnAbrir = document.getElementById('btn-abrir-cupom');
  const btnCancelar = document.getElementById('botao-cancelar-cupom');
  const btnAplicar = document.getElementById('botao-aplicar');
  const container = document.getElementById('container-campo-cupom');
  const campoCupom = document.querySelector('.campo-cupom');
  const mensagemCupom = document.getElementById('mensagem-cupom');
  const lista = document.getElementById('lista-cupons-aplicados');

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

  btnAplicar.addEventListener('click', async () => {
    const codigo = campoCupom.value.trim().toUpperCase();

    if (!codigo) {
      mensagemCupom.textContent = 'Digite um código de cupom.';
      return;
    }

    btnAplicar.disabled = true;

    try {
      const resultado = await aplicarCupom(codigo);
      mensagemCupom.textContent = resultado.mensagem;

      if (resultado.sucesso) {
        campoCupom.value = '';
        renderizarCuponsAplicados();
      }
    } catch (erro) {
      console.error(erro);
      mensagemCupom.textContent = 'Não foi possível validar o cupom.';
    } finally {
      btnAplicar.disabled = false;
    }
  });

  lista.addEventListener('click', (e) => {
    if (e.target.matches('.botao-remover-cupom')) {
      removerCupom(e.target.dataset.codigo);
      renderizarCuponsAplicados();
    }
  });
});

async function buscarCupom(codigo) {
  const response = await fetch(
    `http://localhost:3000/api/validarCupom/${encodeURIComponent(codigo)}?cliId=${clienteId}`
  );
  const dados = await response.json().catch(() => ({}));

  if (!response.ok) {
    return { sucesso: false, mensagem: dados.mensagem || 'Cupom inválido.' };
  }

  return { sucesso: true, cupom: dados };
}

async function aplicarCupom(codigo) {
  const cupomEmUso = cuponsAplicados.some(c => c.codigo === codigo);

  if (cupomEmUso) {
    return { sucesso: false, mensagem: 'Esse cupom já foi aplicado.' };
  }

  const resultado = await buscarCupom(codigo);

  if (!resultado.sucesso) {
    return resultado;
  }

  const cupom = resultado.cupom;
  const jaTemPromocional = cuponsAplicados.some(c => c.tipo === 'promocional');

  if (cupom.tipo === 'promocional' && jaTemPromocional) {
    return { sucesso: false, mensagem: 'Só é permitido um cupom promocional por compra.' };
  }

  cuponsAplicados.push(cupom);
  adicionarCupomAplicado(cupom.codigo, Number(cupom.valor));

  return { sucesso: true, mensagem: '' };
}

function removerCupom(codigo) {
  const index = cuponsAplicados.findIndex(c => c.codigo === codigo);

  if (index !== -1) {
    cuponsAplicados.splice(index, 1);
    removerCupomAplicado(codigo); 
  }
}

function renderizarCuponsAplicados() {
  const lista = document.getElementById('lista-cupons-aplicados');
  lista.innerHTML = '';

  cuponsAplicados.forEach(cupom => {
    const item = document.createElement('div');
    item.className = 'cupom-aplicado';

    const texto = document.createElement('span');
    texto.textContent = `${cupom.codigo} - ${Number(cupom.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;

    const botao = document.createElement('img');
    botao.src = '/public/images/remover-carrinho.svg';
    botao.className = 'botao-remover-cupom';
    botao.dataset.codigo = cupom.codigo;
    botao.alt = 'Remover cupom';

    item.append(texto, botao);
    lista.appendChild(item);
  });
}