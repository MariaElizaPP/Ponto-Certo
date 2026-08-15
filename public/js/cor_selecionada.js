const cores = document.querySelectorAll('.cor');

cores.forEach(cor =>{
    cor.addEventListener('click', () =>{
        cores.forEach(c => c.classList.remove('cor-selecionada'));
        cor.classList.add('cor-selecionada');
    });
});

