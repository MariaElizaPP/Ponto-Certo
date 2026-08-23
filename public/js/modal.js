
const openButtons = document.querySelectorAll('[data-modal]');

openButtons.forEach(button =>{
    button.addEventListener('click', () =>{
        const modalId = button.getAttribute('data-modal');
        const modal = document.getElementById(modalId);

        modal.showModal();
    });
        
});

const closeButtons = document.querySelectorAll('.btn-modal-fechar');

closeButtons.forEach(button =>{
    button.addEventListener('click', () =>{
        const modalId = button.getAttribute('data-modal');
        const modal = document.getElementById(modalId);

        modal.close();
    });
});

const cancelButtons = document.querySelectorAll('.btn-modal-cancelar');

cancelButtons.forEach(button =>{
    button.addEventListener('click', () =>{
        const modalId = button.getAttribute('data-modal');
        const modal = document.getElementById(modalId);

        modal.close();
    })
})