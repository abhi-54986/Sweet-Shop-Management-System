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

describe('Order Management', () => {
  let adminToken: string;
  let userToken: string;
  let sweetId: string;

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

    // Create a sweet for ordering
    const sweetResponse = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Gulab Jamun',
        description: 'Traditional sweet',
        price: 250,
        category: 'Traditional',
        stock: 100
      });

    sweetId = sweetResponse.body.sweet._id;
  });

  describe('POST /api/orders - Create Order', () => {
    it('should allow authenticated user to create an order', async () => {
      const newOrder = {
        items: [
          {
            sweet: sweetId,
            quantity: 5
          }
        ],
        deliveryAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          phone: '9876543210'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newOrder)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Order created successfully');
      expect(response.body.order).toHaveProperty('totalAmount', 1250); // 250 * 5
      expect(response.body.order).toHaveProperty('status', 'Pending');
      expect(response.body.order.items).toHaveLength(1);
    });

    it('should not allow unauthenticated user to create an order', async () => {
      const newOrder = {
        items: [
          {
            sweet: sweetId,
            quantity: 5
          }
        ],
        deliveryAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          phone: '9876543210'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .send(newOrder)
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });

    it('should calculate total amount correctly for multiple items', async () => {
      // Create another sweet
      const sweet2Response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Rasgulla',
          description: 'Soft dessert',
          price: 200,
          category: 'Traditional',
          stock: 50
        });

      const sweet2Id = sweet2Response.body.sweet._id;

      const newOrder = {
        items: [
          {
            sweet: sweetId,
            quantity: 3
          },
          {
            sweet: sweet2Id,
            quantity: 2
          }
        ],
        deliveryAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          phone: '9876543210'
        }
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newOrder)
        .expect(201);

      // (250 * 3) + (200 * 2) = 750 + 400 = 1150
      expect(response.body.order).toHaveProperty('totalAmount', 1150);
      expect(response.body.order.items).toHaveLength(2);
    });
  });

  describe('GET /api/orders - Get User Orders', () => {
    it('should get all orders for authenticated user', async () => {
      // Create an order first
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ sweet: sweetId, quantity: 2 }],
          deliveryAddress: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            phone: '9876543210'
          }
        });

      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.orders.length).toBe(1);
    });

    it('should not allow unauthenticated access', async () => {
      const response = await request(app)
        .get('/api/orders')
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Not authorized, no token');
    });
  });

  describe('GET /api/orders/all - Get All Orders (Admin)', () => {
    it('should allow admin to get all orders', async () => {
      // User creates an order
      await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ sweet: sweetId, quantity: 2 }],
          deliveryAddress: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            phone: '9876543210'
          }
        });

      const response = await request(app)
        .get('/api/orders/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(Array.isArray(response.body.orders)).toBe(true);
      expect(response.body.orders.length).toBeGreaterThanOrEqual(1);
    });

    it('should not allow regular user to get all orders', async () => {
      const response = await request(app)
        .get('/api/orders/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Not authorized as an admin');
    });
  });

  describe('GET /api/orders/:id - Get Single Order', () => {
    it('should get single order by id for owner', async () => {
      // Create an order
      const createResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ sweet: sweetId, quantity: 2 }],
          deliveryAddress: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            phone: '9876543210'
          }
        });

      const orderId = createResponse.body.order._id;

      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.order).toHaveProperty('_id', orderId);
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/orders/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Order not found');
    });
  });

  describe('PUT /api/orders/:id - Update Order Status (Admin)', () => {
    it('should allow admin to update order status', async () => {
      // User creates an order
      const createResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ sweet: sweetId, quantity: 2 }],
          deliveryAddress: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            phone: '9876543210'
          }
        });

      const orderId = createResponse.body.order._id;

      // Admin updates status
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Processing' })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Order status updated successfully');
      expect(response.body.order).toHaveProperty('status', 'Processing');
    });

    it('should not allow regular user to update order status', async () => {
      // User creates an order
      const createResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ sweet: sweetId, quantity: 2 }],
          deliveryAddress: {
            street: '123 Main St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            phone: '9876543210'
          }
        });

      const orderId = createResponse.body.order._id;

      // User tries to update status
      const response = await request(app)
        .put(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'Completed' })
        .expect(403);

      expect(response.body).toHaveProperty('message', 'Not authorized as an admin');
    });
  });
});