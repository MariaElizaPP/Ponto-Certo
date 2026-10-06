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
        cy.get('#seletor-cor-atual').click();
        cy.get('#seletor-cor-lista').invoke('css', 'display', 'flex')
        cy.get('.seletor-cor-item').first().click()
        cy.get('#seletor-cor-lista').invoke('css', 'display', 'none')
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


        cy.get('.linha-enderecos').eq(0).within(() => {
            cy.get('input[type="radio"]').check()
        })

    
        cy.get('.checkbox-pagamento').check()
        
        cy.get('#lista-cartoes input[type="checkbox"]').eq(0).check()
        cy.get('.valor-cartao').eq(0).type(10.80)

        cy.get('#lista-cartoes input[type="checkbox"]').eq(1).check()
        cy.get('.valor-cartao').eq(1).type(14)

        cy.get('.btn-modal-abrir').click();

        cy.contains('Compra realizada com sucesso!').should('be.visible');

    });


    it('Pagamento com cupom e cartão', () => {

        cy.get('.linha-enderecos').eq(0).within(() => {
            cy.get('input[type="radio"]').check()
        })

        cy.get('.checkbox-pagamento').check()
        cy.get('#lista-cartoes input[type="checkbox"]').eq(0).check()
        cy.get('.valor-cartao').eq(0).type(9.90)

        cy.get('#lista-cartoes input[type="checkbox"]').eq(1).check()
        cy.get('.valor-cartao').eq(1).type(9.90)

        cy.get('#btn-abrir-cupom').click();
        cy.get('.campo-cupom').type('BEMVINDO5');
        cy.get('#botao-aplicar').click();

        cy.get('.btn-modal-abrir').click();

        cy.contains('Compra realizada com sucesso!').should('be.visible');


    });


    it('Pedido finalizado e resgistado com status EM PROCESSAMENTO', () => {

        cy.get('.linha-enderecos').eq(0).within(() => {
            cy.get('input[type="radio"]').check()
        })

        cy.get('#lista-cartoes').eq(0).within(() => {
            cy.get('input[type="checkbox"]').check()
        })

        cy.get('.btn-modal-abrir').click();

        cy.contains('Compra realizada com sucesso!').should('be.visible');
        cy.wait(1000);

        cy.visit('https://pontocertoweb.netlify.app/historico');


    });

    it('Cupom maior que o valor da compra gera cupom de troca com a diferença ', () =>{

        cy.get('.linha-enderecos').eq(0).within(() => {
            cy.get('input[type="radio"]').check()
        })

        cy.get('#btn-abrir-cupom').click();
        cy.get('.campo-cupom').type('QUEROKIT');
        cy.get('#botao-aplicar').click();

        cy.get('.btn-modal-abrir').click();

         cy.contains('Compra realizada com sucesso!').should('be.visible');

          cy.visit('https://pontocertoweb.netlify.app/configuracoes');  
          cy.get('.valores-cupom .cupom-valor', { timeout: 10000 })
          .first()
          .should('contain', 'TROCA-');

        
    })

    it('Uma compra com novo endereço e novo cartão cadastrados durante o processo, incorporados ao perfil do cliente', () =>{

        cy.get('.link-adicionar-endereco').click();

        
       cy.get('input[id="tipo-residencia"]').type('Apartamento');
        cy.wait(1000);
        cy.get('input[id="tipo-logradouro"]').type('Rua');
        cy.wait(1000);
        cy.get('input[id="cep"]').type('08850330').blur();
        cy.wait(1000);
        cy.get('input[id="numero"]').type('512');
        cy.wait(1000);
        cy.get('input[id="nome-endereco"]').type('Casa da Mãe');
        cy.wait(1000);
        cy.get('input[id="complemento"]').type('Complemento');
        cy.wait(1000);
        cy.get('select[id="tipo-endereco"]').select('Entrega');
        cy.wait(1000);

        cy.get('button.cadastrar').click();
        
        
        cy.contains('Endereço cadastrado com sucesso!').should('be.visible');

        cy.get('button.btn-tema-sucesso.botao-voltar').click();
        
        cy.get('.linha-enderecos').last().within(() => {
            cy.get('input[type="radio"]').check()
        })

        cy.get('.link-adicionar-pagamento').click();

        cy.get('#numero-cartao').type('5240990802212507');
        cy.wait(1000);
        cy.get('#bandeira').select('mastercard');
        cy.wait(1000);
        cy.get('#nome-cartao').type('Daniela Nome');
        cy.wait(1000);
        cy.get('#cvv').type('175');
        cy.wait(1000);

        cy.get('button.cadastrar').click();

        cy.contains('Cartão adicionado com sucesso!').should('be.visible');

        cy.get('button.btn-tema-sucesso.botao-voltar').click();

       
        cy.get('#lista-cartoes').last().within(() => {
            cy.get('input[type="checkbox"]').check()
        })


        cy.get('.btn-modal-abrir').click();

        cy.contains('Compra realizada com sucesso!').should('be.visible');

        
    })

})