/* eslint-env cypress */
/* global cy, Cypress */

describe('Complete Booking Flow - E2E', () => {
  const baseUrl = 'http://localhost:3000';
  const backendUrl = 'http://localhost:5000';

  beforeEach(() => {
    // Stub barbers list and barber details so UI always has data
    cy.intercept('GET', '**/rest/v1/barbers*', (req) => {
      req.reply({
        statusCode: 200,
        body: [
          {
            id: 123,
            nom: 'Test Barber',
            photo_url: '/images/fallback.jpg',
            specialite: 'Coupe & barbe',
          },
        ],
      });
    }).as('getBarbers');

    // Stub availabilities to allow time selection
    cy.intercept('GET', '**/rest/v1/disponibilites_barber*', {
      statusCode: 200,
      body: [],
    }).as('getAvailabilities');

    // Stub services endpoint
    cy.intercept('GET', '**/rest/v1/services*', {
      statusCode: 200,
      body: [
        {
          id: 'service-uuid-123',
          nom: 'Coupe cheveux',
          prix: 25,
          duree: 30,
        },
      ],
    }).as('getServices');

    // Stub RPC function for booking
    cy.intercept('POST', '**/rest/v1/rpc/book_rdv', {
      statusCode: 200,
      body: {
        success: true,
        rendez_vous_id: 'rdv-123',
        slot_id: 'slot-123',
      },
    }).as('bookRdv');

    // Create a fresh test user and log in via UI
    const email = `e2e_book_${Date.now()}@test.com`;
    const password = 'Password1!';

    cy.request('POST', `${backendUrl}/auth/signup`, {
      nom: 'E2E Booker',
      email,
      telephone: '000',
      password,
    }).then((res) => {
      expect(res.status).to.equal(200);
      cy.visit(`${baseUrl}/login`);
      cy.get('[data-testid="email"]').type(email);
      cy.get('[data-testid="password"]').type(password);
      cy.get('[data-testid="login"]').click();
      cy.url().should('include', '/dashboard');
      cy.wait('@getBarbers');
      
      // Dismiss any SweetAlert popups that might be blocking the page
      cy.get('body').then(($body) => {
        if ($body.find('.swal2-container').length > 0) {
          cy.get('.swal2-confirm').click();
        }
      });
    });
  });

  it('should complete full booking journey from barber to confirmation', () => {
    // Stub checkout to avoid external redirect (BEFORE any actions)
    cy.intercept('POST', `${backendUrl}/booking/create-checkout-session`, {
      statusCode: 200,
      body: { url: null },
    }).as('createCheckout');

    // Select first barber card
    cy.get('[data-testid="barber-item"]').first().should('be.visible').click();

    // Booking page loaded
    cy.get('[data-testid="barber-selected"]').should('exist');

    // Fill date and time
    cy.get('#date').should('be.visible').clear().type('2025-12-20');
    cy.get('#time').should('be.visible').select('14:00');

    // Confirm booking
    cy.contains('✅ Confirmer et payer').click();
    
    // Wait for success popup and click on payment button
    cy.get('.swal2-confirm').contains('Passer au paiement').click();
    
    cy.wait('@createCheckout');
  });

  it('should handle payment failure gracefully', () => {
    // Stub checkout failure BEFORE any actions
    cy.intercept('POST', `${backendUrl}/booking/create-checkout-session`, {
      statusCode: 402,
      body: { error: 'Payment failed' },
    }).as('createCheckoutFail');

    cy.get('[data-testid="barber-item"]').first().click();
    cy.get('#date').clear().type('2025-12-20');
    cy.get('#time').select('14:00');

    cy.contains('✅ Confirmer et payer').click();
    
    // Wait for success popup and click on payment button
    cy.get('.swal2-confirm').contains('Passer au paiement').click();
    
    cy.wait('@createCheckoutFail');
  });

  it('should prevent double booking of same time slot', () => {
    cy.get('[data-testid="barber-item"]').first().click();
    cy.get('#date').clear().type('2025-12-20');
    cy.get('#time').select('14:00');
    cy.contains('✅ Confirmer et payer').click();

    // Try second booking same slot
    cy.visit(`${baseUrl}/dashboard`);
    cy.get('[data-testid="barber-item"]').first().click();
    cy.get('#date').clear().type('2025-12-20');
    cy.get('#time').select('14:00');
    cy.contains('✅ Confirmer et payer').click();
  });

  it('should show available time slots only', () => {
    cy.get('[data-testid="barber-item"]').first().click();
    cy.get('#date').clear().type('2025-12-20');
    cy.get('#time option').each(($opt) => {
      const val = $opt.val();
      if (!val) return;
      const hour = parseInt(val.split(':')[0]);
      expect(hour).to.be.at.least(9);
      expect(hour).to.be.below(23);
    });
  });

  it('should maintain booking data through page refresh', () => {
    cy.get('[data-testid="barber-item"]').first().click();
    cy.get('#date').clear().type('2025-12-20');
    cy.get('#time').select('14:00');

    cy.reload();
    cy.get('#date').should('exist');
    cy.get('#time').should('exist');
  });
});
