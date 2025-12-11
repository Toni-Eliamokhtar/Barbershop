describe('Complete Booking Flow - E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    // Wait for page to load
    cy.get('body').should('exist');
  });

  it('should complete full booking journey from barber to confirmation', () => {
    // Step 1: Select barber
    cy.contains(/Sélectionner|choisir/i).should('exist');
    cy.get('[data-testid="barber-list"]').should('be.visible');
    cy.get('[data-testid="barber-1"]').click();
    cy.contains(/barber|barbier/i).should('be.visible');

    // Step 2: Select service
    cy.get('[data-testid="service-list"]').should('be.visible');
    cy.contains(/Coupe classique|haircut/i).should('exist');
    cy.get('[data-testid="service-haircut"]').click();
    
    // Verify price is displayed
    cy.get('[data-testid="service-price"]').should('contain', '25');

    // Step 3: Select date and time
    cy.get('[data-testid="date-picker"]').should('be.visible');
    cy.get('[data-testid="date-picker"]').click();
    
    // Click on a valid future date
    cy.get('[data-testid="date-2025-12-20"]').should('exist');
    cy.get('[data-testid="date-2025-12-20"]').click();

    // Select time slot
    cy.get('[data-testid="time-slots"]').should('be.visible');
    cy.get('[data-testid="time-14:00"]').should('be.visible');
    cy.get('[data-testid="time-14:00"]').click();

    // Step 4: Verify booking summary
    cy.get('[data-testid="booking-summary"]').should('be.visible');
    cy.get('[data-testid="summary-price"]').should('contain', '25');

    // Step 5: Proceed to payment
    cy.contains(/Procéder au paiement|Continue to payment/i).click();
    cy.url().should('include', '/payment');

    // Step 6: Fill payment form
    cy.get('[data-testid="payment-form"]').should('be.visible');
    cy.get('[name="cardNumber"]').type('4242424242424242');
    cy.get('[name="cvc"]').type('123');
    cy.get('[name="expiry"]').type('12/25');
    cy.get('[name="cardholderName"]').type('John Doe');

    // Step 7: Confirm payment
    cy.contains(/Confirmer|Payer|Pay/i).click();

    // Step 8: Verify payment success
    cy.contains(/Paiement réussi|Payment successful/i, { timeout: 10000 }).should('be.visible');

    // Step 9: Verify confirmation with reservation ID
    cy.get('[data-testid="confirmation-number"]').should('exist');
    cy.get('[data-testid="confirmation-number"]').should('not.be.empty');

    // Step 10: Verify email confirmation message
    cy.contains(/confirmation.*email|email.*confirmation/i).should('exist');
  });

  it('should handle payment failure gracefully', () => {
    // Follow same steps until payment
    cy.get('[data-testid="barber-1"]').click();
    cy.get('[data-testid="service-haircut"]').click();
    cy.get('[data-testid="date-picker"]').click();
    cy.get('[data-testid="date-2025-12-20"]').click();
    cy.get('[data-testid="time-14:00"]').click();
    cy.contains(/Procéder au paiement|Continue to payment/i).click();

    // Use a failing card
    cy.get('[name="cardNumber"]').type('4000000000000002');
    cy.get('[name="cvc"]').type('123');
    cy.get('[name="expiry"]').type('12/25');
    cy.get('[name="cardholderName"]').type('Jane Doe');

    // Attempt payment
    cy.contains(/Confirmer|Payer|Pay/i).click();

    // Verify error message
    cy.contains(/Paiement échoué|Payment failed|declined/i, { timeout: 10000 }).should('be.visible');

    // Verify user can try again
    cy.contains(/Réessayer|Retry|Try again/i).should('exist');
  });

  it('should prevent double booking of same time slot', () => {
    // First booking
    cy.get('[data-testid="barber-1"]').click();
    cy.get('[data-testid="service-haircut"]').click();
    cy.get('[data-testid="date-picker"]').click();
    cy.get('[data-testid="date-2025-12-20"]').click();
    cy.get('[data-testid="time-14:00"]').click();
    cy.contains(/Procéder au paiement|Continue to payment/i).click();

    cy.get('[name="cardNumber"]').type('4242424242424242');
    cy.get('[name="cvc"]').type('123');
    cy.get('[name="expiry"]').type('12/25');
    cy.get('[name="cardholderName"]').type('User One');
    cy.contains(/Confirmer|Payer|Pay/i).click();

    cy.contains(/Paiement réussi|Payment successful/i, { timeout: 10000 });

    // Go back to book another
    cy.visit('http://localhost:3000');
    cy.get('[data-testid="barber-1"]').click();
    cy.get('[data-testid="service-haircut"]').click();
    cy.get('[data-testid="date-picker"]').click();
    cy.get('[data-testid="date-2025-12-20"]').click();

    // Same time should be unavailable
    cy.get('[data-testid="time-14:00"]').should('have.class', 'disabled');
    cy.contains(/indisponible|unavailable|booked/i).should('exist');
  });

  it('should show available time slots only', () => {
    cy.get('[data-testid="barber-1"]').click();
    cy.get('[data-testid="service-haircut"]').click();
    cy.get('[data-testid="date-picker"]').click();
    cy.get('[data-testid="date-2025-12-20"]').click();

    // All slots shown should be during business hours (09:00-19:00)
    cy.get('[data-testid="time-slots"] button').each(($btn) => {
      const time = $btn.text();
      const [hours] = time.split(':');
      const hour = parseInt(hours);
      expect(hour).to.be.greaterThanOrEqual(9);
      expect(hour).to.be.lessThan(19);
    });
  });

  it('should maintain booking data through page refresh', () => {
    cy.get('[data-testid="barber-1"]').click();
    cy.get('[data-testid="service-haircut"]').click();
    cy.get('[data-testid="date-picker"]').click();
    cy.get('[data-testid="date-2025-12-20"]').click();
    cy.get('[data-testid="time-14:00"]').click();

    // Refresh page
    cy.reload();

    // Booking data should still be available
    cy.get('[data-testid="booking-summary"]').should('be.visible');
    cy.get('[data-testid="summary-price"]').should('contain', '25');
  });
});
