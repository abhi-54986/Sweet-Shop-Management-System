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

describe('User Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'USER'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'john@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register user with existing email', async () => {
      // First, register a user
      const firstUser = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'USER'
      };

      await request(app)
        .post('/api/auth/register')
        .send(firstUser);

      // Try to register again with same email
      const duplicateUser = {
        name: 'Jane Doe',
        email: 'john@example.com',
        password: 'password456',
        role: 'USER'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with correct credentials', async () => {
      // First, register a user
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'USER'
      };

      await request(app)
        .post('/api/auth/register')
        .send(user);

      // Now try to login
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'john@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not login with incorrect password', async () => {
      // First, register a user
      const user = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'USER'
      };

      await request(app)
        .post('/api/auth/register')
        .send(user);

      // Try to login with wrong password
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });

    it('should not login with non-existent email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email or password');
    });
  });
});