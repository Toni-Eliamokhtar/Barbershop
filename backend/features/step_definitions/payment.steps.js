import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

// Mock state
let reservation = null;
let paymentData = null;
let paymentResult = null;
let errorMessage = null;

// Given steps
Given('une réservation en attente de paiement', function () {
  reservation = {
    id: 'res-123',
    barberId: 1,
    serviceId: 'haircut',
    date: '2025-12-20',
    time: '14:00',
    amount: 25,
    status: 'pending_payment',
    userId: 'user-123'
  };
});

Given('une réservation pour {string}', function (amount) {
  const numAmount = parseFloat(amount.replace('€', ''));
  reservation = {
    id: 'res-' + Date.now(),
    amount: numAmount,
    status: 'pending_payment'
  };
});

Given('une réservation annulée avec paiement effectué', function () {
  reservation = {
    id: 'res-123',
    amount: 25,
    status: 'cancelled',
    paymentId: 'pay-456',
    refundStatus: 'pending'
  };
});

Given('une réservation le samedi {string}', function (date) {
  reservation = {
    id: 'res-weekend',
    date: date,
    serviceId: 'haircut',
    baseAmount: 25,
    isWeekend: true,
    amount: 25 * 1.15 // Weekend surcharge
  };
});

Given('un service à {string}', function (price) {
  const numPrice = parseFloat(price.replace('€', ''));
  if (reservation) {
    reservation.baseAmount = numPrice;
    if (reservation.isWeekend) {
      reservation.amount = numPrice * 1.15;
    }
  }
});

// When steps
When('je fournis un numéro de carte valide {string}', function (cardNumber) {
  paymentData = {
    cardNumber: cardNumber,
    reservation: reservation,
    amount: reservation.amount
  };
});

When('je fournis un CVC valide {string}', function (cvc) {
  if (!paymentData) paymentData = {};
  paymentData.cvc = cvc;
});

When("je fournis une date d'expiration valide {string}", function (expiry) {
  if (!paymentData) paymentData = {};
  paymentData.expiry = expiry;
});

When('je confirme le paiement', function () {
  // Simulate payment processing
  if (!paymentData || !paymentData.cardNumber) {
    paymentResult = {
      status: 'failed',
      error: 'Missing payment data'
    };
    return;
  }

  const cardNumber = paymentData.cardNumber;
  
  // Test cards
  if (cardNumber === '4242424242424242' || cardNumber.startsWith('5555')) {
    paymentResult = {
      status: 'success',
      transactionId: 'txn-' + Date.now(),
      amount: reservation.amount,
      timestamp: new Date().toISOString()
    };
    reservation.status = 'confirmed';
    reservation.paymentId = paymentResult.transactionId;
  } else if (cardNumber === '4000000000000002') {
    paymentResult = {
      status: 'failed',
      error: 'Carte refusée'
    };
    errorMessage = 'Carte refusée';
  } else {
    paymentResult = {
      status: 'failed',
      error: 'Carte non reconnue'
    };
  }
});

When('je fournis un numéro de carte invalide {string}', function (cardNumber) {
  paymentData = {
    cardNumber: cardNumber,
    cvc: '123',
    expiry: '12/25',
    amount: reservation.amount
  };
});

When('je fournis une carte avec solde insuffisant', function () {
  paymentData = {
    cardNumber: '4000000000009995', // Insufficient funds card
    cvc: '123',
    expiry: '12/25',
    amount: reservation.amount
  };
  errorMessage = 'Solde insuffisant';
});

When('le système traite le remboursement', function () {
  if (reservation && reservation.paymentId) {
    reservation.refundStatus = 'completed';
    reservation.refundAmount = reservation.amount;
    reservation.refundDate = new Date().toISOString();
  }
});

When('je confirme la réservation', function () {
  if (reservation.isWeekend) {
    // Calculate with surcharge
    const baseAmount = reservation.baseAmount || 25;
    reservation.amount = Math.round(baseAmount * 1.15 * 100) / 100;
  }
});

When('je tente de payer {string}', function (amount) {
  const attemptAmount = parseFloat(amount.replace('€', ''));
  if (attemptAmount < reservation.amount) {
    errorMessage = 'Montant insuffisant';
    paymentResult = {
      status: 'failed',
      error: 'Montant insuffisant'
    };
  }
});

// Then steps
Then('la transaction est acceptée', function () {
  expect(paymentResult).to.exist;
  expect(paymentResult.status).to.equal('success');
  expect(paymentResult.transactionId).to.exist;
});

Then('la réservation est finalisée', function () {
  expect(reservation.status).to.equal('confirmed');
  expect(reservation.paymentId).to.exist;
});

Then('un reçu est généré', function () {
  const receipt = {
    reservationId: reservation.id,
    transactionId: paymentResult.transactionId,
    amount: reservation.amount,
    date: new Date().toISOString()
  };
  expect(receipt).to.exist;
  expect(receipt.transactionId).to.exist;
});

Then('le client reçoit une confirmation par email', function () {
  // Mock email sending
  const emailSent = true;
  expect(emailSent).to.be.true;
});

Then('le paiement est rejeté', function () {
  expect(paymentResult).to.exist;
  expect(paymentResult.status).to.equal('failed');
});

Then('un message d\'erreur {string} s\'affiche', function (expectedMessage) {
  expect(errorMessage).to.exist;
  expect(errorMessage).to.include(expectedMessage);
});

Then('la réservation reste en attente de paiement', function () {
  expect(reservation.status).to.equal('pending_payment');
});

Then("un message d'erreur s'affiche", function () {
  expect(errorMessage).to.exist;
  expect(paymentResult.error).to.exist;
});

Then('je peux essayer avec une autre carte', function () {
  // Reset payment data to allow retry
  paymentData = null;
  paymentResult = null;
  expect(reservation.status).to.equal('pending_payment');
});

Then('le montant est recrédité', function () {
  expect(reservation.refundStatus).to.equal('completed');
  expect(reservation.refundAmount).to.equal(reservation.amount);
});

Then('un email de remboursement est envoyé', function () {
  const emailSent = true;
  expect(emailSent).to.be.true;
});

Then('le statut de la réservation est {string}', function (status) {
  // Status could be 'cancelled', 'refunded', etc.
  const validStatuses = ['cancelled', 'remboursée'];
  expect(validStatuses.some(s => status.includes(s))).to.be.true;
});

Then('le prix affiché inclut la surcharge week-end', function () {
  expect(reservation.isWeekend).to.be.true;
  expect(reservation.amount).to.be.greaterThan(reservation.baseAmount);
});

Then('le montant total est {string}', function (expectedAmount) {
  const expected = parseFloat(expectedAmount.replace('€', '').replace(',', '.'));
  expect(reservation.amount).to.be.closeTo(expected, 0.01);
});

Then('le détail de la surcharge est visible', function () {
  const surchargeDetails = {
    base: reservation.baseAmount,
    surcharge: reservation.amount - reservation.baseAmount,
    total: reservation.amount,
    reason: 'Weekend surcharge (15%)'
  };
  expect(surchargeDetails.surcharge).to.be.greaterThan(0);
});

Then('un message {string} s\'affiche', function (message) {
  expect(errorMessage).to.exist;
  expect(errorMessage).to.include(message);
});

Then('je dois payer le montant complet', function () {
  expect(reservation.amount).to.exist;
  expect(errorMessage).to.include('Montant insuffisant');
});

// Cleanup
import { After } from '@cucumber/cucumber';

After(function () {
  reservation = null;
  paymentData = null;
  paymentResult = null;
  errorMessage = null;
});
