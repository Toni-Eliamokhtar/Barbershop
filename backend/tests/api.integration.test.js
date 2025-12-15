import request from 'supertest';
import app from '../index.js';

describe('API integration: /signup /login', () => {
  test('POST /auth/signup -> 200', async () => {
    const res = await request(app).post('/auth/signup').send({ email: `int${Date.now()}@test.com`, password: 'Password1!', nom: 'Test' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
  });

  test('POST /auth/login -> 200 after signup', async () => {
    const email = `int2${Date.now()}@test.com`;
    const password = 'Password1!';
    await request(app).post('/auth/signup').send({ email, password, nom: 'Test' });
    const res = await request(app).post('/auth/login').send({ email, password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('user');
  });
});
