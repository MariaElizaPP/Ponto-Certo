describe('Fluxo - Pedidos Completo', () => {
    beforeEach(()=>{
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.wait(500);
        cy.get('#btn-entrar').click();
        cy.wait(500)
    })
    

    it('Simular a mudança de status de um pedido aprovado para EM TRANSPORTE (RF0039)', () => {
        
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
        cy.get('.botao-continuar').click();

        cy.get('.linha-enderecos').eq(0).within(() => {
            cy.get('input[type="radio"]').check()
        })

        cy.get('#lista-cartoes').eq(0).within(() => {
            cy.get('input[type="checkbox"]').check()
        })

        cy.get('.btn-modal-abrir').click();

        cy.contains('Compra realizada com sucesso!').should('be.visible');

        cy.visit("https://pontocertoweb.netlify.app/admin/pedidos");

        cy.get('.tabela-master tbody tr').eq(0).within(() => {
            cy.get('.select-status').select('Em transporte');
        })

        cy.visit("https://pontocertoweb.netlify.app/historico");

        cy.get('.historico-card').first()
            .find('.cabecalho-historico')
            .invoke('text')
            .should('match', /em transporte/i);

        cy.pause()



    });

    it('Simular a mudança de status de um pedido com status EM TRANSPORTE para ENTREGUE(RF0040)', () => {
        cy.visit("https://pontocertoweb.netlify.app/admin/pedidos");

        cy.get('.tabela-master tbody tr').eq(0).within(() => {
            cy.get('.select-status').select('Entregue');
        })

        cy.visit("https://pontocertoweb.netlify.app/historico");
        cy.reload()


        cy.get('.historico-card').first()
            .find('.cabecalho-historico')
            .invoke('text')
            .should('match', /entregue/i);

        cy.pause()

    });



})