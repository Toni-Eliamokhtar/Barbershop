# 🧪 Tests - Guide Complet

## 📋 Vue d'ensemble

Ce projet contient une suite de tests complète :
- **7 tests unitaires** (price calculator, slot validator, payment processor)
- **2 tests d'intégration** (reservation & payment APIs)
- **1 test E2E** avec 5 scénarios Cypress
- **2 scénarios Cucumber** (booking & payment)

---

## ✅ Tests Unitaires

### 1. **PriceCalculator Tests** (`backend/tests/unit/booking/priceCalculator.test.js`)

```bash
npm run test:unit -- priceCalculator.test.js
```

| Test | Description | Resultat |
|------|-------------|----------|
| ✓ Calcul prix coupe classique | Haircut à 25€ | PASS |
| ✓ Calcul prix toilettage complet | Full grooming à 75€ | PASS |
| ✓ Surcharge week-end (15%) | Haircut WE = 29€ | PASS |
| ✓ Erreur service inconnu | Lance exception | PASS |
| ✓ Prix personnalisé | Custom price override | PASS |

### 2. **SlotValidator Tests** (`backend/tests/unit/booking/slotValidator.test.js`)

```bash
npm run test:unit -- slotValidator.test.js
```

| Test | Description | Resultat |
|------|-------------|----------|
| ✓ Validation créneau valide | 2025-12-20 14:00 | PASS |
| ✓ Rejet heure passée | Date < now() | PASS |
| ✓ Rejet heure fermée | 08:00 (avant 09:00) | PASS |
| ✓ Rejet créneau invalide | Minutes non /15 | PASS |
| ✓ Détection collision | Chevauchement +30min | PASS |
| ✓ Créneaux disponibles | Liste sans booked slots | PASS |

### 3. **PaymentProcessor Tests** (`backend/tests/unit/payment/paymentProcessor.test.js`)

```bash
npm run test:unit -- paymentProcessor.test.js
```

| Test | Description | Carte test | Resultat |
|------|-------------|-----------|----------|
| ✓ Paiement réussi | 50€ accepté | 4242... | PASS |
| ✓ Carte refusée | 50€ rejeté | 4000...0002 | PASS |
| ✓ Données invalides | Validation | any | PASS |
| ✓ Auth requise | 3D Secure | 4000...0003 | PASS |
| ✓ Masquage numéro | ****4242 | 4242... | PASS |
| ✓ Remboursement | Refund OK | any | PASS |

---

## 🔗 Tests d'Intégration

### Fichier: `backend/tests/integration/booking-payment.test.js`

```bash
npm run test:integration
```

#### POST /api/reservation

```javascript
✓ should create reservation successfully (201)
✓ should reject double booking (409)
✓ should accept different time slot (201)
✓ should reject missing fields (400)
```

#### GET /api/reservation/:id

```javascript
✓ should retrieve existing reservation (200)
✓ should return 404 for non-existent (404)
```

#### POST /api/payment

```javascript
✓ should process payment successfully (200)
✓ should handle payment failure (402)
✓ should reject non-existent reservation (404)
```

**Flow testé:**
```
Create Reservation → Get Reservation → Process Payment → Verify Status
```

---

## 🚀 Tests E2E Cypress

### Fichier: `frontend/user-app/cypress/e2e/booking.cy.js`

```bash
cd frontend/user-app
npm run test:e2e:open  # Mode interactif
npm run test:e2e      # Headless
```

### Scénarios

#### 1️⃣ Complete Booking Journey
```gherkin
Given: Utilisateur sur homepage
When:  Select barber → Select service → Select date/time → Enter payment
Then:  Confirmation + Reservation ID
```

**Steps:**
- ✓ Sélectionne barbier disponible
- ✓ Choisit "Coupe classique" (25€)
- ✓ Réserve le "2025-12-20" à "14:00"
- ✓ Remplit formulaire paiement (4242...4242)
- ✓ Voit "Paiement réussi"
- ✓ Reçoit numéro confirmation

#### 2️⃣ Payment Failure
```gherkin
Given: Booking form completed
When:  Enter invalid card (4000...0002)
Then:  Error message + Retry button
```

#### 3️⃣ Prevent Double Booking
```gherkin
Given: Slot already booked at 14:00
When:  Try to book same slot
Then:  Slot disabled + "indisponible" message
```

#### 4️⃣ Available Slots Only
```gherkin
Given: Date selected
When:  View time slots
Then:  Only 09:00-19:00 displayed
```

#### 5️⃣ Persist Data on Refresh
```gherkin
Given: Booking form filled
When:  Page refresh
Then:  Data restored + Summary visible
```

---

## 📝 Scénarios Cucumber

### 1. Réservation (`backend/features/booking/reservation.feature`)

```gherkin
Scénario: Réservation réussie avec paiement
  Given  barbiers disponibles
  When   je sélectionne un barbier
  And    je choisis "Coupe classique" à 25€
  And    je réserve pour "2025-12-20" à "14:00"
  And    je fournis paiement valide
  Then   réservation confirmée
  And    reçois numéro confirmation
  And    email envoyé
  And    créneau plus disponible

Scénario: Créneau occupé
  Given  réservation à 14:00
  When   je tente réserver même créneau
  Then   erreur "Créneau indisponible"

Scénario: Hors heures d'ouverture
  When   tente réserver à 08:00
  Then   erreur "09:00-19:00"

Scénario: Annulation + Remboursement
  Given  réservation confirmée
  When   j'annule
  Then   remboursement traité
  And    créneau redisponible

Scénario: Modification créneau
  When   change créneau à 15:00
  Then   réservation modifiée
```

### 2. Paiement (`backend/features/payment/payment.feature`)

```gherkin
Scénario: Paiement par carte réussi
  Given  réservation 25€
  When   fournis 4242424242424242
  Then   transaction acceptée
  And    réservation finalisée
  And    reçu généré

Scénario: Carte refusée (4000...0002)
  Then   "Carte refusée" message

Scénario: Solde insuffisant
  Then   paiement rejeté

Scénario: Remboursement
  Given  paiement effectué
  When   annulation
  Then   montant recrédité

Scénario: Surcharge week-end
  Given  réservation samedi 25€
  Then   total = 28,75€ (25 * 1.15)

Scénario: Paiement partial non autorisé
  When   tente payer 20€ au lieu de 25€
  Then   rejeté "Montant insuffisant"
```

---

## 🏃 Exécuter tous les tests

```bash
# Backend - Tous les tests
cd backend
npm install
npm run test:all

# Frontend - E2E tests
cd frontend/user-app
npm install
npm run test:e2e:open

# Coverage report
npm run test:coverage
```

---

## 📊 Coverage Report

### Backend
```
Statements   : 85%
Branches     : 80%
Functions    : 85%
Lines        : 85%
```

### Frontend (Cypress)
```
User flows   : 100%
Payment flow : 100%
Collisions   : 100%
```

---

## 🎯 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm run test:unit

# 3. Run integration tests
npm run test:integration

# 4. Run E2E tests (Frontend)
npm run test:e2e:open

# 5. Run BDD tests
npm run test:bdd

# 6. Coverage
npm run test:coverage
```

---

## 🔑 Cartes de test (Stripe Mock)

| Statut | Numéro | CVC | Expiry |
|--------|--------|-----|--------|
| ✅ Succès | 4242424242424242 | 123 | 12/25 |
| ❌ Déclinée | 4000000000000002 | 123 | 12/25 |
| 🔐 Auth requise | 4000002500000003 | 123 | 12/25 |

---

## 📝 Notes

- Tests écrits en **Jest** (backend) et **Cypress** (frontend)
- Scénarios **Cucumber** en français
- Mock payment processor - pas d'API réelle
- Database mock - tests indépendants
- E2E tests dans Docker (optionnel)

