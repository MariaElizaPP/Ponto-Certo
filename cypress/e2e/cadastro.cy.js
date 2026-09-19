describe('Cadastro cliente', () => {
    beforeEach(() => {
        cy.visit('https://pontocertoweb.netlify.app/cadastro_cliente');
    })

    it('RF0021 - Cadastrar cliente', () => {
        cy.get('input[name="nome"]').type('Pedro Henrique');
        cy.wait(30);
        cy.get('input[id="data-nascimento"]').type('2008-02-21');
        cy.wait(30);
        cy.get('input[id="cpf"]').type('88577852849');
        cy.wait(30);
        cy.get('select[id="genero"]').select('Homem');
        cy.wait(30);
        cy.get('input[id="telefone"]').type('8109987987');
        cy.wait(30);
        cy.get('input[id="email"]').type('sodro123@gmail.com.br');
        cy.wait(30);
        cy.get('input[id="senha"]').type('NovaSenha1!');
        cy.wait(30);
        cy.get('input[id="confirmar-senha"]').type('NovaSenha1!');
        cy.wait(30);

        
        cy.get('.blocos-endereco .bloco-endereco').eq(0).within(() => {
            cy.get('input[name="tipoResidencia"]').type('Casa');
            cy.get('input[name="tipoLogradouro"]').type('Rua');
            cy.get('input[name="cep"]').type('58059772').blur();
            cy.get('input[name="numero"]').type('502');
            cy.get('input[name="nomeEndereco"]').type('Trabalho');
            cy.get('input[name="complemento"]').type('Complemento');
            cy.get('select[name="tipoEndereco"]').select('Cobrança');
        });
        cy.wait(30);

        
        cy.get('#btn-add-endereco').click();

       
        cy.get('.blocos-endereco .bloco-endereco').last().within(() => {
            cy.get('input[name="tipoResidencia"]').type('Casa');
            cy.get('input[name="tipoLogradouro"]').type('Rua');
            cy.get('input[name="cep"]').type('78132734').blur();
            cy.get('input[name="numero"]').type('505');
            cy.get('input[name="nomeEndereco"]').type('Trabalho');
            cy.get('input[name="complemento"]').type('Complemento');
            cy.get('select[name="tipoEndereco"]').select('Entrega');
        });
        cy.wait(30);

        cy.get('button[type="submit"]').click();
        cy.contains('Cliente cadastrado com sucesso!').should('be.visible');
    })

    it('RF0026 / RF0027 - Cadastrar cliente com múltiplos endereços e múltiplos cartões', () => {
        cy.get('input[name="nome"]').type('Daniel Cardoso');
        cy.get('input[id="data-nascimento"]').type('2008-02-21');
        cy.get('input[id="cpf"]').type('55721743744');
        cy.get('select[id="genero"]').select('Homem');
        cy.get('input[id="telefone"]').type('74989567004');
        cy.get('input[id="email"]').type('dani12caro@gmail.com.br');
        cy.get('input[id="senha"]').type('NovaSenha1!');
        cy.get('input[id="confirmar-senha"]').type('NovaSenha1!');

        cy.get('.blocos-endereco .bloco-endereco').eq(0).within(() => {
            cy.get('input[name="tipoResidencia"]').type('Casa');
            cy.get('input[name="tipoLogradouro"]').type('Rua');
            cy.get('input[name="cep"]').type('58059772').blur();
            cy.get('input[name="cidade"]').should('not.have.value', '');
            cy.get('input[name="numero"]').type('502');
            cy.get('input[name="nomeEndereco"]').type('Trabalho');
            cy.get('input[name="complemento"]').type('Complemento');
            cy.get('select[name="tipoEndereco"]').select('Cobrança');
        });

        cy.get('#btn-add-endereco').click();

        cy.get('.blocos-endereco .bloco-endereco').last().within(() => {
            cy.get('input[name="tipoResidencia"]').type('Casa');
            cy.get('input[name="tipoLogradouro"]').type('Rua');
            cy.get('input[name="cep"]').type('78132734').blur();
            cy.get('input[name="cidade"]').should('not.have.value', '');
            cy.get('input[name="numero"]').type('505');
            cy.get('input[name="nomeEndereco"]').type('Casa da Sogra');
            cy.get('input[name="complemento"]').type('Complemento');
            cy.get('select[name="tipoEndereco"]').select('Entrega');
        });

        cy.get('.blocos-cartao .bloco-cartao').eq(0).within(() => {
            cy.get('input[name="numeroCartao"]').type('5414030092758016');
            cy.get('select[name="bandeiraCartao"]').select('visa');
            cy.get('input[name="nomeCartao"]').type('Claudio I Y Barros');
            cy.get('input[name="cvv"]').type('364');
        });

        cy.get('#btn-add-cartao').click();

        cy.get('.blocos-cartao .bloco-cartao').last().within(() => {
            cy.get('input[name="numeroCartao"]').type('4539656216939406');
            cy.get('select[name="bandeiraCartao"]').select('mastercard');
            cy.get('input[name="nomeCartao"]').type('Claudio I Y Barros');
            cy.get('input[name="cvv"]').type('821');
            cy.get('input[type="radio"]').click();
        });

        cy.get('.bloco-cartao input[type="radio"]:checked').should('have.length', 1);

        cy.get('button[type="submit"]').click();
        cy.contains('Cliente cadastrado com sucesso!').should('be.visible');
    });

    it('RNF0031 - Senha forte', () => {
        cy.get('input[id="senha"]').type('novasenha');
        cy.wait(30);
        cy.get('input[id="confirmar-senha"]').type('novasenha');
        cy.wait(30);
        cy.get('button[type="submit"]').click();
        cy.contains('A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, minúscula e um caractere especial').should('be.visible');
    })

    it('RNF0031 - RNF0032 - Confirmação de senha', () => {
        cy.get('input[id="senha"]').type('SenhaForte1!');
        cy.wait(30);
        cy.get('button[type="submit"]').click();
        cy.contains('A confirmação da senha é obrigatória').should('be.visible');
    })

    it('RN0021 - Cadastro de endereço de cobrança', () => {
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
        cy.contains('É necessário ao menos um endereço de cobrança').should('be.visible');

        cy.wait(30);
    })

    it('RN0022 - Cadastro de endereço de entrega', () => {
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

        cy.get('button[type="submit"]').click();
        cy.contains('É necessário ao menos um endereço de entrega').should('be.visible');

        cy.wait(30);
    })
})