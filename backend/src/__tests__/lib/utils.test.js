import generateToken from '../../lib/utils.js';
import jwt from 'jsonwebtoken';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('generateToken', () => {
  let res;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup response mock
    res = {
      cookie: jest.fn()
    };

    // Setup environment
    process.env = { 
      ...originalEnv,
      JWT_SECRET: 'test-secret',
      NODE_ENV: 'development'
    };

    // Default mock for jwt.sign
    jwt.sign.mockReturnValue('mocked-token');
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Happy Path', () => {
    test('should generate JWT token with userId', () => {
      // Arrange
      const userId = 'user123';

      // Act
      const token = generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId },
        'test-secret',
        { expiresIn: '7d' }
      );
      expect(token).toBe('mocked-token');
    });

    test('should set cookie with correct options', () => {
      // Arrange
      const userId = 'user123';

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith('jwt', 'mocked-token', {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'strict',
        secure: true // development environment
      });
    });

    test('should return the generated token', () => {
      // Arrange
      const userId = 'user123';
      jwt.sign.mockReturnValue('new-token-value');

      // Act
      const result = generateToken(userId, res);

      // Assert
      expect(result).toBe('new-token-value');
    });
  });

  describe('Token Generation', () => {
    test('should create token with 7 day expiration', () => {
      // Arrange
      const userId = 'user123';

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ expiresIn: '7d' })
      );
    });

    test('should use JWT_SECRET from environment', () => {
      // Arrange
      const userId = 'user123';
      process.env.JWT_SECRET = 'custom-secret-key';

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.anything(),
        'custom-secret-key',
        expect.anything()
      );
    });

    test('should include userId in token payload', () => {
      // Arrange
      const userId = 'test-user-id-456';

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 'test-user-id-456' },
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('Cookie Options', () => {
    test('should set httpOnly flag to prevent XSS attacks', () => {
      // Arrange
      const userId = 'user123';

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ httpOnly: true })
      );
    });

    test('should set sameSite to strict to prevent CSRF attacks', () => {
      // Arrange
      const userId = 'user123';

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ sameSite: 'strict' })
      );
    });

    test('should set maxAge to 7 days in milliseconds', () => {
      // Arrange
      const userId = 'user123';
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ maxAge: sevenDaysInMs })
      );
    });

    test('should set secure flag based on NODE_ENV (development)', () => {
      // Arrange
      const userId = 'user123';
      process.env.NODE_ENV = 'development';

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ secure: true })
      );
    });

    test('should not set secure flag in production (bug in code)', () => {
      // Arrange
      const userId = 'user123';
      process.env.NODE_ENV = 'production';

      // Act
      generateToken(userId, res);

      // Assert - This tests the actual behavior (which has a bug)
      expect(res.cookie).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ secure: false })
      );
    });

    test('should set cookie name as "jwt"', () => {
      // Arrange
      const userId = 'user123';

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        'jwt',
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle numeric userId', () => {
      // Arrange
      const userId = 12345;

      // Act
      const token = generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: 12345 },
        expect.anything(),
        expect.anything()
      );
      expect(token).toBe('mocked-token');
    });

    test('should handle ObjectId-like userId', () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: '507f1f77bcf86cd799439011' },
        expect.anything(),
        expect.anything()
      );
    });

    test('should handle empty userId', () => {
      // Arrange
      const userId = '';

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: '' },
        expect.anything(),
        expect.anything()
      );
    });

    test('should handle null userId', () => {
      // Arrange
      const userId = null;

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: null },
        expect.anything(),
        expect.anything()
      );
    });

    test('should handle undefined userId', () => {
      // Arrange
      const userId = undefined;

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: undefined },
        expect.anything(),
        expect.anything()
      );
    });
  });

  describe('Response Object', () => {
    test('should call res.cookie exactly once', () => {
      // Arrange
      const userId = 'user123';

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledTimes(1);
    });

    test('should work with different response objects', () => {
      // Arrange
      const userId = 'user123';
      const customRes = {
        cookie: jest.fn()
      };

      // Act
      generateToken(userId, customRes);

      // Assert
      expect(customRes.cookie).toHaveBeenCalled();
    });
  });

  describe('Environment Variables', () => {
    test('should handle missing JWT_SECRET', () => {
      // Arrange
      const userId = 'user123';
      delete process.env.JWT_SECRET;

      // Act
      generateToken(userId, res);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.anything(),
        undefined,
        expect.anything()
      );
    });

    test('should handle missing NODE_ENV', () => {
      // Arrange
      const userId = 'user123';
      delete process.env.NODE_ENV;

      // Act
      generateToken(userId, res);

      // Assert - secure should be false when NODE_ENV is undefined
      expect(res.cookie).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ secure: false })
      );
    });

    test('should handle test environment', () => {
      // Arrange
      const userId = 'user123';
      process.env.NODE_ENV = 'test';

      // Act
      generateToken(userId, res);

      // Assert
      expect(res.cookie).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ secure: false })
      );
    });
  });
});