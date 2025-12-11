/**
 * Service de traitement des paiements (Mock)
 */

// Cartes de test Stripe
const TEST_CARDS = {
  'success': ['4242424242424242', '5555555555554444', '378282246310005'],
  'fail': ['4000000000000002', '4000002500003155'],
  'require_auth': ['4000002500000003']
};

/**
 * Traite un paiement (simulation)
 * @param {Object} paymentData - Données de paiement
 * @param {number} paymentData.amount - Montant en euros
 * @param {string} paymentData.card - Numéro de carte
 * @param {string} paymentData.cvc - Code de sécurité
 * @param {string} paymentData.expiry - Date d'expiration MM/YY
 * @param {string} paymentData.name - Nom du titulaire
 * @returns {Promise<Object>} Résultat du paiement
 */
async function processPayment(paymentData) {
  // Validation basique
  if (!validatePaymentData(paymentData)) {
    return {
      status: 'failed',
      error: 'Invalid payment data',
      code: 'INVALID_DATA'
    };
  }

  // Simuler un délai réseau
  await delay(500);

  const { amount, card, cvc, expiry, name } = paymentData;

  // Vérifier le numéro de carte
  if (TEST_CARDS.success.includes(card)) {
    return {
      status: 'success',
      transactionId: generateTransactionId(),
      amount,
      card: maskCardNumber(card),
      timestamp: new Date().toISOString(),
      message: 'Payment processed successfully'
    };
  }

  if (TEST_CARDS.fail.includes(card)) {
    return {
      status: 'failed',
      error: 'Card declined',
      code: 'CARD_DECLINED',
      card: maskCardNumber(card),
      timestamp: new Date().toISOString()
    };
  }

  if (TEST_CARDS.require_auth.includes(card)) {
    return {
      status: 'requires_authentication',
      error: 'Additional authentication required',
      code: 'AUTH_REQUIRED',
      card: maskCardNumber(card),
      timestamp: new Date().toISOString()
    };
  }

  // Carte inconnue = déclinée
  return {
    status: 'failed',
    error: 'Card not recognized',
    code: 'UNKNOWN_CARD',
    card: maskCardNumber(card),
    timestamp: new Date().toISOString()
  };
}

/**
 * Valide les données de paiement
 * @param {Object} paymentData - Données à valider
 * @returns {boolean} true si valides
 */
function validatePaymentData(paymentData) {
  if (!paymentData) return false;
  
  const { amount, card, cvc, expiry } = paymentData;

  // Vérifier montant
  if (!amount || amount <= 0) return false;

  // Vérifier numéro de carte (Luhn algorithm simplifié)
  if (!card || card.length < 13 || card.length > 19) return false;
  if (!/^\d+$/.test(card)) return false;

  // Vérifier CVC
  if (!cvc || cvc.length < 3 || cvc.length > 4) return false;
  if (!/^\d+$/.test(cvc)) return false;

  // Vérifier expiration
  if (!expiry || !/^\d{2}\/\d{2}$/.test(expiry)) return false;
  
  const [month, year] = expiry.split('/');
  const expDate = new Date(2000 + parseInt(year), parseInt(month));
  if (expDate < new Date()) return false;

  return true;
}

/**
 * Génère un ID de transaction unique
 * @returns {string} ID de transaction
 */
function generateTransactionId() {
  return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Masque un numéro de carte (affiche seulement les 4 derniers chiffres)
 * @param {string} cardNumber - Numéro de carte
 * @returns {string} Numéro masqué
 */
function maskCardNumber(cardNumber) {
  const lastFour = cardNumber.slice(-4);
  return '*'.repeat(cardNumber.length - 4) + lastFour;
}

/**
 * Remboursement de paiement (simulation)
 * @param {string} transactionId - ID de transaction à rembourser
 * @param {number} amount - Montant à rembourser
 * @returns {Promise<Object>} Résultat du remboursement
 */
async function refundPayment(transactionId, amount) {
  await delay(500);

  return {
    status: 'success',
    refundId: 'ref_' + Date.now(),
    originalTransactionId: transactionId,
    amount,
    timestamp: new Date().toISOString(),
    message: 'Refund processed successfully'
  };
}

/**
 * Helper pour simuler un délai
 * @param {number} ms - Délai en millisecondes
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {
  processPayment,
  refundPayment,
  validatePaymentData,
  generateTransactionId,
  maskCardNumber,
  TEST_CARDS
};
