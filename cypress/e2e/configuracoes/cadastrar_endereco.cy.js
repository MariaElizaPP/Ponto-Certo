describe('Cadastrar endereço', () => {
    beforeEach(() => {
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.wait(500);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/configuracoes');
        cy.wait(500)
        cy.get('.cadastrar-endereco').click()
    })

    it('Cadastro de endereço', () => {
        
        cy.get('input[name="tipo-residencia"]').type('Casa');
        cy.wait(1000);
        cy.get('input[name="tipo-logradouro"]').type('Rua');
        cy.wait(1000);
        cy.get('input[name="cep"]').type('58059772').blur();
        cy.wait(1000);
        cy.get('input[name="numero"]').type('502');
        cy.wait(1000);
        cy.get('input[name="nome-endereco"]').type('Trabalho');
        cy.wait(1000);
        cy.get('input[name="complemento"]').type('Complemento');
        cy.wait(1000);
        cy.get('select[name="tipoEndereco"]').select('Cobrança');
        cy.wait(1000);

        cy.get('button.cadastrar').click();

        cy.contains('Endereço cadastrado com sucesso!').should('be.visible');
    })

  

})