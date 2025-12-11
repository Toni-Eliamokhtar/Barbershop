import request from 'supertest';
import express from 'express';

// Mock app setup
const app = express();
app.use(express.json());

// Mock database
let reservations = [];

// Reservation routes
app.post('/api/reservation', (req, res) => {
  const { barberId, serviceId, date, time, userId } = req.body;

  // Validation
  if (!barberId || !serviceId || !date || !time || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check for collision
  const collision = reservations.some(
    r => r.barberId === barberId && r.date === date && r.time === time
  );

  if (collision) {
    return res.status(409).json({ error: 'Time slot already booked' });
  }

  // Create reservation
  const reservation = {
    reservationId: 'res_' + Date.now(),
    barberId,
    serviceId,
    date,
    time,
    userId,
    status: 'pending_payment',
    createdAt: new Date()
  };

  reservations.push(reservation);
  res.status(201).json(reservation);
});

// Get reservation
app.get('/api/reservation/:id', (req, res) => {
  const reservation = reservations.find(r => r.reservationId === req.params.id);
  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' });
  }
  res.json(reservation);
});

// Mock payment
app.post('/api/payment', (req, res) => {
  const { reservationId, amount, card } = req.body;

  if (!reservationId || !amount || !card) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const reservation = reservations.find(r => r.reservationId === reservationId);
  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  // Simulate card decline
  if (card.startsWith('4000000000000002')) {
    return res.status(402).json({ error: 'Payment failed' });
  }

  // Process payment
  const payment = {
    transactionId: 'txn_' + Date.now(),
    reservationId,
    amount,
    status: 'success',
    createdAt: new Date()
  };

  reservation.status = 'confirmed';
  reservation.paymentId = payment.transactionId;

  res.status(200).json(payment);
});

describe('Integration Tests - Booking API', () => {
  beforeEach(() => {
    reservations = [];
  });

  describe('POST /api/reservation', () => {
    test('should create reservation successfully', async () => {
      const response = await request(app)
        .post('/api/reservation')
        .send({
          barberId: 'barber1',
          serviceId: 'haircut',
          date: '2025-12-20',
          time: '14:00',
          userId: 'user123'
        });

      expect(response.status).toBe(201);
      expect(response.body.reservationId).toBeDefined();
      expect(response.body.status).toBe('pending_payment');
    });

    test('should reject double booking', async () => {
      // First booking
      await request(app)
        .post('/api/reservation')
        .send({
          barberId: 'barber1',
          serviceId: 'haircut',
          date: '2025-12-20',
          time: '14:00',
          userId: 'user123'
        });

      // Second booking same slot
      const response = await request(app)
        .post('/api/reservation')
        .send({
          barberId: 'barber1',
          serviceId: 'haircut',
          date: '2025-12-20',
          time: '14:00',
          userId: 'user456'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('already booked');
    });

    test('should accept booking different time slot', async () => {
      // First booking
      await request(app)
        .post('/api/reservation')
        .send({
          barberId: 'barber1',
          serviceId: 'haircut',
          date: '2025-12-20',
          time: '14:00',
          userId: 'user123'
        });

      // Second booking different time
      const response = await request(app)
        .post('/api/reservation')
        .send({
          barberId: 'barber1',
          serviceId: 'haircut',
          date: '2025-12-20',
          time: '15:00',
          userId: 'user456'
        });

      expect(response.status).toBe(201);
    });

    test('should reject missing fields', async () => {
      const response = await request(app)
        .post('/api/reservation')
        .send({
          barberId: 'barber1',
          serviceId: 'haircut'
          // Missing date, time, userId
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/reservation/:id', () => {
    test('should retrieve existing reservation', async () => {
      const createRes = await request(app)
        .post('/api/reservation')
        .send({
          barberId: 'barber1',
          serviceId: 'haircut',
          date: '2025-12-20',
          time: '14:00',
          userId: 'user123'
        });

      const resId = createRes.body.reservationId;
      const getRes = await request(app).get(`/api/reservation/${resId}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.reservationId).toBe(resId);
    });

    test('should return 404 for non-existent reservation', async () => {
      const response = await request(app).get('/api/reservation/invalid');
      expect(response.status).toBe(404);
    });
  });
});

describe('Integration Tests - Payment API', () => {
  beforeEach(() => {
    reservations = [];
  });

  describe('POST /api/payment', () => {
    test('should process payment successfully', async () => {
      // Create reservation first
      const resRes = await request(app)
        .post('/api/reservation')
        .send({
          barberId: 'barber1',
          serviceId: 'haircut',
          date: '2025-12-20',
          time: '14:00',
          userId: 'user123'
        });

      const resId = resRes.body.reservationId;

      // Process payment
      const payRes = await request(app)
        .post('/api/payment')
        .send({
          reservationId: resId,
          amount: 25,
          card: '4242424242424242'
        });

      expect(payRes.status).toBe(200);
      expect(payRes.body.transactionId).toBeDefined();
      expect(payRes.body.status).toBe('success');
    });

    test('should handle payment failure', async () => {
      // Create reservation first
      const resRes = await request(app)
        .post('/api/reservation')
        .send({
          barberId: 'barber1',
          serviceId: 'haircut',
          date: '2025-12-20',
          time: '14:00',
          userId: 'user123'
        });

      const resId = resRes.body.reservationId;

      // Process payment with failing card
      const payRes = await request(app)
        .post('/api/payment')
        .send({
          reservationId: resId,
          amount: 25,
          card: '4000000000000002'
        });

      expect(payRes.status).toBe(402);
      expect(payRes.body.error).toContain('failed');
    });

    test('should reject payment for non-existent reservation', async () => {
      const response = await request(app)
        .post('/api/payment')
        .send({
          reservationId: 'invalid',
          amount: 25,
          card: '4242424242424242'
        });

      expect(response.status).toBe(404);
    });
  });
});
