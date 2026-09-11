describe('Alterar senha', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[name="email"]').type('usuario@teste.com')
    cy.get('input[name="senha"]').type('SenhaAtual123!')
    cy.get('button[type="submit"]').click()

    cy.visit('/configuracoes')
  })

  it('deve alterar a senha com sucesso quando atende aos requisitos', () => {
    cy.get('input[name="novaSenha"]').type('NovaSenha456!')
    cy.get('input[name="confirmarSenha"]').type('NovaSenha456!')
    cy.get('button').contains('Salvar').click()

    cy.contains('Senha atualizada').should('be.visible')
  })

  it('não deve permitir senha sem letra maiúscula', () => {
    cy.get('input[name="novaSenha"]').type('novasenha456!')
    cy.get('input[name="confirmarSenha"]').type('novasenha456!')
    cy.get('button').contains('Salvar').click()

    cy.contains('mínimo 8 caracteres').should('be.visible')
  })

  it('não deve permitir senha sem caractere especial', () => {
    cy.get('input[name="novaSenha"]').type('NovaSenha456')
    cy.get('input[name="confirmarSenha"]').type('NovaSenha456')
    cy.get('button').contains('Salvar').click()

    cy.contains('mínimo 8 caracteres').should('be.visible')
  })

  it('não deve permitir senha com menos de 8 caracteres', () => {
    cy.get('input[name="novaSenha"]').type('Nv4!')
    cy.get('input[name="confirmarSenha"]').type('Nv4!')
    cy.get('button').contains('Salvar').click()

    cy.contains('mínimo 8 caracteres').should('be.visible')
  })

  it('não deve permitir salvar se as senhas não coincidirem (validação de front)', () => {
    cy.get('input[name="novaSenha"]').type('NovaSenha456!')
    cy.get('input[name="confirmarSenha"]').type('OutraSenha789!')
    cy.get('button').contains('Salvar').click()

    cy.contains('As senhas não coincidem').should('be.visible')
  })

  it('não deve permitir salvar com o campo de senha vazio', () => {
    cy.get('button').contains('Salvar').click()

    cy.contains('obrigatória').should('be.visible')
  })
})