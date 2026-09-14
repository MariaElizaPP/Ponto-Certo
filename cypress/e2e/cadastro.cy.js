describe('Cadastro cliente', () => {
    beforeEach(() => {
        cy.visit('https://pontocertoweb.netlify.app/cadastro_cliente');
    })

    it('RF0021 - Cadastrar cliente', () => {
        cy.get('input[name="nome"]').type('Sophia Natália Gonçalves');
        cy.wait(30);
        cy.get('input[id="data-nascimento"]').type('2008-02-21');
        cy.wait(30);
        cy.get('input[id="cpf"]').type('20331447045');
        cy.wait(30);
        cy.get('select[id="genero"]').select('Mulher');
        cy.wait(30);
        cy.get('input[id="telefone"]').type('998983988');
        cy.wait(30);
        cy.get('input[id="email"]').type('angla4894@uorak.com');
        cy.wait(30);
        cy.get('input[id="senha"]').type('NovaSenha1!');
        cy.wait(30);
        cy.get('input[id="confirmar-senha"]').type('NovaSenha1!');
        cy.wait(30);

        // --- Primeiro endereço (bloco original, sempre index 0) ---
        cy.get('.blocos-endereco .bloco-endereco').eq(0).within(() => {
            cy.get('input[name="tipoResidencia"], input[id="tipo_residencia"]').type('Casa');
            cy.wait(30);
            cy.get('input[name="tipoLogradouro"]').type('Rua');
            cy.wait(30);
            cy.get('input[name="cep"]').type('58059772').blur();
            cy.wait(30);
            cy.get('input[name="numero"]').type('502');
            cy.wait(30);
            cy.get('input[name="nomeEndereco"]').type('Trabalho');
            cy.wait(30);
            cy.get('input[name="complemento"]').type('Complemento');
            cy.wait(30);
            cy.get('select[name="tipoEndereco"]').select('Cobrança');
        });
        cy.wait(30);

        // --- Adiciona o segundo bloco de endereço ---
        cy.get('#btn-add-endereco').click();

        // --- Segundo endereço (bloco clonado, sempre o último) ---
        cy.get('.blocos-endereco .bloco-endereco').last().within(() => {
            cy.get('input[name="tipoResidencia"], input[id^="tipo_residencia"]').type('Casa');
            cy.wait(30);
            cy.get('input[name="tipoLogradouro"]').type('Rua');
            cy.wait(30);
            cy.get('input[name="logradouro"]').type('Rua Moacir Barbosa Tribone');
            cy.wait(30);
            cy.get('input[name="cidade"]').type('Mogi das Cruzes');
            cy.wait(30);
            cy.get('input[name="pais"]').type('Brasil');
            cy.wait(30);
            cy.get('input[name="estado"]').type('SP');
            cy.wait(30);
            cy.get('input[name="bairro"]').type('Jardim Natal');
            cy.wait(30);
            cy.get('input[name="cep"]').type('58059772').blur();
            cy.wait(30);
            cy.get('input[name="numero"]').type('502');
            cy.wait(30);
            cy.get('input[name="nomeEndereco"]').type('Trabalho');
            cy.wait(30);
            cy.get('input[name="complemento"]').type('Complemento');
            cy.wait(30);
            cy.get('select[name="tipoEndereco"]').select('Entrega');
        });
        cy.wait(30);

        // --- Cartão ---
      
        cy.get('input[name="numeroCartao"]').type('5345662373133529');
        cy.wait(30);
        cy.get('select[name="bandeiraCartao"]').select('visa');
        cy.wait(30);
        cy.get('input[name="nomeCartao"]').type('Sophia N Gonçalves');
        cy.wait(30);
        cy.get('input[name="cvv"]').type('364');
        cy.wait(30);
        cy.get('input[type="radio"]').click();
        cy.wait(30);

        cy.get('button[type="submit"]').click();
        cy.contains('Cliente cadastrado com sucesso!').should('be.visible');
    })

    it('RNF0031 - Senha forte' , ()=>{
        cy.get('input[id="senha"]').type('novasenha');
        cy.wait(30);
        cy.get('input[id="confirmar-senha"]').type('novasenha');
        cy.wait(30);
        cy.get('button[type="submit"]').click();
        cy.contains('A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, minúscula e um caractere especial').should('be.visible');
    })

    it('RNF0031 - RNF0032 - Confirmação de senha' , ()=>{
        cy.get('input[id="senha"]').type('SenhaForte1!');
        cy.wait(30);
        //cy.get('input[id="confirmar-senha"]').type('OutroForte1!');
        //cy.wait(30);
        cy.get('button[type="submit"]').click();
        cy.contains('A confirmação da senha é obrigatória').should('be.visible');
    })

    it('RN0021 - Cadastro de endereço de cobrança', ()=>{
        cy.get('input[name="nome"]').type('Sophia Natália Gonçalves');
        cy.wait(30);
        cy.get('input[id="data-nascimento"]').type('2008-02-21');
        cy.wait(30);
        cy.get('input[id="cpf"]').type('20331447045');
        cy.wait(30);
        cy.get('select[id="genero"]').select('Mulher');
        cy.wait(30);
        cy.get('input[id="telefone"]').type('998983988');
        cy.wait(30);
        cy.get('input[id="email"]').type('angla4894@uorak.com');
        cy.wait(30);
        cy.get('input[id="senha"]').type('NovaSenha1!');
        cy.wait(30);
        cy.get('input[id="confirmar-senha"]').type('NovaSenha1!');
        cy.wait(30);

        // endereço
        cy.get('.blocos-endereco .bloco-endereco').eq(0).within(() => {
            cy.get('input[name="tipoResidencia"], input[id="tipo_residencia"]').type('Casa');
            cy.wait(30);
            cy.get('input[name="tipoLogradouro"]').type('Rua');
            cy.wait(30);
            cy.get('input[name="cep"]').type('58059772').blur();
            cy.wait(30);
            cy.get('input[name="numero"]').type('502');
            cy.wait(30);
            cy.get('input[name="nomeEndereco"]').type('Trabalho');
            cy.wait(30);
            cy.get('input[name="complemento"]').type('Complemento');
            cy.wait(30);
            cy.get('select[name="tipoEndereco"]').select('Entrega');
        });

        cy.get('button[type="submit"]').click();
        cy.contains('É necessário informar ao menos um endereço de entrega').should('be.visible');

        cy.wait(30);
    })
})