describe('Fluxo carrinho', () => {

    beforeEach(() => {
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
        cy.window().its('localStorage.clienteId').should('exist');

        cy.visit('https://pontocertoweb.netlify.app');
        cy.get('.card-produto').eq(0).within(() => {
            cy.get('img[alt="detalhes"]').click()
        });
        cy.get('#seletor-cor-atual').click();
        cy.get('#seletor-cor-lista').invoke('css', 'display', 'flex')
        cy.get('.seletor-cor-item').first().click()
        cy.get('#seletor-cor-lista').invoke('css', 'display', 'none')
        cy.get('.adicionar').click();
        cy.get('.btn-modal-abrir').click();
        cy.get('.btn-modal-fechar').click();

        cy.visit('https://pontocertoweb.netlify.app/carrinho');
        cy.get('.produto-linha').should('exist');
    })

    it('Aumentar a quantidade', () => {
        cy.get('.quantidade-valor').first().invoke('text').then((antes) => {
            cy.get('.botao-aumentar').first().click()
            cy.get('.quantidade-valor').first().should('have.text', String(Number(antes) + 1))
        })
    })

    it('Calcular o frete', () => {
        cy.get('.input-cep').type('08850330').blur();
        cy.get('.botao-consultar-frete').click();

        cy.get('.valor-frete', { timeout: 10000 }).should('not.have.text', 'R$ 0,00')
    })

    it('Remover um item', () => {
        cy.get('.produto-linha').its('length').then((antes) => {
            cy.get('.botao-remover').first().click()
            cy.get('.btn-modal-fechar').first().click()

            cy.get('.produto-linha').should('have.length', antes - 1)
        })
    })

})