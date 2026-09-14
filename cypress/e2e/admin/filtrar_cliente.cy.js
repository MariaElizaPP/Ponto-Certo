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


})