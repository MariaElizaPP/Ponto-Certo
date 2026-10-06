describe('Fluxo - detalhes', () => {
    beforeEach(() => {
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.wait(500);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit("https://pontocertoweb.netlify.app");
    })

    it('Ultrapassar a quantidade no estoque', () => {
        cy.get('.card-produto').eq(1).within(() => {
            cy.get('img[alt = "detalhes"]').click()
        });
        cy.get('#seletor-cor-atual').click();
        cy.get('#seletor-cor-lista').invoke('css', 'display', 'flex')
        cy.get('.seletor-cor-item').first().click()
        cy.get('#seletor-cor-lista').invoke('css', 'display', 'none')
        cy.get('.adicionar').click();
        cy.get('.adicionar').click();
        cy.get('.adicionar').click();
        cy.get('.btn-modal-abrir').click();

        cy.contains('Quantidade solicitada indisponível em estoque.').should('be.visible');

    })

    it('Item indisponivel no estoque', () => {
        cy.get('.card-produto').eq(2).within(() => {
            cy.get('img[alt = "detalhes"]').click()
        });
        cy.get('#seletor-cor-atual').click();
        cy.get('#seletor-cor-lista').invoke('css', 'display', 'flex')
        cy.get('.seletor-cor-item').first().click()
        cy.get('#seletor-cor-lista').invoke('css', 'display', 'none')
        cy.get('.adicionar').click();
        cy.get('.btn-modal-abrir').click();

        cy.contains('Quantidade solicitada indisponível em estoque.').should('be.visible');

    })

})