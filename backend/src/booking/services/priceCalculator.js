/**
 * Service de calcul des prix de service
 */

const SERVICES = {
  'haircut': { name: 'Coupe classique', price: 25, duration: 30 },
  'beard-trim': { name: 'Taille barbe', price: 15, duration: 20 },
  'full-grooming': { name: 'Toilettage complet', price: 75, duration: 60 },
  'hair-coloring': { name: 'Coloration', price: 45, duration: 45 },
  'shampoo-massage': { name: 'Shampoing massage', price: 20, duration: 20 },
};

const WEEKEND_SURCHARGE = 1.15; // 15% surcharge

/**
 * Calcule le prix d'un service
 * @param {string} serviceId - ID du service
 * @param {number} duration - Durée du service en minutes
 * @param {Object} options - Options (isWeekend, customPrice, etc)
 * @returns {number} Prix final
 */
function calculatePrice(serviceId, duration = null, options = {}) {
  if (!SERVICES[serviceId]) {
    throw new Error(`Service ${serviceId} not found`);
  }

  let service = SERVICES[serviceId];
  let basePrice = service.price;

  // Appliquer surcharge weekend si applicable
  if (options.isWeekend) {
    basePrice = Math.round(basePrice * WEEKEND_SURCHARGE * 100) / 100;
  }

  // Appliquer prix personnalisé si fourni
  if (options.customPrice) {
    basePrice = options.customPrice;
  }

  return basePrice;
}

/**
 * Obtient les détails d'un service
 * @param {string} serviceId - ID du service
 * @returns {Object} Détails du service
 */
function getServiceDetails(serviceId) {
  if (!SERVICES[serviceId]) {
    throw new Error(`Service ${serviceId} not found`);
  }
  return { ...SERVICES[serviceId], id: serviceId };
}

/**
 * Obtient la liste de tous les services
 * @returns {Array} Liste des services
 */
function getAllServices() {
  return Object.entries(SERVICES).map(([id, service]) => ({
    id,
    ...service
  }));
}

export {
  calculatePrice,
  getServiceDetails,
  getAllServices,
  SERVICES
};
