describe('Alterar senha', () => {
  beforeEach(() => {
    cy.visit('pontocertoweb.netlify.app/login.html')
    cy.wait(1000)
    cy.get('#btn-entrar').click()
    cy.wait(1000)
    cy.visit('pontocertoweb.netlify.app/alterar_senha.html')
  })

  it('deve alterar a senha com sucesso quando atende aos requisitos', () => {
    cy.get('input[name="novaSenha"]').type('NovaSenha456!')
    cy.wait(1000)
    cy.get('input[name="confirmarSenha"]').type('NovaSenha456!')
    cy.wait(1000)
    cy.get('button.cadastrar').click()

    cy.contains('Senha alterada com sucesso!').should('be.visible')
  })

  it('não deve permitir senha sem letra maiúscula', () => {
    cy.get('input[name="novaSenha"]').type('novasenha456!')
    cy.wait(1000)
    cy.get('input[name="confirmarSenha"]').type('novasenha456!')
    cy.wait(1000)
    cy.get('button.cadastrar').click()

    cy.contains('A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, minúscula e um caractere especial').should('be.visible')
  })

  it('não deve permitir senha sem caractere especial', () => {
    cy.get('input[name="novaSenha"]').type('NovaSenha456')
    cy.wait(1000)
    cy.get('input[name="confirmarSenha"]').type('NovaSenha456')
    cy.wait(1000)
    cy.get('button.cadastrar').click()

    cy.contains('A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, minúscula e um caractere especial').should('be.visible')
  })

  it('não deve permitir senha com menos de 8 caracteres', () => {
    cy.get('input[name="novaSenha"]').type('Nv4!')
    cy.wait(1000)
    cy.get('input[name="confirmarSenha"]').type('Nv4!')
    cy.wait(1000)
    cy.get('button.cadastrar').click()

    cy.contains('A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, minúscula e um caractere especial').should('be.visible')
  })

  it('não deve permitir Cadastrar se as senhas não coincidirem (validação de front)', () => {
    cy.get('input[name="novaSenha"]').type('NovaSenha456!')
    cy.wait(1000)
    cy.get('input[name="confirmarSenha"]').type('OutraSenha789!')
    cy.wait(1000)
    cy.get('button.cadastrar').click()

    cy.contains('As senhas não coincidem').should('be.visible')
  })

  it('não deve permitir Cadastrar com o campo de senha vazio', () => {
    cy.get('button.cadastrar').click()
    cy.wait(1000)
    cy.contains('A senha é obrigatória').should('be.visible')
  })
})