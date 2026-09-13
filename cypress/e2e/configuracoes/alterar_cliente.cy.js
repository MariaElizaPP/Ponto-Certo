describe('Alterar Cliente', () =>{
    beforeEach(()=>{
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.wait(500);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/configuracoes');
        cy.wait(500);
        cy.get('#alterar_link').click();
    })

    it('RF0022 - Alterar cliente', () =>{
        cy.get('input[id="nome"]').clear();
        cy.get('input[id ="nome"]').type('Sophia Natália Gonçalves');
        cy.wait(30);
        cy.get('input[id="data-nascimento"]').clear();
        cy.get('input[id ="data-nascimento"]').type('21/02/2008');
        cy.wait(30);
        cy.get('select[id ="genero"]').select('Mulher');
        cy.wait(30);
        cy.get('input[id="telefone"]').clear();
        cy.get('input[id ="telefone"]').type('992783988');
        cy.wait(30);

        cy.get('#alterar').click();

        cy.contains('Dados alterados com sucesso!').should('be.visible');   

    })
})
