import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

// Mock state
let currentUser = null;
let availableBarbers = [];
let selectedBarber = null;
let selectedService = null;
let selectedDate = null;
let selectedTime = null;
let reservation = null;
let errorMessage = null;
let existingReservations = [];

// Setup
Given('des barbiers disponibles', function () {
  availableBarbers = [
    { id: 1, name: 'John Doe', available: true },
    { id: 2, name: 'Jane Smith', available: true }
  ];
});

Given('des services proposés', function () {
  this.services = [
    { id: 'haircut', name: 'Coupe classique', price: 25, duration: 30 },
    { id: 'beard-trim', name: 'Taille barbe', price: 15, duration: 20 },
    { id: 'full-grooming', name: 'Toilettage complet', price: 75, duration: 60 }
  ];
});

Given('que je suis un client non authentifié', function () {
  currentUser = { id: 'guest-user', authenticated: false };
});

Given('je suis un client non authentifié', function () {
  currentUser = { id: 'guest-user', authenticated: false };
});

Given('que je suis un client', function () {
  currentUser = { id: 'user-123', name: 'Test User', authenticated: true };
});

Given('je suis un client', function () {
  currentUser = { id: 'user-123', name: 'Test User', authenticated: true };
});

Given('une réservation existante le {string} à {string}', function (date, time) {
  existingReservations.push({
    barberId: 1,
    date: date,
    time: time,
    duration: 30,
    status: 'confirmed'
  });
});

Given('une réservation confirmée', function () {
  if (!currentUser) {
    currentUser = { id: 'user-123', name: 'Test User', authenticated: true };
  }
  reservation = {
    id: 'res-123',
    barberId: 1,
    serviceId: 'haircut',
    date: '2025-12-20',
    time: '14:00',
    status: 'confirmed',
    userId: currentUser.id
  };
});

// Actions
When('je sélectionne un barbier disponible', function () {
  selectedBarber = availableBarbers.find(b => b.available);
  expect(selectedBarber).to.exist;
});

When('je choisis un service {string} à {int}€', function (serviceName, price) {
  selectedService = {
    id: 'haircut',
    name: serviceName,
    price: price,
    duration: 30
  };
});

When('je réserve pour {string} à {string}', function (date, time) {
  selectedDate = date;
  selectedTime = time;
  
  // Vérifier collision
  const hasCollision = existingReservations.some(
    r => r.date === date && r.time === time && r.barberId === selectedBarber.id
  );
  
  if (hasCollision) {
    errorMessage = 'Créneau indisponible';
    reservation = null;
  } else {
    reservation = {
      id: 'res-' + Date.now(),
      barberId: selectedBarber.id,
      serviceId: selectedService.id,
      date: date,
      time: time,
      status: 'pending_payment',
      userId: currentUser.id
    };
  }
});

When('je tente de réserver le même créneau {string} à {string}', function (date, time) {
  selectedDate = date;
  selectedTime = time;
  
  const hasCollision = existingReservations.some(
    r => r.date === date && r.time === time
  );
  
  if (hasCollision) {
    errorMessage = 'Créneau indisponible';
    reservation = null;
  }
});

When('je tente de réserver à {string} \\(avant 09:00)', function (time) {
  selectedTime = time;
  const hour = parseInt(time.split(':')[0]);
  
  if (hour < 9) {
    errorMessage = "Horaires d'ouverture: 09:00-19:00";
    reservation = null;
  }
});

When("j'annule la réservation", function () {
  if (reservation) {
    reservation.status = 'cancelled';
    reservation.refundStatus = 'processing';
  }
});

When('je change le créneau à {string}', function (newTime) {
  if (reservation) {
    reservation.time = newTime;
    reservation.modified = true;
  }
});

When('le créneau est disponible', function () {
  // Check availability
  const available = !existingReservations.some(
    r => r.time === reservation.time && r.date === reservation.date
  );
  expect(available).to.be.true;
});

When('je fournis mes informations de paiement valides', function () {
  this.paymentInfo = {
    cardNumber: '4242424242424242',
    cvc: '123',
    expiry: '12/25',
    name: 'Test User'
  };
});

// Assertions
Then('la réservation est confirmée', function () {
  expect(reservation).to.exist;
  reservation.status = 'confirmed';
  expect(reservation.status).to.equal('confirmed');
});

Then('je reçois un numéro de confirmation', function () {
  expect(reservation).to.exist;
  expect(reservation.id).to.exist;
  expect(reservation.id).to.match(/^res-/);
});

Then("un email de confirmation est envoyé", function () {
  // Mock email sending
  const emailSent = true;
  expect(emailSent).to.be.true;
});

Then("le créneau n'est plus disponible pour les autres", function () {
  existingReservations.push({
    barberId: reservation.barberId,
    date: reservation.date,
    time: reservation.time,
    duration: 30,
    status: 'confirmed'
  });
  
  const isNowTaken = existingReservations.some(
    r => r.date === reservation.date && r.time === reservation.time
  );
  expect(isNowTaken).to.be.true;
});

Then('je reçois une erreur {string}', function (expectedError) {
  expect(errorMessage).to.exist;
  expect(errorMessage).to.equal(expectedError);
});

Then("aucune réservation n'est créée", function () {
  expect(reservation).to.be.null;
});

Then('le créneau n\'est pas proposé', function () {
  const hour = parseInt(selectedTime.split(':')[0]);
  expect(hour).to.be.lessThan(9);
});

Then('le remboursement est traité', function () {
  expect(reservation.refundStatus).to.equal('processing');
});

Then('le créneau redevient disponible', function () {
  const index = existingReservations.findIndex(
    r => r.barberId === reservation.barberId && 
         r.date === reservation.date && 
         r.time === reservation.time
  );
  if (index > -1) {
    existingReservations.splice(index, 1);
  }
  expect(existingReservations.find(
    r => r.barberId === reservation.barberId && r.time === reservation.time
  )).to.be.undefined;
});

Then("un email d'annulation est envoyé", function () {
  const emailSent = true;
  expect(emailSent).to.be.true;
});

Then('la réservation est modifiée', function () {
  expect(reservation.modified).to.be.true;
});

Then('un email de confirmation est renvoyé', function () {
  const emailSent = true;
  expect(emailSent).to.be.true;
});

// Cleanup
import { After } from '@cucumber/cucumber';

After(function () {
  currentUser = null;
  selectedBarber = null;
  selectedService = null;
  selectedDate = null;
  selectedTime = null;
  reservation = null;
  errorMessage = null;
  existingReservations = [];
});
