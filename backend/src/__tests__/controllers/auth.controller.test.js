import { jest } from '@jest/globals';
import { signup } from '../../controllers/auth.controller.js';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import generateToken from '../../lib/utils.js';

// Mock dependencies
jest.unstable_mockModule('../../models/User.js', () => ({
  default: jest.fn()
}));
jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    genSalt: jest.fn(),
    hash: jest.fn()
  }
}));
jest.unstable_mockModule('../../lib/utils.js', () => ({
  default: jest.fn()
}));

describe('Auth Controller - signup', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Setup default mock behaviors
    bcrypt.genSalt = jest.fn().mockResolvedValue('test-salt');
    bcrypt.hash = jest.fn().mockResolvedValue('hashed-password');
    User.findOne = jest.fn();
    generateToken.mockReturnValue = jest.fn().mockReturnValue('test-token');
  });

  describe('Happy Path', () => {
    test('should successfully create a new user with valid data', async () => {
      // Arrange
      const mockUser = null;
      User.findOne.mockResolvedValue(mockUser);

      const mockNewUser = {
        _id: 'user123',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        profilePic: '',
        save: jest.fn().mockResolvedValue({
          _id: 'user123',
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'hashed-password',
          profilePic: ''
        })
      };
      User.mockImplementation(() => mockNewUser);

      // Act
      await signup(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'test-salt');
      expect(mockNewUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        _id: 'user123',
        fullName: 'Test User',
        email: 'test@example.com',
        profilePic: ''
      });
    });
  });

  describe('Validation - Missing Fields', () => {
    test('should return 400 when fullName is missing', async () => {
      req.body.fullName = '';
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Por favor, preencha todos os campos.' 
      });
      expect(User.findOne).not.toHaveBeenCalled();
    });

    test('should return 400 when email is missing', async () => {
      req.body.email = '';
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Por favor, preencha todos os campos.' 
      });
    });

    test('should return 400 when password is missing', async () => {
      req.body.password = '';
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Por favor, preencha todos os campos.' 
      });
    });
  });

  describe('Validation - Password Length', () => {
    test('should return 400 when password is less than 6 characters', async () => {
      req.body.password = '12345';
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'A senha deve ter pelo menos 6 caracteres.' 
      });
    });

    test('should accept password with exactly 6 characters', async () => {
      req.body.password = '123456';
      User.findOne.mockResolvedValue(null);
      const mockNewUser = {
        _id: 'user123',
        save: jest.fn().mockResolvedValue({ _id: 'user123' })
      };
      User.mockImplementation(() => mockNewUser);
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Validation - Email Format', () => {
    test('should return 400 for invalid email without @', async () => {
      req.body.email = 'invalidemail.com';
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Por favor, insira um email válido.' 
      });
    });

    test('should return 400 for invalid email without domain', async () => {
      req.body.email = 'test@';
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Por favor, insira um email válido.' 
      });
    });

    test('should accept valid email with subdomain', async () => {
      req.body.email = 'test@mail.example.com';
      User.findOne.mockResolvedValue(null);
      const mockNewUser = {
        _id: 'user123',
        save: jest.fn().mockResolvedValue({ _id: 'user123' })
      };
      User.mockImplementation(() => mockNewUser);
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Duplicate Email Check', () => {
    test('should return 400 when email already exists', async () => {
      const existingUser = {
        _id: 'existing123',
        email: 'test@example.com',
        fullName: 'Existing User'
      };
      User.findOne.mockResolvedValue(existingUser);
      await signup(req, res);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Este email já está em uso.' 
      });
      expect(bcrypt.genSalt).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should return 500 when database query fails', async () => {
      const dbError = new Error('Database connection failed');
      User.findOne.mockRejectedValue(dbError);
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Erro no servidor. Por favor, tente novamente mais tarde.' 
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Erro no controle de cadastro:',
        dbError
      );
      consoleLogSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    test('should handle null values in request body', async () => {
      req.body = {
        fullName: null,
        email: null,
        password: null
      };
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Por favor, preencha todos os campos.' 
      });
    });

    test('should handle special characters in fullName', async () => {
      req.body.fullName = "John O'Brien <script>alert('xss')</script>";
      User.findOne.mockResolvedValue(null);
      const mockNewUser = {
        _id: 'user123',
        fullName: req.body.fullName,
        save: jest.fn().mockResolvedValue({ _id: 'user123', fullName: req.body.fullName })
      };
      User.mockImplementation(() => mockNewUser);
      await signup(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Response Structure', () => {
    test('should not include password in response', async () => {
      User.findOne.mockResolvedValue(null);
      const mockNewUser = {
        _id: 'user123',
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'hashed-password',
        profilePic: '',
        save: jest.fn().mockResolvedValue({
          _id: 'user123',
          fullName: 'Test User',
          email: 'test@example.com',
          password: 'hashed-password',
          profilePic: ''
        })
      };
      User.mockImplementation(() => mockNewUser);
      await signup(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.not.objectContaining({ password: expect.anything() })
      );
    });
  });
});