const accordions = document.querySelectorAll('.item-accordion');

accordions.forEach(accordion => {
    const header = accordion.querySelector('.cabecalho-accordion');
    const body = accordion.querySelector('.subcategoria-lista');
    
     header.addEventListener('click', () => {
        body.classList.toggle('active');
    });
    
});