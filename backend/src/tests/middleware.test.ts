import request from 'supertest';
import app from '../app';
import { connectDB, clearDB, closeDB } from './testSetup';

// Setup and teardown
beforeAll(async () => {
  await connectDB();
});

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await closeDB();
});

describe('Authentication Middleware', () => {
  let userToken: string;
  let adminToken: string;

  beforeEach(async () => {
    // Register and login a regular user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'password123',
        role: 'USER'
      });

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123'
      });

    userToken = userLogin.body.token;

    // Register and login an admin user
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'ADMIN'
      });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });

    adminToken = adminLogin.body.token;
  });

  describe('protect middleware', () => {
    it('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'user@example.com');
    });

    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, token failed');
    });
  });

  describe('authorize middleware', () => {
    it('should allow admin to access admin-only routes', async () => {
      const response = await request(app)
        .get('/api/auth/admin-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should deny regular user from accessing admin-only routes', async () => {
      const response = await request(app)
        .get('/api/auth/admin-only')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Not authorized as an admin');
    });
  });
});