import { WelcomeEmailTemplate } from '../welcome-template';
import { OTPEmailTemplate, OTPType } from '../otp-template';
import { PasswordResetEmailTemplate } from '../password-reset-template';
import { EmailTemplateFactory } from '../index';

describe('Email Templates', () => {
  describe('WelcomeEmailTemplate', () => {
    let template: WelcomeEmailTemplate;

    beforeEach(() => {
      template = new WelcomeEmailTemplate();
    });

    it('should generate welcome email with OTP', () => {
      const result = template.generate({
        recipientEmail: 'test@example.com',
        recipientName: 'John Doe',
        otp: '123456'
      });

      expect(result.subject).toContain('Welcome to Auralis');
      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('123456');
      expect(result.html).toContain('verification code');
      expect(result.text).toContain('John Doe');
      expect(result.text).toContain('123456');
    });

    it('should generate welcome email without OTP', () => {
      const result = template.generate({
        recipientEmail: 'test@example.com',
        recipientName: 'Jane Smith'
      });

      expect(result.subject).toContain('Welcome to Auralis');
      expect(result.html).toContain('Jane Smith');
      expect(result.html).not.toContain('verification code');
      expect(result.text).toContain('Jane Smith');
    });

    it('should handle missing recipient name', () => {
      const result = template.generate({
        recipientEmail: 'test@example.com',
        otp: '123456'
      });

      expect(result.html).toContain('Hi there');
      expect(result.text).toContain('Hi there');
    });

    it('should include security warnings', () => {
      const result = template.generate({
        recipientEmail: 'test@example.com',
        otp: '123456'
      });

      expect(result.html).toContain('Security Note');
      expect(result.html).toContain('Never share');
      expect(result.text).toContain('Never share');
    });
  });

  describe('OTPEmailTemplate', () => {
    let template: OTPEmailTemplate;

    beforeEach(() => {
      template = new OTPEmailTemplate();
    });

    it('should generate email verification OTP email', () => {
      const result = template.generate({
        recipientEmail: 'test@example.com',
        recipientName: 'John Doe',
        otp: '123456',
        otpType: 'EMAIL_VERIFICATION'
      });

      expect(result.subject).toContain('Email Verification Code');
      expect(result.html).toContain('Verify Your Email Address');
      expect(result.html).toContain('123456');
      expect(result.html).toContain('10 minutes');
      expect(result.text).toContain('123456');
    });

    it('should generate login OTP email', () => {
      const result = template.generate({
        recipientEmail: 'test@example.com',
        recipientName: 'John Doe',
        otp: '654321',
        otpType: 'LOGIN'
      });

      expect(result.subject).toContain('Login Verification Code');
      expect(result.html).toContain('Your Login Code');
      expect(result.html).toContain('654321');
      expect(result.html).toContain('Security Alert');
      expect(result.text).toContain('654321');
    });

    it('should generate password login OTP email', () => {
      const result = template.generate({
        recipientEmail: 'test@example.com',
        recipientName: 'John Doe',
        otp: '789012',
        otpType: 'PASSWORD_LOGIN'
      });

      expect(result.subject).toContain('Additional Security Verification');
      expect(result.html).toContain('Secure Login Verification');
      expect(result.html).toContain('789012');
      expect(result.html).toContain('5 minutes');
      expect(result.html).toContain('Enhanced Security');
      expect(result.text).toContain('789012');
    });

    it('should generate password reset OTP email', () => {
      const result = template.generate({
        recipientEmail: 'test@example.com',
        recipientName: 'John Doe',
        otp: '345678',
        otpType: 'PASSWORD_RESET'
      });

      expect(result.subject).toContain('Password Reset Code');
      expect(result.html).toContain('Reset Your Password');
      expect(result.html).toContain('345678');
      expect(result.html).toContain('10 minutes');
      expect(result.text).toContain('345678');
    });

    it('should handle missing recipient name', () => {
      const result = template.generate({
        recipientEmail: 'test@example.com',
        otp: '123456',
        otpType: 'LOGIN'
      });

      expect(result.html).toContain('Hi there');
      expect(result.text).toContain('Hi there');
    });

    it('should include appropriate security warnings for each type', () => {
      const types: OTPType[] = ['EMAIL_VERIFICATION', 'LOGIN', 'PASSWORD_LOGIN', 'PASSWORD_RESET'];
      
      types.forEach(type => {
        const result = template.generate({
          recipientEmail: 'test@example.com',
          otp: '123456',
          otpType: type
        });

        expect(result.html).toContain('Security');
        expect(result.html).toContain('Never share');
        expect(result.text).toContain('Security');
      });
    });
  });

  describe('PasswordResetEmailTemplate', () => {
    let template: PasswordResetEmailTemplate;

    beforeEach(() => {
      template = new PasswordResetEmailTemplate();
    });

    it('should generate password reset email with OTP', () => {
      const result = template.generate({
        recipientEmail: 'test@example.com',
        recipientName: 'John Doe',
        otp: '123456'
      });

      expect(result.subject).toContain('Reset Your Password');
      expect(result.html).toContain('Password Reset Request');
      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('123456');
      expect(result.html).toContain('10 minutes');
      expect(result.text).toContain('123456');
    });

    it('should generate password reset email with reset link', () => {
      const resetLink = 'https://example.com/reset?token=abc123';
      const result = template.generate({
        recipientEmail: 'test@example.com',
        recipientName: 'John Doe',
        resetLink
      });

      expect(result.html).toContain('Reset Your Password');
      expect(result.html).toContain(resetLink);
      expect(result.text).toContain(resetLink);
    });

    it('should generate password reset email with both OTP and link', () => {
      const resetLink = 'https://example.com/reset?token=abc123';
      const result = template.generate({
        recipientEmail: 'test@example.com',
        recipientName: 'John Doe',
        otp: '123456',
        resetLink
      });

      expect(result.html).toContain('123456');
      expect(result.html).toContain(resetLink);
      expect(result.text).toContain('123456');
      expect(result.text).toContain(resetLink);
    });

    it('should include security information and tips', () => {
      const result = template.generate({
        recipientEmail: 'test@example.com',
        otp: '123456'
      });

      expect(result.html).toContain('Security Information');
      expect(result.html).toContain('Password Security Tips');
      expect(result.html).toContain('unique password');
      expect(result.html).toContain('8 characters');
      expect(result.text).toContain('Security Information');
      expect(result.text).toContain('Password Security Tips');
    });

    it('should handle missing recipient name', () => {
      const result = template.generate({
        recipientEmail: 'test@example.com',
        otp: '123456'
      });

      expect(result.html).toContain('Hi there');
      expect(result.text).toContain('Hi there');
    });
  });

  describe('EmailTemplateFactory', () => {
    it('should create welcome template', () => {
      const template = EmailTemplateFactory.createWelcomeTemplate();
      expect(template).toBeInstanceOf(WelcomeEmailTemplate);
    });

    it('should create OTP template', () => {
      const template = EmailTemplateFactory.createOTPTemplate();
      expect(template).toBeInstanceOf(OTPEmailTemplate);
    });

    it('should create password reset template', () => {
      const template = EmailTemplateFactory.createPasswordResetTemplate();
      expect(template).toBeInstanceOf(PasswordResetEmailTemplate);
    });
  });

  describe('Template Content Validation', () => {
    it('should generate valid HTML structure', () => {
      const template = new WelcomeEmailTemplate();
      const result = template.generate({
        recipientEmail: 'test@example.com',
        otp: '123456'
      });

      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('<html lang="en">');
      expect(result.html).toContain('<head>');
      expect(result.html).toContain('<body>');
      expect(result.html).toContain('</html>');
    });

    it('should include proper meta tags', () => {
      const template = new OTPEmailTemplate();
      const result = template.generate({
        recipientEmail: 'test@example.com',
        otp: '123456',
        otpType: 'LOGIN'
      });

      expect(result.html).toContain('<meta charset="UTF-8">');
      expect(result.html).toContain('<meta name="viewport"');
    });

    it('should include CSS styles', () => {
      const template = new PasswordResetEmailTemplate();
      const result = template.generate({
        recipientEmail: 'test@example.com',
        otp: '123456'
      });

      expect(result.html).toContain('<style>');
      expect(result.html).toContain('font-family');
      expect(result.html).toContain('background');
    });

    it('should generate readable plain text', () => {
      const template = new WelcomeEmailTemplate();
      const result = template.generate({
        recipientEmail: 'test@example.com',
        recipientName: 'John Doe',
        otp: '123456'
      });

      expect(result.text).not.toContain('<');
      expect(result.text).not.toContain('>');
      expect(result.text).toContain('John Doe');
      expect(result.text).toContain('123456');
      expect(result.text.length).toBeGreaterThan(100);
    });
  });
});