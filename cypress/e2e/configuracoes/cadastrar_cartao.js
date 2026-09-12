describe('RN0025 - Bandeiras permitidas para registro de cartões de crédito', () => {
  beforeEach(() => {
        cy.visit('https://pontocertoweb.netlify.app/login');
        cy.wait(500);
        cy.get('#btn-entrar').click();
        cy.wait(500)
        cy.visit('https://pontocertoweb.netlify.app/configuracoes');
        cy.wait(500);
        cy.get('.link-alterar').click();
    })
})