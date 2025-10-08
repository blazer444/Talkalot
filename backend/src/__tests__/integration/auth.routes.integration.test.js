import request from 'supertest';
import express from 'express';
import authRoutes from '../../routes/auth.route.js';
import { signup } from '../../controllers/auth.controller.js';

// Mock the controller
jest.mock('../../controllers/auth.controller.js');

describe('Auth Routes Integration', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Express app with auth routes
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  describe('POST /api/auth/signup', () => {
    test('should call signup controller on POST request', async () => {
      // Arrange
      signup.mockImplementation((req, res) => {
        res.status(201).json({ message: 'User created' });
      });

      // Act
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      // Assert
      expect(signup).toHaveBeenCalled();
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: 'User created' });
    });

    test('should pass request body to signup controller', async () => {
      // Arrange
      const userData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'securepass123'
      };
      signup.mockImplementation((req, res) => {
        res.status(201).json(req.body);
      });

      // Act
      await request(app)
        .post('/api/auth/signup')
        .send(userData);

      // Assert
      expect(signup).toHaveBeenCalled();
      const req = signup.mock.calls[0][0];
      expect(req.body).toEqual(userData);
    });

    test('should handle JSON content type', async () => {
      // Arrange
      signup.mockImplementation((req, res) => {
        res.status(201).json({ success: true });
      });

      // Act
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          fullName: 'Test',
          email: 'test@test.com',
          password: '123456'
        }));

      // Assert
      expect(response.status).toBe(201);
    });

    test('should return error from controller', async () => {
      // Arrange
      signup.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Email already in use' });
      });

      // Act
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          fullName: 'Test',
          email: 'existing@example.com',
          password: 'password'
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already in use');
    });
  });

  describe('GET /api/auth/login', () => {
    test('should return login endpoint message', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/login');

      // Assert
      expect(response.status).toBe(200);
      expect(response.text).toBe('Login endpoint');
    });

    test('should be accessible via GET method', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/login');

      // Assert
      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/auth/logout', () => {
    test('should return logout endpoint message', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/logout');

      // Assert
      expect(response.status).toBe(200);
      expect(response.text).toBe('Logout endpoint');
    });

    test('should be accessible via GET method', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/logout');

      // Assert
      expect(response.status).toBe(200);
    });
  });

  describe('Route Method Validation', () => {
    test('should not allow GET request to signup endpoint', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/signup');

      // Assert
      expect(response.status).toBe(404);
    });

    test('should not allow PUT request to signup endpoint', async () => {
      // Act
      const response = await request(app)
        .put('/api/auth/signup')
        .send({ data: 'test' });

      // Assert
      expect(response.status).toBe(404);
    });

    test('should not allow DELETE request to signup endpoint', async () => {
      // Act
      const response = await request(app)
        .delete('/api/auth/signup');

      // Assert
      expect(response.status).toBe(404);
    });

    test('should not allow POST request to login endpoint', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({ data: 'test' });

      // Assert
      expect(response.status).toBe(404);
    });

    test('should not allow POST request to logout endpoint', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ data: 'test' });

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Invalid Routes', () => {
    test('should return 404 for non-existent route', async () => {
      // Act
      const response = await request(app)
        .get('/api/auth/nonexistent');

      // Assert
      expect(response.status).toBe(404);
    });

    test('should return 404 for invalid auth route', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/invalid')
        .send({ data: 'test' });

      // Assert
      expect(response.status).toBe(404);
    });
  });

  describe('Request Body Handling', () => {
    test('should handle empty request body', async () => {
      // Arrange
      signup.mockImplementation((req, res) => {
        res.status(400).json({ message: 'Missing fields' });
      });

      // Act
      const response = await request(app)
        .post('/api/auth/signup')
        .send({});

      // Assert
      expect(response.status).toBe(400);
    });

    test('should handle malformed JSON', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      // Assert
      expect(response.status).toBe(400);
    });

    test('should handle large request body', async () => {
      // Arrange
      signup.mockImplementation((req, res) => {
        res.status(201).json({ success: true });
      });

      const largeData = {
        fullName: 'A'.repeat(1000),
        email: 'test@example.com',
        password: 'B'.repeat(1000)
      };

      // Act
      const response = await request(app)
        .post('/api/auth/signup')
        .send(largeData);

      // Assert
      expect(signup).toHaveBeenCalled();
    });
  });

  describe('Router Export', () => {
    test('should export Express router', () => {
      // Assert
      expect(authRoutes).toBeDefined();
      expect(typeof authRoutes).toBe('function');
    });
  });
});