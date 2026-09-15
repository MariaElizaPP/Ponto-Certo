describe('Alterar senha', () => {
  beforeEach(() => {
    cy.visit('https://pontocertoweb.netlify.app/login')
    cy.wait(1000)
    cy.get('#btn-entrar').click()
    cy.wait(1000)
    cy.visit('https://pontocertoweb.netlify.app/cadastrar_cartao')
  })

  it('Cadastrar cartão de crédito', () => {
    cy.get('#numero-cartao').type('5270464940954449');
    cy.wait(30);
    cy.get('#bandeira').select('mastercard');
    cy.wait(30);
    cy.get('#nome-cartao').type('Sophia N Gonçalves');
    cy.wait(30);
    cy.get('#cvv').type('374');
    cy.wait(30);

    cy.contains('Cartão adicionado com sucesso!').should('be.visible');
  })

  it('Definir cartão como preferencial', () => {

    cy.get('.acoes-cartao').eq(0).within(() =>{
      cy.get('botao-definir-preferencial').click
      cy.contains('Cartão definido como preferencial').should('be.visible');
    })
    cy.wait(30);
    cy.get('.acoes-cartao').last.within(() =>{
      cy.get('botao-definir-preferencial').click
      cy.contains('Cartão definido como preferencial').should('be.visible');
    })
    cy.wait(30);
    cy.get('.acoes-cartao').last.within(() =>{
      cy.get('botao-definir-preferencial').click
      cy.contains('Cartão definido como preferencial').should('be.visible');
    })

    
  })

  it('Excluir cartão preferencial', () => {
    cy.visit('https://pontocertoweb.netlify.app/configuracoes')
    cy.wait(30);
    cy.get('.acoes-cartao').eq(0).within(() =>{
      cy.get('botao-excluir').click
      cy.get('.btn-modal-fechar .btn-tema-alerta').click
    })
    cy.wait(30);
    cy.contains('Cartão removido com sucesso.').should('be.visible');
    
  })


})