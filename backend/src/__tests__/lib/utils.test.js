import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import jwt from 'jsonwebtoken';

describe('Utils - generateToken', () => {
  let originalEnv;
  let mockResponse;

  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.NODE_ENV = 'development';
    
    // Mock response object
    mockResponse = {
      cookie: jest.fn()
    };
    
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Token generation', () => {
    it('should generate valid JWT token', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      const userId = '12345';

      const token = generateToken(userId, mockResponse);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, 'test-secret-key');
      expect(decoded.userId).toBe(userId);
    });

    it('should include userId in token payload', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      const userId = 'user-abc-123';

      const token = generateToken(userId, mockResponse);
      const decoded = jwt.decode(token);

      expect(decoded.userId).toBe(userId);
    });

    it('should set token expiration to 7 days', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      const userId = '12345';

      const token = generateToken(userId, mockResponse);
      const decoded = jwt.decode(token);

      const expiresIn = decoded.exp - decoded.iat;
      expect(expiresIn).toBe(7 * 24 * 60 * 60); // 7 days in seconds
    });

    it('should use JWT_SECRET from ENV', async () => {
      process.env.JWT_SECRET = 'custom-secret-123';
      jest.resetModules();
      
      const { default: generateToken } = await import('../../lib/utils.js');
      const userId = '12345';

      const token = generateToken(userId, mockResponse);
      
      // Should be able to verify with the custom secret
      const decoded = jwt.verify(token, 'custom-secret-123');
      expect(decoded.userId).toBe(userId);
    });

    it('should handle different userId formats', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      const userIds = [
        '12345',
        'abc-def-123',
        'user_12345',
        'ObjectId(507f1f77bcf86cd799439011)'
      ];

      userIds.forEach(userId => {
        const token = generateToken(userId, mockResponse);
        const decoded = jwt.decode(token);
        expect(decoded.userId).toBe(userId);
      });
    });
  });

  describe('Cookie setting', () => {
    it('should set JWT cookie on response', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      const userId = '12345';

      generateToken(userId, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledTimes(1);
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'jwt',
        expect.any(String),
        expect.any(Object)
      );
    });

    it('should set cookie with correct name "jwt"', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      generateToken('12345', mockResponse);

      const cookieName = mockResponse.cookie.mock.calls[0][0];
      expect(cookieName).toBe('jwt');
    });

    it('should set httpOnly flag to prevent XSS', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      generateToken('12345', mockResponse);

      const cookieOptions = mockResponse.cookie.mock.calls[0][2];
      expect(cookieOptions.httpOnly).toBe(true);
    });

    it('should set sameSite to strict to prevent CSRF', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      generateToken('12345', mockResponse);

      const cookieOptions = mockResponse.cookie.mock.calls[0][2];
      expect(cookieOptions.sameSite).toBe('strict');
    });

    it('should set maxAge to 7 days in milliseconds', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      generateToken('12345', mockResponse);

      const cookieOptions = mockResponse.cookie.mock.calls[0][2];
      const expectedMaxAge = 7 * 24 * 60 * 60 * 1000;
      expect(cookieOptions.maxAge).toBe(expectedMaxAge);
    });

    it('should set secure flag based on NODE_ENV', async () => {
      process.env.NODE_ENV = 'development';
      jest.resetModules();
      
      const { default: generateToken } = await import('../../lib/utils.js');
      
      generateToken('12345', mockResponse);

      const cookieOptions = mockResponse.cookie.mock.calls[0][2];
      expect(cookieOptions.secure).toBe(true);
    });

    it('should handle production environment for secure flag', async () => {
      process.env.NODE_ENV = 'production';
      jest.resetModules();
      
      const { default: generateToken } = await import('../../lib/utils.js');
      
      generateToken('12345', mockResponse);

      const cookieOptions = mockResponse.cookie.mock.calls[0][2];
      expect(cookieOptions.secure).toBe(false);
    });
  });

  describe('Return value', () => {
    it('should return the generated token', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      const userId = '12345';

      const token = generateToken(userId, mockResponse);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should return different tokens for different users', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');

      const token1 = generateToken('user1', mockResponse);
      const token2 = generateToken('user2', mockResponse);

      expect(token1).not.toBe(token2);
    });

    it('should return different tokens on successive calls', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      const userId = '12345';

      // Wait a bit to ensure different iat (issued at) timestamps
      const token1 = generateToken(userId, mockResponse);
      await new Promise(resolve => setTimeout(resolve, 1100));
      const token2 = generateToken(userId, mockResponse);

      expect(token1).not.toBe(token2);
    });
  });

  describe('Edge cases', () => {
    it('should handle numeric userId', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      const token = generateToken(12345, mockResponse);
      const decoded = jwt.decode(token);

      expect(decoded.userId).toBe(12345);
    });

    it('should handle empty string userId', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      const token = generateToken('', mockResponse);
      const decoded = jwt.decode(token);

      expect(decoded.userId).toBe('');
    });

    it('should handle null userId', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      const token = generateToken(null, mockResponse);
      const decoded = jwt.decode(token);

      expect(decoded.userId).toBe(null);
    });

    it('should handle undefined userId', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      const token = generateToken(undefined, mockResponse);
      const decoded = jwt.decode(token);

      expect(decoded.userId).toBeUndefined();
    });

    it('should handle response object without cookie method', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      const badResponse = {};

      expect(() => {
        generateToken('12345', badResponse);
      }).toThrow();
    });

    it('should work with different JWT secrets', async () => {
      const secrets = ['secret1', 'secret2', 'secret3'];

      for (const secret of secrets) {
        process.env.JWT_SECRET = secret;
        jest.resetModules();
        
        const { default: generateToken } = await import('../../lib/utils.js');
        const token = generateToken('user', mockResponse);
        
        const decoded = jwt.verify(token, secret);
        expect(decoded.userId).toBe('user');
      }
    });
  });

  describe('Security considerations', () => {
    it('should not expose JWT_SECRET in token', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      const token = generateToken('12345', mockResponse);
      const decoded = jwt.decode(token);

      expect(JSON.stringify(decoded)).not.toContain('test-secret-key');
    });

    it('should create token that expires', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      const token = generateToken('12345', mockResponse);
      const decoded = jwt.decode(token);

      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });

    it('should set httpOnly to prevent client-side JS access', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      generateToken('12345', mockResponse);

      const cookieOptions = mockResponse.cookie.mock.calls[0][2];
      expect(cookieOptions.httpOnly).toBe(true);
    });

    it('should set sameSite strict to prevent CSRF attacks', async () => {
      const { default: generateToken } = await import('../../lib/utils.js');
      
      generateToken('12345', mockResponse);

      const cookieOptions = mockResponse.cookie.mock.calls[0][2];
      expect(cookieOptions.sameSite).toBe('strict');
    });
  });
});