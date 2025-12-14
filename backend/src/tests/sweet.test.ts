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

describe('Sweet Management', () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
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
  });

  describe('POST /api/sweets - Create Sweet', () => {
    it('should allow admin to create a new sweet', async () => {
      const newSweet = {
        name: 'Gulab Jamun',
        description: 'Traditional Indian sweet made from milk solids',
        price: 250,
        category: 'Traditional',
        stock: 50,
        imageUrl: 'https://example.com/gulab-jamun.jpg'
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newSweet)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Sweet created successfully');
      expect(response.body.sweet).toHaveProperty('name', 'Gulab Jamun');
      expect(response.body.sweet).toHaveProperty('price', 250);
      expect(response.body.sweet).toHaveProperty('stock', 50);
    });

    it('should not allow regular user to create a sweet', async () => {
      const newSweet = {
        name: 'Rasgulla',
        description: 'Soft spongy dessert',
        price: 200,
        category: 'Traditional',
        stock: 30
      };

      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newSweet)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Not authorized as an admin');
    });

    it('should not create sweet without authentication', async () => {
      const newSweet = {
        name: 'Jalebi',
        description: 'Crispy sweet',
        price: 150,
        category: 'Traditional',
        stock: 40
      };

      const response = await request(app)
        .post('/api/sweets')
        .send(newSweet)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });
  });

  describe('GET /api/sweets - Get All Sweets', () => {
    it('should get all sweets (public access)', async () => {
      // First, create some sweets as admin
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Gulab Jamun',
          description: 'Traditional sweet',
          price: 250,
          category: 'Traditional',
          stock: 50
        });

      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Rasgulla',
          description: 'Soft dessert',
          price: 200,
          category: 'Traditional',
          stock: 30
        });

      // Now get all sweets without authentication
      const response = await request(app)
        .get('/api/sweets')
        .expect(200);

      expect(response.body).toHaveProperty('sweets');
      expect(Array.isArray(response.body.sweets)).toBe(true);
      expect(response.body.sweets.length).toBe(2);
    });
  });

  describe('GET /api/sweets/:id - Get Single Sweet', () => {
    it('should get a single sweet by id', async () => {
      // Create a sweet
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Gulab Jamun',
          description: 'Traditional sweet',
          price: 250,
          category: 'Traditional',
          stock: 50
        });

      const sweetId = createResponse.body.sweet._id;

      // Get the sweet by id
      const response = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .expect(200);

      expect(response.body.sweet).toHaveProperty('name', 'Gulab Jamun');
      expect(response.body.sweet).toHaveProperty('price', 250);
    });

    it('should return 404 for non-existent sweet', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/sweets/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Sweet not found');
    });
  });

  describe('PUT /api/sweets/:id - Update Sweet', () => {
    it('should allow admin to update a sweet', async () => {
      // Create a sweet
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Gulab Jamun',
          description: 'Traditional sweet',
          price: 250,
          category: 'Traditional',
          stock: 50
        });

      const sweetId = createResponse.body.sweet._id;

      // Update the sweet
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          price: 300,
          stock: 60
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Sweet updated successfully');
      expect(response.body.sweet).toHaveProperty('price', 300);
      expect(response.body.sweet).toHaveProperty('stock', 60);
    });

    it('should not allow regular user to update a sweet', async () => {
      // Create a sweet as admin
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Gulab Jamun',
          description: 'Traditional sweet',
          price: 250,
          category: 'Traditional',
          stock: 50
        });

      const sweetId = createResponse.body.sweet._id;

      // Try to update as regular user
      const response = await request(app)
        .put(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          price: 300
        })
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Not authorized as an admin');
    });
  });

  describe('DELETE /api/sweets/:id - Delete Sweet', () => {
    it('should allow admin to delete a sweet', async () => {
      // Create a sweet
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Gulab Jamun',
          description: 'Traditional sweet',
          price: 250,
          category: 'Traditional',
          stock: 50
        });

      const sweetId = createResponse.body.sweet._id;

      // Delete the sweet
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Sweet deleted successfully');
    });

    it('should not allow regular user to delete a sweet', async () => {
      // Create a sweet as admin
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Gulab Jamun',
          description: 'Traditional sweet',
          price: 250,
          category: 'Traditional',
          stock: 50
        });

      const sweetId = createResponse.body.sweet._id;

      // Try to delete as regular user
      const response = await request(app)
        .delete(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Not authorized as an admin');
    });
  });
});