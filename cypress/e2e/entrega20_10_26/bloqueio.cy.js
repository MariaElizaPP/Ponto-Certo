describe('Bloqueio dos produtos', () => {
    beforeEach(()=>{
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.wait(500);
        cy.get('#btn-entrar').click();
        cy.wait(500)
    })
    

    it('Tempo limite parametrizável e enviar notificação antes do bloqueio expirar(RN0044)', () => {
        
        cy.visit("https://pontocertoweb.netlify.app");
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
        cy.get('.comprar').click();
        
        cy.wait(25000);
        
        cy.visit('https://pontocertoweb.netlify.app/notificacoes');

        cy.reload();
        
        cy.pause();
    });

    it('Carrinho expirado', () => {
        
        cy.wait(25000);

        cy.visit('https://pontocertoweb.netlify.app/carrinho');
        
        //cy.reload();

        cy.get('#removidos p')
            .invoke('text')
            .should('match', /ficaram mais de 1 minutos? sem a compra ser finalizada/);
    });


})