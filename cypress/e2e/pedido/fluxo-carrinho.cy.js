describe('Fluxo carrinho', () =>{
    beforeEach(()=>{
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.wait(500);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit("https://pontocertoweb.netlify.app");
        cy.get('.card-produto').eq(0).within(() => {
            cy.get('img[alt="detalhes"]').click()
        });
        cy.get('.adicionar').click();
        cy.get('.btn-modal-abrir').click();
        cy.get('.btn-modal-fechar').click();
    })

    it ('Calcular o frete',() =>{

        cy.get('input[name="cep_carrinho"]').type('08850330').blur();
        cy.get('.botao-consultar-frete').click();

        cy.get('.valor-frete').should('not.have.text', 'R$ 0,00')

    })

    it ('Aumentar a quantidade', () =>{
        cy.get('.botao-aumentar').click()
        cy.get('quantidade-valor').should('have.text', '3')
    })

    it ('Remover um item', () => {
        cy.get('.botao-remover').click()
        cy.get('bnt-modal-fechar').click()

        cy.get('.produto-linha').should('not.exist')
    })
})