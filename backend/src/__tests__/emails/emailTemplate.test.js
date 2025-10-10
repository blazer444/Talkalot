import { describe, it, expect } from '@jest/globals';
import { createWelcomeEmailTemplate } from '../../emails/emailTemplate.js';

describe('Email Template Generation', () => {
  describe('createWelcomeEmailTemplate', () => {
    it('should generate valid HTML template with name and URL', () => {
      const name = 'John Doe';
      const clientURL = 'https://example.com';

      const html = createWelcomeEmailTemplate(name, clientURL);

      expect(html).toContain('John Doe');
      expect(html).toContain('https://example.com');
      expect(html).toContain('<\!DOCTYPE html>');
      expect(html).toContain('</html>');
    });

    it('should include all required HTML elements', () => {
      const html = createWelcomeEmailTemplate('User', 'http://localhost:5173');

      expect(html).toContain('<html');
      expect(html).toContain('<head>');
      expect(html).toContain('<body');
      expect(html).toContain('<title>');
      expect(html).toContain('</body>');
      expect(html).toContain('</html>');
    });

    it('should include Talkalot branding', () => {
      const html = createWelcomeEmailTemplate('User', 'http://localhost:5173');

      expect(html).toContain('Talkalot');
      expect(html).toContain('Bem-vindo ao Talkalot\!');
    });

    it('should include Portuguese content', () => {
      const html = createWelcomeEmailTemplate('User', 'http://localhost:5173');

      expect(html).toContain('pt-br');
      expect(html).toContain('Olá');
      expect(html).toContain('Estamos felizes');
    });

    it('should include call-to-action button with correct URL', () => {
      const clientURL = 'https://talkalot.com';
      const html = createWelcomeEmailTemplate('User', clientURL);

      expect(html).toContain(clientURL);
      expect(html).toContain('Abrir Talkalot');
      expect(html).toContain('<a href=');
    });

    it('should handle names with special characters', () => {
      const name = "José O'Brien-Smith";
      const html = createWelcomeEmailTemplate(name, 'http://localhost:5173');

      expect(html).toContain("José O'Brien-Smith");
    });

    it('should handle names with accented characters', () => {
      const name = 'María José González';
      const html = createWelcomeEmailTemplate(name, 'http://localhost:5173');

      expect(html).toContain('María José González');
    });

    it('should handle very long names', () => {
      const name = 'Alexander Christopher Emmanuel Wellington Montgomery III';
      const html = createWelcomeEmailTemplate(name, 'http://localhost:5173');

      expect(html).toContain(name);
    });

    it('should handle single character names', () => {
      const name = 'A';
      const html = createWelcomeEmailTemplate(name, 'http://localhost:5173');

      expect(html).toContain('Olá A,');
    });

    it('should handle empty name gracefully', () => {
      const name = '';
      const html = createWelcomeEmailTemplate(name, 'http://localhost:5173');

      expect(html).toContain('Olá ,');
      expect(html).toBeDefined();
    });

    it('should handle various URL formats', () => {
      const urls = [
        'http://localhost:3000',
        'https://example.com',
        'https://subdomain.example.com',
        'https://example.com:8080',
        'https://example.com/path/to/page',
      ];

      urls.forEach(url => {
        const html = createWelcomeEmailTemplate('User', url);
        expect(html).toContain(url);
      });
    });

    it('should include getting started steps', () => {
      const html = createWelcomeEmailTemplate('User', 'http://localhost:5173');

      expect(html).toContain('Configure sua foto de perfil');
      expect(html).toContain('Encontre e adicione seus contatos');
      expect(html).toContain('Inicie uma conversa');
      expect(html).toContain('Compartilhe fotos');
    });

    it('should include footer with copyright', () => {
      const html = createWelcomeEmailTemplate('User', 'http://localhost:5173');

      expect(html).toContain('© 2025 Talkalot');
      expect(html).toContain('Todos os Direitos Reservados');
    });

    it('should include footer links', () => {
      const html = createWelcomeEmailTemplate('User', 'http://localhost:5173');

      expect(html).toContain('Política de Privacidade');
      expect(html).toContain('Termos de Serviço');
      expect(html).toContain('Contate-nos');
    });

    it('should include logo/icon image', () => {
      const html = createWelcomeEmailTemplate('User', 'http://localhost:5173');

      expect(html).toContain('<img');
      expect(html).toContain('src=');
      expect(html).toContain('alt=');
    });

    it('should use inline CSS styles', () => {
      const html = createWelcomeEmailTemplate('User', 'http://localhost:5173');

      expect(html).toContain('style=');
      expect(html).toContain('font-family');
      expect(html).toContain('color');
      expect(html).toContain('background');
    });

    it('should include meta viewport for responsive design', () => {
      const html = createWelcomeEmailTemplate('User', 'http://localhost:5173');

      expect(html).toContain('viewport');
      expect(html).toContain('width=device-width');
    });

    it('should have proper charset declaration', () => {
      const html = createWelcomeEmailTemplate('User', 'http://localhost:5173');

      expect(html).toContain('charset="UTF-8"');
    });

    it('should handle URL with query parameters', () => {
      const clientURL = 'https://example.com?ref=email&campaign=welcome';
      const html = createWelcomeEmailTemplate('User', clientURL);

      expect(html).toContain(clientURL);
    });

    it('should handle URL with hash fragments', () => {
      const clientURL = 'https://example.com#welcome';
      const html = createWelcomeEmailTemplate('User', clientURL);

      expect(html).toContain(clientURL);
    });

    it('should generate different content for different users', () => {
      const html1 = createWelcomeEmailTemplate('Alice', 'http://localhost:5173');
      const html2 = createWelcomeEmailTemplate('Bob', 'http://localhost:5173');

      expect(html1).toContain('Alice');
      expect(html2).toContain('Bob');
      expect(html1).not.toContain('Bob');
      expect(html2).not.toContain('Alice');
    });

    it('should maintain consistent structure across different inputs', () => {
      const names = ['User A', 'User B', 'User C'];
      const htmls = names.map(name => 
        createWelcomeEmailTemplate(name, 'http://localhost:5173')
      );

      htmls.forEach(html => {
        expect(html).toContain('<\!DOCTYPE html>');
        expect(html).toContain('Talkalot');
        expect(html).toContain('Abrir Talkalot');
      });
    });

    it('should not include script tags for security', () => {
      const html = createWelcomeEmailTemplate('User', 'http://localhost:5173');

      expect(html).not.toContain('<script');
      expect(html).not.toContain('</script>');
    });

    it('should use safe HTML structure', () => {
      const html = createWelcomeEmailTemplate('User', 'http://localhost:5173');

      // Should not have unmatched tags
      const openDivs = (html.match(/<div/g) || []).length;
      const closeDivs = (html.match(/<\/div>/g) || []).length;
      expect(openDivs).toBe(closeDivs);
    });
  });
});