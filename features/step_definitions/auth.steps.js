import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import app from '../../backend/index.js';
import assert from 'assert';

let signupRes;

Given('I open the signup page', function () {
  // In API-driven steps we don't open a browser; placeholder
  return true;
});

When('I submit valid credentials', async function () {
  const email = `cuke${Date.now()}@test.com`;
  const password = 'Password1!';
  signupRes = await request(app).post('/auth/signup').send({ email, password, nom: 'Cuke' });
  this.latestEmail = email;
  this.latestPassword = password;
});

Then('I should see a success message', function () {
  assert.strictEqual(signupRes.status, 200);
});

Given('I have an existing account', async function () {
  const email = `cuke${Date.now()}@test.com`;
  const password = 'Password1!';
  await request(app).post('/auth/signup').send({ email, password, nom: 'Cuke' });
  this.latestEmail = email;
  this.latestPassword = password;
});

When('I login with valid credentials', async function () {
  const res = await request(app).post('/auth/login').send({ email: this.latestEmail, password: this.latestPassword });
  this.loginRes = res;
});

Then('I should land on the dashboard', function () {
  // For API steps we check login success
  assert.strictEqual(this.loginRes.status, 200);
});
