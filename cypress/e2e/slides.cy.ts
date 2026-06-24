describe('mdslide E2E & Smoke Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Smoke Test: Loads the slides presentation successfully', () => {
    cy.get('body').should('be.visible');

    cy.get('.slide').should('have.length', 3);

    cy.get('.slide').first().should('contain.text', 'E2E Test Presentation');
  });

  it('E2E Test: Navigates slides using keyboard arrows', () => {
    cy.get('.slide').eq(0).should('have.class', 'active');
    cy.get('#dokCounter').should('have.text', '1 / 3');

    cy.get('body').trigger('keydown', { key: 'ArrowRight' });

    cy.get('.slide').eq(1).should('have.class', 'active');
    cy.get('.slide').eq(0).should('not.have.class', 'active');
    cy.get('#dokCounter').should('have.text', '2 / 3');

    cy.get('body').trigger('keydown', { key: 'ArrowLeft' });
    cy.get('.slide').eq(0).should('have.class', 'active');
    cy.get('#dokCounter').should('have.text', '1 / 3');
  });

  it('E2E Test: Navigates slides using HUD button controls', () => {
    cy.get('.slide').eq(0).should('have.class', 'active');

    cy.get('#dokNext').click();

    cy.get('.slide').eq(1).should('have.class', 'active');
    cy.get('#dokCounter').should('have.text', '2 / 3');

    cy.get('#dokPrev').click();

    cy.get('.slide').eq(0).should('have.class', 'active');
  });
});
