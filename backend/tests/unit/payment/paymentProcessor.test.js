import { processPayment, validatePaymentData, maskCardNumber, refundPayment } from '../../../src/payment/services/paymentProcessor.js';

describe('PaymentProcessor Service', () => {
  describe('processPayment', () => {
    const validPaymentData = {
      amount: 50,
      card: '4242424242424242',
      cvc: '123',
      expiry: '12/25',
      name: 'John Doe'
    };

    test('should process valid payment successfully', async () => {
      const result = await processPayment(validPaymentData);
      expect(result.status).toBe('success');
      expect(result.transactionId).toBeDefined();
      expect(result.amount).toBe(50);
      expect(result.card).toBe('************4242');
    });

    test('should reject invalid card (test decline)', async () => {
      const paymentData = { ...validPaymentData, card: '4000000000000002' };
      const result = await processPayment(paymentData);
      expect(result.status).toBe('failed');
      expect(result.code).toBe('CARD_DECLINED');
    });

    test('should handle invalid payment data', async () => {
      const result = await processPayment({ amount: -10, card: '1234' });
      expect(result.status).toBe('failed');
      expect(result.error).toBe('Invalid payment data');
    });

    test('should require authentication for specific card', async () => {
      const paymentData = { ...validPaymentData, card: '4000002500000003' };
      const result = await processPayment(paymentData);
      expect(result.status).toBe('requires_authentication');
      expect(result.code).toBe('AUTH_REQUIRED');
    });
  });

  describe('validatePaymentData', () => {
    test('should validate correct payment data', () => {
      const result = validatePaymentData({
        amount: 50,
        card: '4242424242424242',
        cvc: '123',
        expiry: '12/25'
      });
      expect(result).toBe(true);
    });

    test('should reject negative amount', () => {
      const result = validatePaymentData({
        amount: -50,
        card: '4242424242424242',
        cvc: '123',
        expiry: '12/25'
      });
      expect(result).toBe(false);
    });

    test('should reject invalid card number', () => {
      const result = validatePaymentData({
        amount: 50,
        card: '123',
        cvc: '123',
        expiry: '12/25'
      });
      expect(result).toBe(false);
    });

    test('should reject invalid CVC', () => {
      const result = validatePaymentData({
        amount: 50,
        card: '4242424242424242',
        cvc: '12',
        expiry: '12/25'
      });
      expect(result).toBe(false);
    });

    test('should reject expired card', () => {
      const result = validatePaymentData({
        amount: 50,
        card: '4242424242424242',
        cvc: '123',
        expiry: '01/20'
      });
      expect(result).toBe(false);
    });
  });

  describe('maskCardNumber', () => {
    test('should mask card number correctly', () => {
      const masked = maskCardNumber('4242424242424242');
      expect(masked).toBe('************4242');
    });

    test('should show only last 4 digits', () => {
      const masked = maskCardNumber('5555555555554444');
      expect(masked).toMatch(/\*{12}4444/);
    });
  });

  describe('refundPayment', () => {
    test('should process refund successfully', async () => {
      const result = await refundPayment('txn_123', 50);
      expect(result.status).toBe('success');
      expect(result.refundId).toBeDefined();
      expect(result.amount).toBe(50);
    });
  });
});
