document.addEventListener('click', (e) => {
    
    const closeBtn = e.target.closest('.btn-modal-fechar, .btn-modal-cancelar');
    if (closeBtn) {
        const modal = document.getElementById(closeBtn.getAttribute('data-modal'));
        if (modal) modal.close();
        return;
    }

    const openBtn = e.target.closest('[data-modal]');
    if (openBtn) {
        const modal = document.getElementById(openBtn.getAttribute('data-modal'));
        if (modal) modal.showModal();
    }
});