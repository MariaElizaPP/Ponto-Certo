describe('Fluxo pagamento', () => {

    beforeEach(() => {
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
        cy.get('.comprar').click();
        cy.get('.botao-continuar').click();

    })

    it('Pagamento com sucesso com um cartão', () => {

        cy.get('.linha-enderecos').eq(0).within(() => {
            cy.get('input[type="radio"]').check()
        })

        cy.get('#lista-cartoes').eq(0).within(() => {
            cy.get('input[type="checkbox"]').check()
        })

        cy.get('.btn-modal-abrir').click();

        cy.contains('Compra realizada com sucesso!').should('be.visible');

    });

    it('Pagamento com dois cartões', () => {

        cy.get('.checkbox-pagamento').check()

        cy.get('.linha-enderecos').eq(0).within(() => {
            cy.get('input[type="radio"]').check()
        })

        cy.get('#lista-cartoes input[type="checkbox"]').eq(0).check()
        cy.get('lista-cartoes input[type = "text"]').eq(0).type('50')

        cy.get('#lista-cartoes input[type="checkbox"]').eq(1).check()
        cy.get('lista-cartoes input[type = "text"]').eq(1).type('50')

        cy.get('#botao-finalizar').click();

        cy.get('.btn-modal-abrir').click();

        cy.contains('Compra realizada com sucesso!').should('be.visible');

    });


    it('Pagamento com cupom e cartão', () => {

        cy.get('.linha-enderecos').eq(0).within(() => {
            cy.get('input[type="radio"]').check()
        })

        cy.get('#lista-cartoes').eq(0).within(() => {
            cy.get('input[type="checkbox"]').check()
        })

        cy.get('#btn-abrir-cupom').click();
        cy.get('.campo-cupom').type('SUPER12');
        cy.get('#botao-aplicar').click();

        cy.get('.btn-modal-abrir').click();

        cy.contains('Compra realizada com sucesso!').should('be.visible');


    });

})