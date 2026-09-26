describe('Filtrar Cliente', ()=>{
    beforeEach(()=> {
        cy.visit('https://pontocertoweb.netlify.app/admin/clientes');
        cy.get('#abrirFiltro').click();

    })

    it('RF0024 - Consulta de clientes:Filtrar por gênero', () =>{
        cy.get('input[name="genero"][value="M"]').check();
        cy.get('#aplicarFiltro').click();
    })

    it('RF0024 - Consulta de clientes:Filtrar por data de nascimento', () =>{
        cy.get('#data_nascimento').type('2008-02-21');
        cy.get('#aplicarFiltro').click();
    })

    it('RF0024 - Consulta de clientes:Filtrar por gênero e data de nascimento', () =>{
        cy.get('input[name="genero"][value="M"]').check();
        cy.get('#data_nascimento').type('2008-02-21');
        cy.get('#aplicarFiltro').click();
    })

     it('RF0024 - Consulta de clientes: Buscar cliente pela barra de busca', () => {
        cy.get('#buscaCliente').type('maria');

        cy.get('.tabela-master tbody tr').should('have.length.greaterThan', 0);
        cy.get('.tabela-master tbody tr').each(($linha) => {
            cy.wrap($linha).find('td').eq(1).invoke('text').then((nome) => {
                expect(nome.toLowerCase()).to.include('maria');
            });
        });
    })

    it('RF0024 - Consulta de clientes: Filtrar por gênero e buscar pela barra de busca', () => {
        cy.get('input[name="genero"][value="M"]').check();
        cy.get('#aplicarFiltro').click();

        cy.get('#buscaCliente').type('maria');

        cy.get('.tabela-master tbody tr').each(($linha) => {
            cy.wrap($linha).find('td').eq(1).invoke('text').then((nome) => {
                expect(nome.toLowerCase()).to.include('maria');
            });
        });
    })

    it('RF0024 - Consulta de clientes: Limpar busca restaura a lista completa', () => {
        cy.get('.tabela-master tbody tr').its('length').then((totalInicial) => {
            cy.get('#buscaCliente').type('maria');
            cy.get('.tabela-master tbody tr').should('have.length.lessThan', totalInicial + 1);

            cy.get('#buscaCliente').clear();
            cy.get('.tabela-master tbody tr').should('have.length', totalInicial);
        });
    })


})