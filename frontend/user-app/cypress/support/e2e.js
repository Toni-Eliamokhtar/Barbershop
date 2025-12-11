// Cypress support file for E2E tests
// Global test utilities and hooks

// Disable uncaught exception handling for Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
  // return false to prevent Cypress from failing the test
  return false;
});

// Add custom commands here if needed
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/');
  cy.get('[data-testid="login-email"]').type(email);
  cy.get('[data-testid="login-password"]').type(password);
  cy.get('[data-testid="login-submit"]').click();
});

Cypress.Commands.add('selectBarber', (barberName) => {
  cy.get('[data-testid="barber-list"]').should('be.visible');
  cy.contains(barberName).click();
});

Cypress.Commands.add('selectService', (serviceName) => {
  cy.contains(serviceName).click();
});

Cypress.Commands.add('selectDateTime', (date, time) => {
  cy.get('[data-testid="date-picker"]').click();
  cy.get(`[data-testid="date-${date}"]`).click();
  cy.get(`[data-testid="time-${time}"]`).click();
});

Cypress.Commands.add('fillPaymentForm', (cardNumber, cvc, expiry, name) => {
  cy.get('[name="cardNumber"]').type(cardNumber);
  cy.get('[name="cvc"]').type(cvc);
  cy.get('[name="expiry"]').type(expiry);
  cy.get('[name="cardholderName"]').type(name);
});
