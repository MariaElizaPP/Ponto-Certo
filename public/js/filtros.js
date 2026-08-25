const abrirFiltro = document.getElementById("abrirFiltro");
const fecharFiltro = document.getElementById("fecharFiltro");
const painelFiltro = document.getElementById("painelFiltro");
const limparFiltro = document.getElementById("limparFiltro");
const aplicarFiltro = document.getElementById("aplicarFiltro");



abrirFiltro.addEventListener("click", function () {
    painelFiltro.classList.add("ativo");
});



fecharFiltro.addEventListener("click", function () {
    painelFiltro.classList.remove("ativo");
});



limparFiltro.addEventListener("click", function () {

    const checkboxes = painelFiltro.querySelectorAll(
        'input[type="checkbox"]'
    );

    checkboxes.forEach(function (checkbox) {
        checkbox.checked = false;
    });

});


aplicarFiltro.addEventListener("click", function () {
    painelFiltro.classList.remove("ativo");
});