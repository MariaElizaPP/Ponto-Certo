describe('Alterar endereço', () => {
    beforeEach(() => {
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.wait(500);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/configuracoes');
        cy.wait(500)
        cy.get('.endereco-card').eq(0).within(() => {
            cy.get('.link-alterar').click();
        });
        cy.wait(500);
    })

    it('RNF0034 - Alteração apenas de endereços ', () => {
        cy.get('input[name="tipo-residencia"]').clear();
        cy.get('input[name="tipo-residencia"]').type('Casa');
        cy.wait(1000);
        cy.get('input[name="tipo-logradouro"]').clear();
        cy.get('input[name="tipo-logradouro"]').type('Rua');
        cy.wait(1000);
        cy.get('input[name="cep"]').clear();
        cy.get('input[name="cep"]').type('58059772').blur();
        cy.wait(1000);
        cy.get('input[name="numero"]').clear();
        cy.get('input[name="numero"]').type('502');
        cy.wait(1000);
        cy.get('input[name="nome-endereco"]').clear();
        cy.get('input[name="nome-endereco"]').type('Trabalho');
        cy.wait(1000);
        cy.get('input[name="complemento"]').clear();
        cy.get('input[name="complemento"]').type('Complemento');
        cy.wait(1000);
        cy.get('select[name="tipoEndereco"]').select('Cobrança');
        cy.wait(1000);

        cy.get('button.cadastrar').click();

        cy.contains('Endereço atualizado com sucesso!').should('be.visible');
        cy.get('#modal-abrir button.botao-voltar').click();
    })

    it('Não deve permitir salvar apenas com o campo "número" vazio', () => {
        cy.get('input[name="tipo-residencia"]').clear().type('Casa');
        cy.get('input[name="tipo-logradouro"]').clear().type('Rua');
        cy.get('input[name="cep"]').clear().type('58059772').blur();
        cy.get('input[name="numero"]').clear();
        cy.get('input[name="nome-endereco"]').clear().type('Trabalho');

        cy.get('button.cadastrar').click();

        cy.contains('O número é obrigatório').should('be.visible');
    })

    it('Não deve permitir salvar apenas com o campo "nome do endereço" vazio', () => {
        cy.get('input[name="tipo-residencia"]').clear().type('Casa');
        cy.get('input[name="tipo-logradouro"]').clear().type('Rua');
        cy.get('input[name="cep"]').clear().type('58059772').blur();
        cy.get('input[name="numero"]').clear().type('502');
        cy.get('input[name="nome-endereco"]').clear();

        cy.get('button.cadastrar').click();

        cy.contains('O nome do endereco é obrigatório').should('be.visible');
    })

    it('Deve rejeitar CEP inválido (menos de 8 dígitos)', () => {
        cy.get('input[name="cep"]').clear();
        cy.get('input[name="cep"]').type('580597').blur();

        cy.contains('O CEP deve conter 8 dígitos').should('be.visible');
    })

    it('Deve rejeitar CEP inexistente', () => {
        cy.get('input[name="cep"]').clear();
        cy.get('input[name="cep"]').type('00000000').blur();

        cy.contains('Insira um CEP válido').should('be.visible');

    })

    it('Excluir endereço', () => {
        cy.visit('https://pontocertoweb.netlify.app/configuracoes');

        cy.get('.endereco-card[data-endereco-id]').should('have.length.at.least', 1);

        cy.get('.endereco-card[data-endereco-id]').first().as('cardEndereco');

        cy.get('@cardEndereco').find('button.botao-excluir').click();

        cy.get('@cardEndereco')
            .find('.btn-modal-fechar.btn-tema-alerta')
            .should('be.visible')
            .click();

        cy.contains('Endereço excluído').should('be.visible');
    });


})