# 🏗️ Architecture - Booking & Payment

## 📂 Structure des Dossiers

```
backend/
├── src/
│   ├── booking/
│   │   ├── services/
│   │   │   ├── priceCalculator.js      # Calcul prix + surcharge WE
│   │   │   └── slotValidator.js        # Validation créneaux
│   │   └── controllers/                 # À implémenter
│   │
│   └── payment/
│       ├── services/
│       │   └── paymentProcessor.js     # Traitement paiement (mock)
│       └── controllers/                 # À implémenter
│
├── tests/
│   ├── unit/
│   │   ├── booking/
│   │   │   ├── priceCalculator.test.js
│   │   │   └── slotValidator.test.js
│   │   └── payment/
│   │       └── paymentProcessor.test.js
│   │
│   └── integration/
│       └── booking-payment.test.js
│
├── features/
│   ├── booking/
│   │   └── reservation.feature
│   └── payment/
│       └── payment.feature
│
├── jest.config.js
└── package.json (scripts tests)

frontend/user-app/
├── cypress/
│   ├── e2e/
│   │   └── booking.cy.js              # Tests E2E complet
│   └── support/
│       └── e2e.js                     # Helpers Cypress
│
├── cypress.config.js
└── package.json
```

---

## 🎯 Services Métier

### 1. PriceCalculator
**Location:** `backend/src/booking/services/priceCalculator.js`

```javascript
calculatePrice(serviceId, duration, options)
  → Retourne le prix du service
  → Applique surcharge week-end (+15%)
  → Supports prix personnalisé

getServiceDetails(serviceId)
  → Retourne nom, prix, durée du service

getAllServices()
  → Retourne liste de tous les services
```

**Services disponibles:**
| ID | Nom | Prix | Durée |
|----|-----|------|-------|
| haircut | Coupe classique | 25€ | 30min |
| beard-trim | Taille barbe | 15€ | 20min |
| full-grooming | Toilettage complet | 75€ | 60min |
| hair-coloring | Coloration | 45€ | 45min |
| shampoo-massage | Shampoing massage | 20€ | 20min |

---

### 2. SlotValidator
**Location:** `backend/src/booking/services/slotValidator.js`

```javascript
validateSlot(date, time, duration)
  → Vérifie date future
  → Vérifie heures d'ouverture (09:00-19:00)
  → Vérifie format créneau valide (:00, :15, :30, :45)

hasCollision(date, time, duration, existingReservations)
  → Détecte chevauchement avec réservations existantes
  → Tolère 0 min de chevauchement

getAvailableSlots(date, duration, existingReservations)
  → Retourne créneaux libres
  → Filtre: date valide + heures ouverture + pas de collision

isWithinBusinessHours(time, duration)
  → Vérifie si heure dans 09:00-19:00
```

**Business Hours:**
- **Ouverture:** 09:00
- **Fermeture:** 19:00
- **Créneaux:** Tous les 15 minutes
- **Durée min:** 20 minutes

---

### 3. PaymentProcessor
**Location:** `backend/src/payment/services/paymentProcessor.js`

```javascript
processPayment(paymentData)
  → amount (required)
  → card (required)
  → cvc (required)
  → expiry (required, format: MM/YY)
  → name (optional)
  
  Returns: {
    status: 'success' | 'failed' | 'requires_authentication'
    transactionId: string
    amount: number
    card: string (masked)
    timestamp: ISO string
  }

validatePaymentData(paymentData)
  → Valide montant > 0
  → Valide numéro carte (13-19 chiffres)
  → Valide CVC (3-4 chiffres)
  → Valide date expiration (not expired)

refundPayment(transactionId, amount)
  → Traite remboursement
  → Retourne refundId

maskCardNumber(cardNumber)
  → Retourne **** + 4 derniers chiffres
```

**Test Cards:**
```
Success:  4242424242424242
Decline:  4000000000000002
Auth 3DS: 4000002500000003
```

---

## 🔄 Workflows

### Workflow Réservation
```
1. SELECT BARBER
   └─ GET /api/barbers

2. SELECT SERVICE
   └─ priceCalculator.getServiceDetails(serviceId)
   └─ Display: nom, prix, durée

3. SELECT DATE & TIME
   └─ slotValidator.getAvailableSlots(date, duration, booked)
   └─ Filter: future + business hours + no collision
   └─ Display: clickable slots

4. BOOKING SUMMARY
   └─ Display: barber, service, date, time, price
   └─ Include: cancellation policy

5. PAYMENT
   └─ GET: reservation summary
   └─ calculatePrice(serviceId, duration, {isWeekend})
   └─ Display: total amount

6. PAY
   └─ POST /api/payment
   └─ paymentProcessor.processPayment(cardData)
   └─ If success → redirect confirmation

7. CONFIRMATION
   └─ Display: Reservation ID
   └─ Display: Email sent
   └─ Option: save receipt
```

### Workflow Paiement
```
1. CREATE RESERVATION (status: pending_payment)
   └─ Store: barberId, serviceId, date, time, userId

2. CALCULATE PRICE
   └─ Base price from priceCalculator
   └─ Apply weekend surcharge if applicable
   └─ Display total

3. PROCESS PAYMENT
   └─ validatePaymentData()
   └─ processPayment(cardNumber, cvc, expiry)
   └─ Poll transactionId

4. UPDATE RESERVATION
   └─ If success: status = confirmed, add paymentId
   └─ If failed: status = payment_failed, allow retry

5. SEND CONFIRMATION
   └─ Email: reservation details
   └─ Email: receipt + transaction ID
   └─ Email: cancellation instructions
```

---

## 📋 Tests par Layer

### Unit Tests (7 tests)
```
✓ priceCalculator (5)
  - Standard service pricing
  - Premium service pricing
  - Weekend surcharge
  - Unknown service error
  - Custom price override

✓ slotValidator (6)
  - Valid slot acceptance
  - Past slot rejection
  - Out of hours rejection
  - Invalid time format rejection
  - Collision detection
  - Available slots generation

✓ paymentProcessor (6)
  - Successful payment
  - Card decline handling
  - Invalid data rejection
  - 3DS authentication
  - Card number masking
  - Refund processing
```

### Integration Tests (2)
```
✓ POST /api/reservation
  - Create success
  - Double booking prevention
  - Missing field validation

✓ POST /api/payment
  - Payment success
  - Payment failure
  - Non-existent reservation
```

### E2E Tests (5 scenarios)
```
✓ Complete booking flow
  - Barber → Service → Date/Time → Payment → Confirmation

✓ Payment failure handling
  - Declined card + error message + retry option

✓ Double booking prevention
  - Unavailable slot + disabled button

✓ Business hours enforcement
  - Only valid slots displayed

✓ Data persistence
  - Form data survives page refresh
```

### BDD Tests (6 scenarios)
```
✓ Reservation (5 scenarios)
  - Successful booking
  - Slot collision
  - Out of hours
  - Cancellation
  - Modification

✓ Payment (6 scenarios)
  - Successful payment
  - Card decline
  - Insufficient funds
  - Refund process
  - Weekend surcharge
  - Partial payment rejection
```

---

## 🔌 API Endpoints (à implémenter)

### Booking
```
POST   /api/reservation          Create reservation
GET    /api/reservation/:id      Get reservation details
PATCH  /api/reservation/:id      Update reservation
DELETE /api/reservation/:id      Cancel reservation
GET    /api/available-slots      Get available time slots
```

### Payment
```
POST   /api/payment              Process payment
GET    /api/payment/:id          Get payment details
POST   /api/refund               Process refund
```

### Admin
```
GET    /api/barbers              List barbers
GET    /api/services             List services
GET    /api/reservations         List all reservations
```

---

## 🚀 Prochaines étapes

1. **Implémentation Controllers**
   - `backend/src/booking/controllers/reservationController.js`
   - `backend/src/payment/controllers/paymentController.js`

2. **Routes API**
   - `backend/src/routes/booking.js`
   - `backend/src/routes/payment.js`

3. **Database Integration**
   - Remplacer mock par Supabase
   - Migrations database

4. **Frontend Components**
   - BarberSelector component
   - ServiceSelector component
   - DateTimePicker component
   - PaymentForm component
   - ConfirmationPage component

5. **Email Integration**
   - Confirmation emails
   - Receipt emails
   - Cancellation emails

---

## 📊 File Structure Summary

```
Total Files Created: 24

Backend:
├── Services: 3 files
├── Tests (Unit): 3 files
├── Tests (Integration): 1 file
├── Features (Cucumber): 2 files
└── Config: 1 file

Frontend:
├── E2E Tests: 1 file
├── Support: 1 file
└── Config: 1 file

Documentation:
└── 2 markdown files
```

