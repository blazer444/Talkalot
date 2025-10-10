import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the resend module
const mockSend = jest.fn();
jest.unstable_mockModule('../../lib/resend.js', () => ({
  resendClient: {
    emails: {
      send: mockSend
    }
  },
  sender: {
    name: 'Test Sender',
    email: 'test@example.com'
  }
}));

// Import after mocking
const { sendWelcomeEmail } = await import('../../emails/emailHandlers.js');

describe('Email Handlers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.log and console.error mocks
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email successfully', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

      await sendWelcomeEmail('user@example.com', 'John Doe', 'https://example.com');

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: 'Bem vindo ao Talkalot\!',
          from: 'Test Sender <test@example.com>'
        })
      );
    });

    it('should include HTML content in email', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

      await sendWelcomeEmail('user@example.com', 'Jane Doe', 'https://example.com');

      const call = mockSend.mock.calls[0][0];
      expect(call.html).toBeDefined();
      expect(call.html).toContain('Jane Doe');
      expect(call.html).toContain('https://example.com');
    });

    it('should log success message when email is sent', async () => {
      const data = { id: 'email-456' };
      mockSend.mockResolvedValue({ data, error: null });

      await sendWelcomeEmail('user@example.com', 'John', 'https://example.com');

      expect(console.log).toHaveBeenCalledWith(
        'E-mail de boas-vindas enviado com sucesso:',
        data
      );
    });

    it('should throw error when email sending fails', async () => {
      const error = new Error('API Error');
      mockSend.mockResolvedValue({ data: null, error });

      await expect(
        sendWelcomeEmail('user@example.com', 'John', 'https://example.com')
      ).rejects.toThrow('Falha ao enviar e-mail de boas-vindas');
    });

    it('should log error when email sending fails', async () => {
      const error = new Error('API Error');
      mockSend.mockResolvedValue({ data: null, error });

      try {
        await sendWelcomeEmail('user@example.com', 'John', 'https://example.com');
      } catch (e) {
        // Expected to throw
      }

      expect(console.error).toHaveBeenCalledWith(
        'Erro ao enviar e-mail de boas-vindas'
      );
    });

    it('should handle different email addresses', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

      const emails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com',
        'user_name@sub.example.com'
      ];

      for (const email of emails) {
        await sendWelcomeEmail(email, 'User', 'https://example.com');
        expect(mockSend).toHaveBeenCalledWith(
          expect.objectContaining({ to: email })
        );
      }
    });

    it('should handle different user names', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

      const names = [
        'John Doe',
        'María García',
        "O'Brien",
        'User',
        'Jean-Pierre'
      ];

      for (const name of names) {
        mockSend.mockClear();
        await sendWelcomeEmail('user@example.com', name, 'https://example.com');
        
        const call = mockSend.mock.calls[0][0];
        expect(call.html).toContain(name);
      }
    });

    it('should handle different client URLs', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

      const urls = [
        'http://localhost:3000',
        'https://example.com',
        'https://app.example.com/dashboard',
        'https://example.com?ref=email'
      ];

      for (const url of urls) {
        mockSend.mockClear();
        await sendWelcomeEmail('user@example.com', 'User', url);
        
        const call = mockSend.mock.calls[0][0];
        expect(call.html).toContain(url);
      }
    });

    it('should handle API timeout errors', async () => {
      mockSend.mockResolvedValue({ 
        data: null, 
        error: new Error('Request timeout') 
      });

      await expect(
        sendWelcomeEmail('user@example.com', 'John', 'https://example.com')
      ).rejects.toThrow('Falha ao enviar e-mail de boas-vindas');
    });

    it('should handle network errors', async () => {
      mockSend.mockResolvedValue({ 
        data: null, 
        error: new Error('Network error') 
      });

      await expect(
        sendWelcomeEmail('user@example.com', 'John', 'https://example.com')
      ).rejects.toThrow();
    });

    it('should handle rate limit errors', async () => {
      mockSend.mockResolvedValue({ 
        data: null, 
        error: new Error('Rate limit exceeded') 
      });

      await expect(
        sendWelcomeEmail('user@example.com', 'John', 'https://example.com')
      ).rejects.toThrow();
    });

    it('should use correct sender format', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

      await sendWelcomeEmail('user@example.com', 'John', 'https://example.com');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Test Sender <test@example.com>'
        })
      );
    });

    it('should have correct subject line in Portuguese', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

      await sendWelcomeEmail('user@example.com', 'John', 'https://example.com');

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Bem vindo ao Talkalot\!'
        })
      );
    });

    it('should handle empty name parameter', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

      await sendWelcomeEmail('user@example.com', '', 'https://example.com');

      expect(mockSend).toHaveBeenCalled();
      const call = mockSend.mock.calls[0][0];
      expect(call.html).toBeDefined();
    });

    it('should handle special characters in parameters', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

      await sendWelcomeEmail(
        'user+test@example.com',
        "John O'Brien & Co.",
        'https://example.com?param=value&other=true'
      );

      expect(mockSend).toHaveBeenCalled();
    });

    it('should create valid HTML email structure', async () => {
      mockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null });

      await sendWelcomeEmail('user@example.com', 'John', 'https://example.com');

      const call = mockSend.mock.calls[0][0];
      expect(call.html).toContain('<\!DOCTYPE html>');
      expect(call.html).toContain('</html>');
    });
  });
});