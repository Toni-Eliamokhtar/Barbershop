import { calculatePrice, getServiceDetails, getAllServices } from '../../../src/booking/services/priceCalculator.js';

describe('PriceCalculator Service', () => {
  describe('calculatePrice', () => {
    test('should calculate price for haircut service', () => {
      const price = calculatePrice('haircut');
      expect(price).toBe(25);
    });

    test('should calculate price for full-grooming service', () => {
      const price = calculatePrice('full-grooming');
      expect(price).toBe(75);
    });

    test('should apply weekend surcharge (15%)', () => {
      const weekdayPrice = calculatePrice('haircut');
      const weekendPrice = calculatePrice('haircut', null, { isWeekend: true });
      expect(weekendPrice).toBe(Math.round(weekdayPrice * 1.15 * 100) / 100);
      expect(weekendPrice).toBe(28.75);
    });

    test('should throw error for unknown service', () => {
      expect(() => calculatePrice('unknown-service')).toThrow('Service unknown-service not found');
    });

    test('should apply custom price when provided', () => {
      const price = calculatePrice('haircut', null, { customPrice: 30 });
      expect(price).toBe(30);
    });
  });

  describe('getServiceDetails', () => {
    test('should return service details with id', () => {
      const details = getServiceDetails('haircut');
      expect(details).toHaveProperty('id', 'haircut');
      expect(details).toHaveProperty('name', 'Coupe classique');
      expect(details).toHaveProperty('price', 25);
      expect(details).toHaveProperty('duration', 30);
    });

    test('should throw error for unknown service', () => {
      expect(() => getServiceDetails('unknown')).toThrow('Service unknown not found');
    });
  });

  describe('getAllServices', () => {
    test('should return all available services', () => {
      const services = getAllServices();
      expect(services.length).toBeGreaterThan(0);
      expect(services[0]).toHaveProperty('id');
      expect(services[0]).toHaveProperty('name');
      expect(services[0]).toHaveProperty('price');
    });
  });
});
