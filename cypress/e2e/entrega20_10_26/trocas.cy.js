describe('Trocas', () =>{
    
    it ('RF0042,RF0043,RF0044: solicitar uma troca e o admin aceitar a troca e o admin confirma o recebimento do item para a troca', () => {
        //cliente
       cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
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

        //admin:

        cy.visit('https://pontocertoweb.netlify.app/admin/login'); 
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/pedidos');

        cy.get('#tabela-pedidos .select-status').first().select('Em transporte');
        cy.get('#tabela-pedidos .select-status').first().should('contain','Entregue');
        cy.get('#tabela-pedidos .select-status').first().select('Entregue');
        cy.contains('Pedido atualizado com sucesso').should('be.visible');

        //cliente
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
        cy.visit('https://pontocertoweb.netlify.app/historico');

        cy.get('.botao-trocar').first().click();

        cy.get('dialog[open] .item-troca').first().within(() =>{
            cy.get('.troca-check').check();
            cy.get('.troca-qtd').clear().type('1');
        });
        
        cy.get('dialog[open] .btn-troca-solicitar').click();
        cy.contains('Troca solicitada com sucesso.').should('be.visible');

        //.troca-check
        //<input type="checkbox" class="troca-check" value="160">
        
        //admin
        cy.visit('https://pontocertoweb.netlify.app/admin/login'); 
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/trocas');

        cy.contains('button','Autorizar Troca').click();
        cy.get('dialog[open] .btn-confirmar-autorizar').click();
        cy.contains('Troca autorizada (aguardando recebimento)').should('be.visible');

        cy.contains('button', 'Confirmar Recebimento').click();
        cy.get('dialog[open] .btn-confirmar-recebimento[data-retorna="true"').click();
        cy.contains('Troca concluída').should('be.visible');
        cy.pause();
    })

    it('solicitar uma troca de apenas um item ((RF0041)', () =>{
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();

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

        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
        cy.visit("https://pontocertoweb.netlify.app");
        
         cy.get('.card-produto').eq(1).within(() => {
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
        cy.get('#btn-comprar').click();

        cy.get('.linha-enderecos').eq(0).within(() => {
            cy.get('input[type="radio"]').check()
        })

        cy.get('#lista-cartoes').eq(0).within(() => {
            cy.get('input[type="checkbox"]').check()
        })

        cy.get('.btn-modal-abrir').click();

        cy.contains('Compra realizada com sucesso!').should('be.visible');
    //admin
    cy.visit('https://pontocertoweb.netlify.app/admin/login');
    cy.get('#email').type('admin@gmail.com');
    cy.get('#senha').type('1234');
    cy.get('#btn-entrar').click();
    cy.visit('https://pontocertoweb.netlify.app/admin/pedidos');
 
    cy.get('#tabela-pedidos .select-status').first().select('Em transporte');
    cy.get('#tabela-pedidos .select-status').first().should('contain', 'Entregue');
    cy.get('#tabela-pedidos .select-status').first().select('Entregue');
    cy.contains('Pedido atualizado com sucesso').should('be.visible');
 
    //CLIENTE 
    cy.visit('https://pontocertoweb.netlify.app/login');
    cy.get('#btn-entrar').click();
    cy.visit('https://pontocertoweb.netlify.app/historico');
 
    cy.get('.botao-trocar').first().click();
 
    cy.get('dialog[open] .item-troca').first().within(() => {
        cy.get('.troca-check').check();
        cy.get('.troca-qtd').clear().type('1');
    });
 
   
    cy.get('dialog[open] .item-troca').eq(1).find('.troca-check').should('not.be.checked');
 
    cy.get('dialog[open] .btn-troca-solicitar').click();
    cy.contains('Troca solicitada com sucesso.').should('be.visible');
 
    cy.get('.botao-trocar').first().closest('.historico-card').find('.tag-aguardando').should('have.length', 1);
    cy.pause();
});

 it ('RF0045: Gerar cupom de troca após o recebimento de itens', () => {
        //cliente
       cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
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

        //admin:

        cy.visit('https://pontocertoweb.netlify.app/admin/login'); 
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/pedidos');

        cy.get('#tabela-pedidos .select-status').first().select('Em transporte');
        cy.get('#tabela-pedidos .select-status').first().should('contain','Entregue');
        cy.get('#tabela-pedidos .select-status').first().select('Entregue');
        cy.contains('Pedido atualizado com sucesso').should('be.visible');

        //cliente
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
        cy.visit('https://pontocertoweb.netlify.app/historico');

        cy.get('.botao-trocar').first().click();

        cy.get('dialog[open] .item-troca').first().within(() =>{
            cy.get('.troca-check').check();
            cy.get('.troca-qtd').clear().type('1');
        });
        
        cy.get('dialog[open] .btn-troca-solicitar').click();
        cy.contains('Troca solicitada com sucesso.').should('be.visible');

       
        
        //admin
        cy.visit('https://pontocertoweb.netlify.app/admin/login'); 
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/trocas');

        cy.contains('button','Autorizar Troca').click();
        cy.get('dialog[open] .btn-confirmar-autorizar').click();
        cy.contains('Troca autorizada (aguardando recebimento)').should('be.visible');
        
        cy.reload();

        cy.contains('button', 'Confirmar Recebimento').click();
        cy.get('dialog[open] .btn-confirmar-recebimento[data-retorna="true"]').click();
        cy.contains('Troca concluída').should('be.visible');

        //cliente 
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
        cy.visit('https://pontocertoweb.netlify.app/configuracoes');
        cy.pause();
    })

    it ('RF0046: gerar notificação de autorização de troca', () => {
        //cliente
       cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
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

        //admin:

        cy.visit('https://pontocertoweb.netlify.app/admin/login'); 
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/pedidos');

        cy.get('#tabela-pedidos .select-status').first().select('Em transporte');
        cy.get('#tabela-pedidos .select-status').first().should('contain','Entregue');
        cy.get('#tabela-pedidos .select-status').first().select('Entregue');
        cy.contains('Pedido atualizado com sucesso').should('be.visible');

        //cliente
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
        cy.visit('https://pontocertoweb.netlify.app/historico');

        cy.get('.botao-trocar').first().click();

        cy.get('dialog[open] .item-troca').first().within(() =>{
            cy.get('.troca-check').check();
            cy.get('.troca-qtd').clear().type('1');
        });
        
        cy.get('dialog[open] .btn-troca-solicitar').click();
        cy.contains('Troca solicitada com sucesso.').should('be.visible');

        //.troca-check
        //<input type="checkbox" class="troca-check" value="160">
        
        //admin
        cy.visit('https://pontocertoweb.netlify.app/admin/login'); 
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/trocas');

        cy.contains('button','Autorizar Troca').click();
        cy.get('dialog[open] .btn-confirmar-autorizar').click();
        cy.contains('Troca autorizada (aguardando recebimento)').should('be.visible');
        cy.reload();
        cy.contains('button', 'Confirmar Recebimento').click();
        cy.get('dialog[open] .btn-confirmar-recebimento[data-retorna="true"]').click();
        cy.contains('Troca concluída').should('be.visible');

        //cliente 
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
        cy.visit('https://pontocertoweb.netlify.app/notificacoes');
        cy.pause();
    })

    it ('Reprovar troca', () => {
        //cliente
       cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
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

        //admin:

        cy.visit('https://pontocertoweb.netlify.app/admin/login'); 
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/pedidos');

        cy.get('#tabela-pedidos .select-status').first().select('Em transporte');
        cy.get('#tabela-pedidos .select-status').first().should('contain','Entregue');
        cy.get('#tabela-pedidos .select-status').first().select('Entregue');
        cy.contains('Pedido atualizado com sucesso').should('be.visible');

        //cliente
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
        cy.visit('https://pontocertoweb.netlify.app/historico');

        cy.get('.botao-trocar').first().click();

        cy.get('dialog[open] .item-troca').first().within(() =>{
            cy.get('.troca-check').check();
            cy.get('.troca-qtd').clear().type('1');
        });
        
        cy.get('dialog[open] .btn-troca-solicitar').click();
        cy.contains('Troca solicitada com sucesso.').should('be.visible');

        //admin
        cy.visit('https://pontocertoweb.netlify.app/admin/login'); 
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/trocas');

        cy.contains('button','Reprovar Troca').click();
        cy.get('dialog[open] .btn-confirmar-reprovar').click();
        cy.reload();
        cy.contains('Troca negada').should('be.visible');

        
    })

})
//btn-modal-fechar btn-tema-alerta btn-confirmar-reprovar