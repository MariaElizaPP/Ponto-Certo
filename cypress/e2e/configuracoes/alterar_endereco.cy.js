describe('Alterar endereço', () => {
    beforeEach(() => {
        cy.visit('https://pontocertoweb.netlify.app/login')
        cy.wait(500)
        cy.get('#btn-entrar').click()
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/configuracoes')
        cy.wait(500)
        cy.get('.link-alterar').click()
    })

    it('RNF0034 - Alteração apenas de endereços ', () => {
        cy.get('input[name="tipo-residencia"]').type('Casa')
        cy.wait(30)
        cy.get('input[name="tipo-logradouro"]').type('Rua')
        cy.wait(30)
        cy.get('input[name="cep"]').type('58059772')
        cy.wait(30)
        cy.get('input[name="numero"]').type('502')
        cy.wait(30)
        cy.get('input[name="nome-endereco"]').type('Trabalho')
        cy.wait(30)
        cy.get('input[name="complemento"]').type('Complemento')
        cy.wait(30)
        cy.get('select[name="tipoEndereco"]').select('Complemento')
        cy.wait(30)

        cy.get('button.cadastrar').click()

        cy.contains('Endereço atualizado com sucesso!').should('be.visible')
    })
})