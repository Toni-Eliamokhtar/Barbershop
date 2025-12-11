import { validateSlot, hasCollision, getAvailableSlots, isWithinBusinessHours } from '../../../src/booking/services/slotValidator.js';

describe('SlotValidator Service', () => {
  const validDate = '2025-12-20';
  const validTime = '14:00';

  describe('validateSlot', () => {
    test('should validate a correct time slot', () => {
      const result = validateSlot(validDate, validTime, 30);
      expect(result).toBe(true);
    });

    test('should reject past time slot', () => {
      const pastDate = '2020-01-15';
      const result = validateSlot(pastDate, '10:00', 30);
      expect(result).toBe(false);
    });

    test('should reject time outside business hours', () => {
      const result = validateSlot(validDate, '08:00', 30); // Before 09:00
      expect(result).toBe(false);
    });

    test('should reject invalid time slot minutes (not 15-minute increments)', () => {
      const result = validateSlot(validDate, '14:07', 30);
      expect(result).toBe(false);
    });
  });

  describe('hasCollision', () => {
    const existingReservations = [
      { date: '2025-12-20', start: '14:00', duration: 30 },
      { date: '2025-12-20', start: '15:00', duration: 30 }
    ];

    test('should detect collision with existing reservation', () => {
      const collision = hasCollision('2025-12-20', '14:15', 30, existingReservations);
      expect(collision).toBe(true);
    });

    test('should not detect collision if no overlap', () => {
      const collision = hasCollision('2025-12-20', '13:00', 30, existingReservations);
      expect(collision).toBe(false);
    });

    test('should not detect collision on different date', () => {
      const collision = hasCollision('2025-12-21', '14:00', 30, existingReservations);
      expect(collision).toBe(false);
    });

    test('should return false for empty reservation list', () => {
      const collision = hasCollision('2025-12-20', '14:00', 30, []);
      expect(collision).toBe(false);
    });
  });

  describe('isWithinBusinessHours', () => {
    test('should accept time within business hours (09:00-19:00)', () => {
      const result = isWithinBusinessHours('14:00', 30);
      expect(result).toBe(true);
    });

    test('should reject time before opening', () => {
      const result = isWithinBusinessHours('08:00', 30);
      expect(result).toBe(false);
    });

    test('should reject time after closing', () => {
      const result = isWithinBusinessHours('18:45', 30);
      expect(result).toBe(false);
    });
  });

  describe('getAvailableSlots', () => {
    test('should return available slots for given date', () => {
      const slots = getAvailableSlots('2025-12-20', 30, []);
      expect(Array.isArray(slots)).toBe(true);
      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0]).toMatch(/^\d{2}:\d{2}$/);
    });

    test('should exclude booked slots from available slots', () => {
      const existingReservations = [
        { date: '2025-12-20', start: '14:00', duration: 30 }
      ];
      const slots = getAvailableSlots('2025-12-20', 30, existingReservations);
      expect(slots).not.toContain('14:00');
    });
  });
});
