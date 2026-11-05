/*
-- raquel
1) Consulta de uma categoria em um período válido, com valores mensais iguais à soma das vendas ENTREGUE registradas na base.
2) Comparação entre duas ou mais categorias no período.
3) Apresentação do resultado em gráfico de linhas, com valores em reais agrupados por mês.
4) Alteração da data de início ou de fim resultando em um novo resultado no gráfico.

-- eliza
5) Compra com status diferente de ENTREGUE não contabilizada no gráfico.
6) Compra que passa a ENTREGUE dentro do período refletida na consulta seguinte.
7) Acesso ao gráfico permitido ao administrador e negado a outros perfis.
8) Tempo de resposta da consulta de até 1 segundo.
 */

describe('Dashboard', () => {

    it("Consulta de uma categoria em um período válido, com valores mensais iguais à soma das vendas ENTREGUE registradas na base.", () => {

        cy.visit("https://pontocertoweb.netlify.app/admin/login")
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/dashboard');

        cy.get("#cat-2").check();
        cy.get("#ano").select(1);        
        cy.get("#mesInicio").select(9);  
        cy.get("#mesFim").select(10);     

        cy.get("#filtrar").click();

        cy.wait(1000);

        cy.get("#myChart").should("be.visible");
        cy.get("#erro").should("be.empty");

        cy.pause();

       
    });

    it("Comparação entre duas ou mais categorias no período.", () => {
         cy.visit("https://pontocertoweb.netlify.app/admin/login")
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/dashboard');

        cy.get("#cat-2").check();
        cy.get("#cat-3").check();
        cy.get("#ano").select(1);        
        cy.get("#mesInicio").select(9);  
        cy.get("#mesFim").select(10);     

        cy.get("#filtrar").click();

        cy.wait(1000);

        cy.get("#myChart").should("be.visible");
        cy.get("#erro").should("be.empty");

        cy.pause();

    });

    it("Apresentação do resultado em gráfico de linhas, com valores em reais agrupados por mês.", () => {
        cy.visit("https://pontocertoweb.netlify.app/admin/login")
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/dashboard');

        cy.get("#cat-2").check();
        cy.get("#ano").select(1);
        cy.get("#mesInicio").select(7);   
        cy.get("#mesFim").select(10);     

        cy.get("#filtrar").click();

        cy.wait(1000);

        cy.get("#myChart").should("be.visible");
        cy.get("#erro").should("be.empty");

        cy.pause();
    });

    it("Alteração da data de início ou de fim resultando em um novo resultado no gráfico.", () => {
        cy.visit("https://pontocertoweb.netlify.app/admin/login")
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/dashboard');

        cy.get("#cat-2").check();
        cy.get("#ano").select(1);
        cy.get("#mesInicio").select(9);   
        cy.get("#mesFim").select(10);    

        cy.get("#filtrar").click();

        cy.wait(1000);

        cy.pause();                       

        cy.get("#mesInicio").select(7);  

        cy.get("#filtrar").click();

        cy.wait(1000);

        cy.pause();                    
    });

   
    it("Compra que passa a ENTREGUE dentro do período refletida na consulta seguinte.", () => {
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.wait(500);
        cy.get('#btn-entrar').click();
        cy.wait(300)
        cy.visit("https://pontocertoweb.netlify.app");
        //fio naútico
        cy.get('.card-produto').eq(11).within(() => {
            cy.get('img[alt="detalhes"]').click()
        });
        cy.get('#seletor-cor-atual').click();
        cy.get('#seletor-cor-lista').invoke('css', 'display', 'flex')
        cy.get('.seletor-cor-item').first().click()
        cy.get('#seletor-cor-lista').invoke('css', 'display', 'none')
        cy.get('.adicionar').click();
        cy.get('.btn-modal-abrir').click();
        cy.get('.btn-modal-fechar').click();
        cy.get('.comprar').click();
        cy.get('.botao-continuar').click();

        cy.get('.linha-enderecos').eq(0).within(() => {
            cy.get('input[type="radio"]').check()
        })

        cy.get('#lista-cartoes').eq(0).within(() => {
            cy.get('input[type="checkbox"]').check()
        })

        cy.get('.btn-modal-abrir').click();

        cy.contains('Compra realizada com sucesso!').should('be.visible');

        cy.visit("https://pontocertoweb.netlify.app/admin/pedidos");

        cy.get('.tabela-master tbody tr').eq(0).within(() => {
            cy.get('.select-status').select('Em transporte');
        })

        cy.get('.tabela-master tbody tr').eq(0).within(() => {
            cy.get('.select-status').select('Entregue');
        })

        cy.visit("https://pontocertoweb.netlify.app/historico");
        cy.reload()


        cy.get('.historico-card').first().find('.cabecalho-historico').invoke('text').should('match', /entregue/i);

        cy.visit("https://pontocertoweb.netlify.app/admin/login")
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/dashboard');


        cy.get('#cat-7').click();
        cy.get('#filtrar').click();

        cy.wait(1000);

        cy.pause();
    });


    it("Compra com status DIFERENTE de ENTREGUE não contabilizada no gráfico.", () => {
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.get('#btn-entrar').click();
        cy.wait(300)
        cy.visit("https://pontocertoweb.netlify.app");
        //fio naútico
        cy.get('.card-produto').eq(11).within(() => {
            cy.get('img[alt="detalhes"]').click()
        });
        cy.get('#seletor-cor-atual').click();
        cy.get('#seletor-cor-lista').invoke('css', 'display', 'flex')
        cy.get('.seletor-cor-item').first().click()
        cy.get('#seletor-cor-lista').invoke('css', 'display', 'none')
        cy.get('.adicionar').click();
        cy.get('.btn-modal-abrir').click();
        cy.get('.btn-modal-fechar').click();
        cy.get('.comprar').click();
        cy.get('.botao-continuar').click();

        cy.get('.linha-enderecos').eq(0).within(() => {
            cy.get('input[type="radio"]').check()
        })

        cy.get('#lista-cartoes').eq(0).within(() => {
            cy.get('input[type="checkbox"]').check()
        })

        cy.get('.btn-modal-abrir').click();

        cy.contains('Compra realizada com sucesso!').should('be.visible');

        cy.visit("https://pontocertoweb.netlify.app/historico");
        cy.reload()

        cy.get('.historico-card').first().find('.cabecalho-historico').invoke('text').should('match', /aprovada/i);
        cy.get(".botao-cancelar").eq(0).click();
        cy.contains('button', "Confirmar").click();


        cy.visit("https://pontocertoweb.netlify.app/admin/login")
        cy.wait(500);
        cy.get('#email').type('admin@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/admin/dashboard');


        cy.get('#cat-7').click();
        cy.get('#filtrar').click();

        cy.wait(1000);

        cy.pause();

    });

    it("Acesso ao gráfico permitido ao administrador e negado a outros perfis.", () => {
        cy.visit("https://pontocertoweb.netlify.app/admin/login")
        cy.wait(500);
        cy.get('#email').type('vitor@gmail.com');
        cy.wait(30);
        cy.get('#senha').type('1234');
        cy.wait(30);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.contains('Credenciais inválidas').should('be.visible');
    })

    it("Tempo de resposta da consulta de até 1 segundo", () => {
        cy.visit('https://pontocertoweb.netlify.app/admin/login');
        cy.get('#email').type('admin@gmail.com');
        cy.get('#senha').type('1234');
        cy.get('#btn-entrar').click();
        cy.url().should('not.include', '/login');

        // registrar ANTES de abrir a página, senão perde a requisição
        cy.intercept('GET', '**/api/dashboard*').as('dashboard');

        cy.visit('https://pontocertoweb.netlify.app/admin/dashboard');
        cy.wait('@dashboard'); // carga inicial, fora da medição

        let inicio;
        cy.get('#filtrar').should('be.visible').then(() => {
            inicio = performance.now();
        });

        cy.get('#filtrar').click();

        cy.wait('@dashboard').then(({ response }) => {
            const tempoTotal = performance.now() - inicio;
            cy.log(`Tempo total: ${Math.round(tempoTotal)}ms`);

            expect(response.statusCode).to.eq(200);
            expect(tempoTotal).to.be.lessThan(1000);
        });

        cy.get('#myChart').should('be.visible');
    });

})