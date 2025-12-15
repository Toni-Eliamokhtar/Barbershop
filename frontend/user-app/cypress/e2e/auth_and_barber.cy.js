describe('Signup → Login → Dashboard → Select barber', () => {
  const email = `e2e_${Date.now()}@test.com`;
  const password = 'Password1!';

  it('signup then login then select barber', () => {
    cy.visit('/signup');
    // backend runs on :5000 — intercept full URL so Cypress sees the request
    cy.intercept('POST', 'http://localhost:5000/auth/signup').as('signupReq');
    // fill required fields
    cy.get('input[placeholder="Nom complet"]').type('E2E Tester');
    cy.get('[data-testid="email"]').type(email);
    cy.get('[data-testid="password"]').type(password);
    cy.get('[data-testid="signup"]').click();

    // wait for signup network request and assert status
    cy.wait('@signupReq', { timeout: 10000 }).then((interception) => {
      // log response for debugging
      // eslint-disable-next-line no-console
      cy.log('signup response', JSON.stringify(interception.response));
      expect(interception.response.statusCode).to.equal(200);
    });

    // app navigates immediately under Cypress; just assert the URL
    cy.url().should('include', '/login');

    // If SweetAlert modal from signup is still present, close it so inputs are usable
    cy.get('body').then(($body) => {
      if ($body.find('.swal2-confirm').length) {
        cy.get('.swal2-confirm', { timeout: 5000 }).click({ force: true });
      }
    });

    cy.get('[data-testid="email"]').type(email);
    cy.get('[data-testid="password"]').type(password);
    cy.get('[data-testid="login"]').click();
    cy.url().should('include', '/dashboard');

    // ensure any lingering SweetAlert overlay is gone before interacting
    cy.get('.swal2-container', { timeout: 10000 }).should('not.exist');

    cy.get('[data-testid="barber-item"]').first().click();
    cy.get('[data-testid="barber-selected"]').should('exist');
  });
});
