import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock dependencies
const mockSave = jest.fn();
const mockFindOne = jest.fn();
const mockGenerateToken = jest.fn();
const mockSendWelcomeEmail = jest.fn();
const mockHash = jest.fn();
const mockGenSalt = jest.fn();

jest.unstable_mockModule('../../models/User.js', () => ({
  default: class MockUser {
    constructor(data) {
      this._id = 'mock-user-id-123';
      this.fullName = data.fullName;
      this.email = data.email;
      this.password = data.password;
      this.profilePic = data.profilePic || '';
    }
    save = mockSave;
    static findOne = mockFindOne;
  }
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    genSalt: mockGenSalt,
    hash: mockHash
  }
}));

jest.unstable_mockModule('../../lib/utils.js', () => ({
  default: mockGenerateToken
}));

jest.unstable_mockModule('../../emails/emailHandlers.js', () => ({
  sendWelcomeEmail: mockSendWelcomeEmail
}));

jest.unstable_mockModule('../../lib/env.js', () => ({
  ENV: {
    CLIENT_URL: 'http://localhost:5173'
  }
}));

const { signup } = await import('../../controllers/auth.controller.js');

describe('Auth Controller - signup', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    jest.clearAllMocks();
    mockSave.mockResolvedValue({
      _id: 'mock-user-id-123',
      fullName: 'Test User',
      email: 'test@example.com',
      profilePic: ''
    });
    mockFindOne.mockResolvedValue(null);
    mockGenSalt.mockResolvedValue('mock-salt');
    mockHash.mockResolvedValue('hashed-password-123');
    mockGenerateToken.mockReturnValue('mock-token-123');
    mockSendWelcomeEmail.mockResolvedValue(undefined);

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Validation - Required fields', () => {
    it('should return 400 if fullName is missing', async () => {
      mockReq.body = { email: 'test@example.com', password: 'password123' };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Por favor, preencha todos os campos.'
      });
    });

    it('should return 400 if email is missing', async () => {
      mockReq.body = { fullName: 'John Doe', password: 'password123' };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Por favor, preencha todos os campos.'
      });
    });

    it('should return 400 if password is missing', async () => {
      mockReq.body = { fullName: 'John Doe', email: 'test@example.com' };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Por favor, preencha todos os campos.'
      });
    });

    it('should return 400 if all fields are missing', async () => {
      mockReq.body = {};

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Por favor, preencha todos os campos.'
      });
    });

    it('should return 400 if fields are empty strings', async () => {
      mockReq.body = { fullName: '', email: '', password: '' };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Validation - Password length', () => {
    it('should return 400 if password is less than 6 characters', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: '12345'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'A senha deve ter pelo menos 6 caracteres.'
      });
    });

    it('should accept password with exactly 6 characters', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: '123456'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should accept password with more than 6 characters', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123456'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Validation - Email format', () => {
    it('should return 400 for invalid email format', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Por favor, insira um email válido.'
      });
    });

    it('should return 400 for email without domain', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 for email without @', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'testexample.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'user_name@sub.example.com'
      ];

      for (const email of validEmails) {
        mockReq.body = {
          fullName: 'John Doe',
          email,
          password: 'password123'
        };

        await signup(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(201);
        mockRes.status.mockClear();
        mockRes.json.mockClear();
      }
    });
  });

  describe('User existence check', () => {
    it('should return 400 if email already exists', async () => {
      mockFindOne.mockResolvedValue({ email: 'existing@example.com' });
      
      mockReq.body = {
        fullName: 'John Doe',
        email: 'existing@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Este email já está em uso.'
      });
      expect(mockFindOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
    });

    it('should proceed if email does not exist', async () => {
      mockFindOne.mockResolvedValue(null);
      
      mockReq.body = {
        fullName: 'John Doe',
        email: 'new@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Password hashing', () => {
    it('should hash password before saving', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'plainPassword123'
      };

      await signup(mockReq, mockRes);

      expect(mockGenSalt).toHaveBeenCalledWith(10);
      expect(mockHash).toHaveBeenCalledWith('plainPassword123', 'mock-salt');
    });

    it('should not save plain password', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'plainPassword123'
      };

      await signup(mockReq, mockRes);

      expect(mockSave).toHaveBeenCalled();
      // The password should be hashed, not plain
      expect(mockHash).toHaveBeenCalled();
    });
  });

  describe('User creation', () => {
    it('should create user with correct data', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockSave).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should return user data without password', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: expect.any(String),
          fullName: 'John Doe',
          email: 'test@example.com',
          profilePic: expect.any(String)
        })
      );
      
      const response = mockRes.json.mock.calls[0][0];
      expect(response).not.toHaveProperty('password');
    });

    it('should generate JWT token for new user', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockGenerateToken).toHaveBeenCalledWith(
        'mock-user-id-123',
        mockRes
      );
    });
  });

  describe('Welcome email', () => {
    it('should send welcome email after successful signup', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockSendWelcomeEmail).toHaveBeenCalledWith(
        'test@example.com',
        'John Doe',
        'http://localhost:5173'
      );
    });

    it('should not fail signup if email sending fails', async () => {
      mockSendWelcomeEmail.mockRejectedValue(new Error('Email service down'));
      
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(console.error).toHaveBeenCalledWith(
        'Erro ao enviar e-mail de boas-vindas:',
        expect.any(Error)
      );
    });

    it('should log error when email fails but continue', async () => {
      const emailError = new Error('SMTP error');
      mockSendWelcomeEmail.mockRejectedValue(emailError);
      
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(console.error).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Error handling', () => {
    it('should return 500 on database error', async () => {
      mockFindOne.mockRejectedValue(new Error('Database connection failed'));
      
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Erro no servidor. Por favor, tente novamente mais tarde.'
      });
    });

    it('should log error on server failure', async () => {
      const error = new Error('Server error');
      mockFindOne.mockRejectedValue(error);
      
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(console.log).toHaveBeenCalledWith(
        'Erro no controle de cadastro:',
        error
      );
    });

    it('should handle bcrypt hashing errors', async () => {
      mockHash.mockRejectedValue(new Error('Hashing failed'));
      
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should handle user save errors', async () => {
      mockSave.mockRejectedValue(new Error('Save failed'));
      
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long names', async () => {
      mockReq.body = {
        fullName: 'A'.repeat(200),
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle names with special characters', async () => {
      mockReq.body = {
        fullName: "O'Brien-Smith & Co.",
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle international characters in names', async () => {
      mockReq.body = {
        fullName: 'José María González',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle very long passwords', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'a'.repeat(1000)
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle passwords with special characters', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'P@$$w0rd\!@#$%^&*()'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should trim whitespace in validation properly', async () => {
      mockReq.body = {
        fullName: '  ',
        email: '  ',
        password: '  '
      };

      await signup(mockReq, mockRes);

      // Should fail because trimmed values are empty
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Response format', () => {
    it('should return JSON response on success', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalled();
      const response = mockRes.json.mock.calls[0][0];
      expect(response).toHaveProperty('_id');
      expect(response).toHaveProperty('fullName');
      expect(response).toHaveProperty('email');
      expect(response).toHaveProperty('profilePic');
    });

    it('should return status 201 on successful creation', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should include profilePic field in response', async () => {
      mockReq.body = {
        fullName: 'John Doe',
        email: 'test@example.com',
        password: 'password123'
      };

      await signup(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];
      expect(response).toHaveProperty('profilePic');
    });
  });
});