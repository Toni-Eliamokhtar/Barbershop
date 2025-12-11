/**
 * Service de validation des créneaux horaires
 */

const BUSINESS_HOURS = {
  start: '09:00',
  end: '19:00'
};

const SLOT_DURATION = 30; // minutes

/**
 * Valide si un créneau est correct
 * @param {string} date - Date au format YYYY-MM-DD
 * @param {string} time - Heure au format HH:MM
 * @param {number} duration - Durée en minutes
 * @returns {boolean} true si le créneau est valide
 */
function validateSlot(date, time, duration = SLOT_DURATION) {
  // Vérifier que la date n'est pas dans le passé
  const slotDateTime = new Date(`${date}T${time}:00`);
  const now = new Date();
  
  if (slotDateTime < now) {
    return false;
  }

  // Vérifier que l'heure est dans les heures de travail
  if (!isWithinBusinessHours(time, duration)) {
    return false;
  }

  // Vérifier que le créneau est valide (minutes: 00, 15, 30, 45)
  const minutes = parseInt(time.split(':')[1]);
  if (minutes % 15 !== 0) {
    return false;
  }

  return true;
}

/**
 * Vérifie si une heure est dans les heures de travail
 * @param {string} time - Heure au format HH:MM
 * @param {number} duration - Durée en minutes
 * @returns {boolean} true si dans les heures de travail
 */
function isWithinBusinessHours(time, duration = SLOT_DURATION) {
  const [startHour, startMin] = time.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = startMinutes + duration;

  const [businessStartHour, businessStartMin] = BUSINESS_HOURS.start.split(':').map(Number);
  const businessStartMinutes = businessStartHour * 60 + businessStartMin;

  const [businessEndHour, businessEndMin] = BUSINESS_HOURS.end.split(':').map(Number);
  const businessEndMinutes = businessEndHour * 60 + businessEndMin;

  return startMinutes >= businessStartMinutes && endMinutes <= businessEndMinutes;
}

/**
 * Détecte une collision avec les réservations existantes
 * @param {string} date - Date au format YYYY-MM-DD
 * @param {string} time - Heure au format HH:MM
 * @param {number} duration - Durée en minutes
 * @param {Array} existingReservations - Réservations existantes
 * @returns {boolean} true s'il y a collision
 */
function hasCollision(date, time, duration, existingReservations = []) {
  const [slotHour, slotMin] = time.split(':').map(Number);
  const slotStart = slotHour * 60 + slotMin;
  const slotEnd = slotStart + duration;

  return existingReservations.some(reservation => {
    if (reservation.date !== date) {
      return false;
    }

    const [resHour, resMin] = reservation.start.split(':').map(Number);
    const resStart = resHour * 60 + resMin;
    const resEnd = resStart + reservation.duration;

    // Vérifier chevauchement
    return !(slotEnd <= resStart || slotStart >= resEnd);
  });
}

/**
 * Obtient les créneaux disponibles pour une date donnée
 * @param {string} date - Date au format YYYY-MM-DD
 * @param {number} duration - Durée du service en minutes
 * @param {Array} existingReservations - Réservations existantes
 * @returns {Array} Créneaux disponibles (format HH:MM)
 */
function getAvailableSlots(date, duration = SLOT_DURATION, existingReservations = []) {
  const slots = [];
  const [startHour, startMin] = BUSINESS_HOURS.start.split(':').map(Number);
  const [endHour, endMin] = BUSINESS_HOURS.end.split(':').map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes + duration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const minutes = currentMinutes % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    if (!hasCollision(date, timeStr, duration, existingReservations)) {
      slots.push(timeStr);
    }

    currentMinutes += 15;
  }

  return slots;
}

export {
  validateSlot,
  hasCollision,
  getAvailableSlots,
  isWithinBusinessHours,
  BUSINESS_HOURS,
  SLOT_DURATION
};
