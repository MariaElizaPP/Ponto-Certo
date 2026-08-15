const contarQtd = document.querySelector(".contar");
const remover = document.querySelector(".remover");
const adicionar = document.querySelector(".adicionar");

let quantidade = 0;

const atualizarContador = (novaConta) => {
    quantidade = novaConta;
    contarQtd.textContent = quantidade;
};

remover.addEventListener('click', ()=>{
   if(quantidade > 0) {
    atualizarContador(quantidade - 1);
   }
})

adicionar.addEventListener('click', ()=>{
   atualizarContador(quantidade + 1);
})
