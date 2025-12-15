import request from 'supertest';
import app from '../index.js';

describe('Auth & Barber basic tests', () => {
  const randomEmail = (n = Date.now()) => `test${n}@example.com`;

  test('validation email rejected', async () => {
    const res = await request(app).post('/auth/signup').send({ email: 'bad-email', password: 'Password1!', nom: 'Test' });
    expect(res.statusCode).toBe(400);
  });

  test('validation password rejected', async () => {
    const res = await request(app).post('/auth/signup').send({ email: randomEmail(), password: 'short', nom: 'Test' });
    expect(res.statusCode).toBe(400);
  });

  test('signup returns created user', async () => {
    const email = randomEmail();
    const res = await request(app).post('/auth/signup').send({ email, password: 'Password1!', nom: 'Test' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', email);
  });

  test('login OK / KO', async () => {
    const email = randomEmail();
    const password = 'Password1!';
    // Try to signup first (may fail if Supabase not configured)
    await request(app).post('/auth/signup').send({ email, password, nom: 'Test' });
    const ok = await request(app).post('/auth/login').send({ email, password });
    expect(ok.statusCode).toBe(200);

    const ko = await request(app).post('/auth/login').send({ email, password: 'wrong' });
    expect(ko.statusCode).toBe(401);
  });
});
