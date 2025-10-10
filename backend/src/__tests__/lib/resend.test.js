import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('Resend Client Configuration', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('resendClient initialization', () => {
    it('should create Resend client with API key from ENV', async () => {
      process.env.RESEND_API_KEY = 'test-api-key-123';
      
      const { resendClient } = await import('../../lib/resend.js');

      expect(resendClient).toBeDefined();
      expect(resendClient).toHaveProperty('emails');
    });

    it('should create Resend client with different API keys', async () => {
      process.env.RESEND_API_KEY = 're_different_key_456';
      
      const { resendClient } = await import('../../lib/resend.js');

      expect(resendClient).toBeDefined();
    });

    it('should handle undefined API key', async () => {
      delete process.env.RESEND_API_KEY;
      
      const { resendClient } = await import('../../lib/resend.js');

      expect(resendClient).toBeDefined();
    });

    it('should handle empty string API key', async () => {
      process.env.RESEND_API_KEY = '';
      
      const { resendClient } = await import('../../lib/resend.js');

      expect(resendClient).toBeDefined();
    });
  });

  describe('sender configuration', () => {
    it('should export sender object with email and name from ENV', async () => {
      process.env.EMAIL_FROM = 'test@example.com';
      process.env.EMAIL_FROM_NAME = 'Test Sender';
      
      const { sender } = await import('../../lib/resend.js');

      expect(sender).toBeDefined();
      expect(sender).toHaveProperty('email', 'test@example.com');
      expect(sender).toHaveProperty('name', 'Test Sender');
    });

    it('should handle different sender configurations', async () => {
      process.env.EMAIL_FROM = 'noreply@talkalot.com';
      process.env.EMAIL_FROM_NAME = 'Talkalot Team';
      
      const { sender } = await import('../../lib/resend.js');

      expect(sender.email).toBe('noreply@talkalot.com');
      expect(sender.name).toBe('Talkalot Team');
    });

    it('should handle missing email configuration', async () => {
      delete process.env.EMAIL_FROM;
      delete process.env.EMAIL_FROM_NAME;
      
      const { sender } = await import('../../lib/resend.js');

      expect(sender.email).toBeUndefined();
      expect(sender.name).toBeUndefined();
    });

    it('should handle empty email configuration', async () => {
      process.env.EMAIL_FROM = '';
      process.env.EMAIL_FROM_NAME = '';
      
      const { sender } = await import('../../lib/resend.js');

      expect(sender.email).toBe('');
      expect(sender.name).toBe('');
    });

    it('should handle special characters in sender name', async () => {
      process.env.EMAIL_FROM = 'team@company.com';
      process.env.EMAIL_FROM_NAME = 'Company™ Team & Support';
      
      const { sender } = await import('../../lib/resend.js');

      expect(sender.name).toBe('Company™ Team & Support');
    });

    it('should handle international characters in sender name', async () => {
      process.env.EMAIL_FROM = 'equipe@exemple.fr';
      process.env.EMAIL_FROM_NAME = 'Équipe Française';
      
      const { sender } = await import('../../lib/resend.js');

      expect(sender.name).toBe('Équipe Française');
    });
  });

  describe('Module exports', () => {
    it('should export both resendClient and sender', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      process.env.EMAIL_FROM = 'test@test.com';
      process.env.EMAIL_FROM_NAME = 'Test';
      
      const module = await import('../../lib/resend.js');

      expect(module).toHaveProperty('resendClient');
      expect(module).toHaveProperty('sender');
    });

    it('should have correct property types', async () => {
      process.env.RESEND_API_KEY = 'test-key';
      process.env.EMAIL_FROM = 'test@test.com';
      process.env.EMAIL_FROM_NAME = 'Test';
      
      const { resendClient, sender } = await import('../../lib/resend.js');

      expect(typeof resendClient).toBe('object');
      expect(typeof sender).toBe('object');
      expect(typeof sender.email).toBe('string');
      expect(typeof sender.name).toBe('string');
    });
  });
});