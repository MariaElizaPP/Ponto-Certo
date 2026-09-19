describe('Alterar senha', () => {
  beforeEach(() => {
    cy.visit('https://pontocertoweb.netlify.app/login')
    cy.wait(500);
    cy.get('#btn-entrar').click();
    cy.wait(500)
    cy.visit('https://pontocertoweb.netlify.app/configuracoes');

  })

  it('Cadastrar cartão de crédito', () => {
    cy.visit('https://pontocertoweb.netlify.app/pagamento/cadastrar_cartao')
    cy.get('#numero-cartao').type('5311228655609766');
    cy.wait(1000);
    cy.get('#bandeira').select('mastercard');
    cy.wait(1000);
    cy.get('#nome-cartao').type('Daniel N');
    cy.wait(1000);
    cy.get('#cvv').type('374');
    cy.wait(1000);

    cy.get('button.cadastrar').click();

    cy.contains('Cartão adicionado com sucesso!').should('be.visible');
  })

  it('Definir cartão como preferencial', () => {

    cy.get('.cartoes-card').should('have.length.at.least', 3);

    cy.get('.cartoes-card').eq(1).within(() => {
      cy.get('button.botao-definir-preferencial').click();
    });

    cy.contains('Cartão definido como preferencial').should('be.visible');

    cy.get('.cartoes-card').eq(1).find('.cartao-principal').should('be.visible');

    cy.get('.cartoes-card').eq(2).within(() => {
      cy.get('button.botao-definir-preferencial').click();
    });

    cy.contains('Cartão definido como preferencial').should('be.visible');

    cy.get('.cartoes-card').eq(2).find('.cartao-principal').should('be.visible');

    cy.get('.cartoes-card').eq(1).find('.cartao-principal').should('not.be.visible');
  });

  it('Excluir cartão preferencial', () => {
    
    cy.get('.cartoes-card[data-cartao-id]').should('have.length.at.least', 1);
    cy.get('.cartoes-card').filter((_, el) => Cypress.$(el).find('.cartao-principal').is(':visible')).should('have.length', 1).within(() => {
        cy.get('button.botao-excluir').click();
        cy.get('.btn-modal-fechar.btn-tema-alerta').should('be.visible').click();
      });

    cy.contains('Cartão removido com sucesso.').should('be.visible');
  })


})