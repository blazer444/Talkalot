import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('ENV Configuration', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original env
    originalEnv = { ...process.env };
    
    // Clear module cache to force reimport
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('ENV object structure', () => {
    it('should export ENV object with all required properties', async () => {
      process.env.PORT = '3000';
      process.env.MONGO_URI = 'mongodb://localhost:27017/test';
      process.env.JWT_SECRET = 'test-secret';
      process.env.NODE_ENV = 'test';
      process.env.CLIENT_URL = 'http://localhost:5173';
      process.env.RESEND_API_KEY = 'test-key';
      process.env.EMAIL_FROM = 'test@example.com';
      process.env.EMAIL_FROM_NAME = 'Test Sender';

      const { ENV } = await import('../../lib/env.js');

      expect(ENV).toBeDefined();
      expect(ENV).toHaveProperty('PORT');
      expect(ENV).toHaveProperty('MONGO_URI');
      expect(ENV).toHaveProperty('JWT_SECRET');
      expect(ENV).toHaveProperty('NODE_ENV');
      expect(ENV).toHaveProperty('CLIENT_URL');
      expect(ENV).toHaveProperty('RESEND_API_KEY');
      expect(ENV).toHaveProperty('EMAIL_FROM');
      expect(ENV).toHaveProperty('EMAIL_FROM_NAME');
    });

    it('should correctly map environment variables to ENV properties', async () => {
      process.env.PORT = '5000';
      process.env.MONGO_URI = 'mongodb://test-host:27017/testdb';
      process.env.JWT_SECRET = 'super-secret-jwt';
      process.env.NODE_ENV = 'production';
      process.env.CLIENT_URL = 'https://example.com';
      process.env.RESEND_API_KEY = 'resend-api-key-123';
      process.env.EMAIL_FROM = 'noreply@example.com';
      process.env.EMAIL_FROM_NAME = 'Example App';

      const { ENV } = await import('../../lib/env.js');

      expect(ENV.PORT).toBe('5000');
      expect(ENV.MONGO_URI).toBe('mongodb://test-host:27017/testdb');
      expect(ENV.JWT_SECRET).toBe('super-secret-jwt');
      expect(ENV.NODE_ENV).toBe('production');
      expect(ENV.CLIENT_URL).toBe('https://example.com');
      expect(ENV.RESEND_API_KEY).toBe('resend-api-key-123');
      expect(ENV.EMAIL_FROM).toBe('noreply@example.com');
      expect(ENV.EMAIL_FROM_NAME).toBe('Example App');
    });

    it('should handle missing environment variables gracefully', async () => {
      // Clear all relevant env vars
      delete process.env.PORT;
      delete process.env.MONGO_URI;
      delete process.env.JWT_SECRET;
      delete process.env.NODE_ENV;
      delete process.env.CLIENT_URL;
      delete process.env.RESEND_API_KEY;
      delete process.env.EMAIL_FROM;
      delete process.env.EMAIL_FROM_NAME;

      const { ENV } = await import('../../lib/env.js');

      expect(ENV.PORT).toBeUndefined();
      expect(ENV.MONGO_URI).toBeUndefined();
      expect(ENV.JWT_SECRET).toBeUndefined();
      expect(ENV.NODE_ENV).toBeUndefined();
      expect(ENV.CLIENT_URL).toBeUndefined();
      expect(ENV.RESEND_API_KEY).toBeUndefined();
      expect(ENV.EMAIL_FROM).toBeUndefined();
      expect(ENV.EMAIL_FROM_NAME).toBeUndefined();
    });

    it('should handle empty string environment variables', async () => {
      process.env.PORT = '';
      process.env.MONGO_URI = '';
      process.env.JWT_SECRET = '';

      const { ENV } = await import('../../lib/env.js');

      expect(ENV.PORT).toBe('');
      expect(ENV.MONGO_URI).toBe('');
      expect(ENV.JWT_SECRET).toBe('');
    });

    it('should handle environment variables with special characters', async () => {
      process.env.JWT_SECRET = 'secret\!@#$%^&*()_+-={}[]|:;"<>,.?/~`';
      process.env.MONGO_URI = 'mongodb://user:p@$$w0rd@localhost:27017/db';

      const { ENV } = await import('../../lib/env.js');

      expect(ENV.JWT_SECRET).toBe('secret\!@#$%^&*()_+-={}[]|:;"<>,.?/~`');
      expect(ENV.MONGO_URI).toBe('mongodb://user:p@$$w0rd@localhost:27017/db');
    });
  });

  describe('Different environment scenarios', () => {
    it('should work in development environment', async () => {
      process.env.NODE_ENV = 'development';
      process.env.PORT = '3000';

      const { ENV } = await import('../../lib/env.js');

      expect(ENV.NODE_ENV).toBe('development');
      expect(ENV.PORT).toBe('3000');
    });

    it('should work in production environment', async () => {
      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';

      const { ENV } = await import('../../lib/env.js');

      expect(ENV.NODE_ENV).toBe('production');
      expect(ENV.PORT).toBe('8080');
    });

    it('should work in test environment', async () => {
      process.env.NODE_ENV = 'test';
      process.env.MONGO_URI = 'mongodb://localhost:27017/test';

      const { ENV } = await import('../../lib/env.js');

      expect(ENV.NODE_ENV).toBe('test');
      expect(ENV.MONGO_URI).toBe('mongodb://localhost:27017/test');
    });
  });

  describe('Type handling', () => {
    it('should preserve string values from environment', async () => {
      process.env.PORT = '3000';
      
      const { ENV } = await import('../../lib/env.js');

      expect(typeof ENV.PORT).toBe('string');
      expect(ENV.PORT).toBe('3000');
    });

    it('should not convert numeric strings to numbers', async () => {
      process.env.PORT = '5000';
      
      const { ENV } = await import('../../lib/env.js');

      expect(ENV.PORT).toBe('5000');
      expect(ENV.PORT).not.toBe(5000);
    });
  });
});