describe('Alterar Cliente', () => {
    beforeEach(() => {
        cy.visit('https://pontocertoweb.netlify.app/admin/login'); 
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/clientes');

    })

   it('RF0023 - Cliente inativo não consegue logar', () => {
       cy.get('label.status-produto[data-modal="modal-abrir-2"] .slider-status').click();
       cy.get('.btn-modal-fechar.btn-tema-alerta[data-modal="modal-abrir-2"]').click();
       cy.visit('https://pontocertoweb.netlify.app/login');
       cy.wait(500);
       cy.get('#btn-entrar').click();
       cy.contains('Cliente inativado pelo administrador.').should('be.visible');
    });

    

})
