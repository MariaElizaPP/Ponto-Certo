describe('Alterar Cliente', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/login.html'); 
        cy.wait(500);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('http://localhost:3000/clientes.html');

    })

   it('RF0023 - Cliente inativo não consegue logar', () => {
        
        cy.request('PATCH', 'http://localhost:3000/api/cliente/alterarStatus/2', {
            ativo: false
        });

        
        cy.visit('http://localhost:3000/login.html');
        cy.get('.btn-entrar').click();

        cy.get('#toast').should('be.visible').and('contain', 'Cliente inativado pelo administrador.');
    });

    afterEach(() => {
        
        cy.request('PATCH', 'http://localhost:3000/api/cliente/alterarStatus/2', {
            ativo: true
        });
    });

})
