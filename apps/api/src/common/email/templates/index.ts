export { BaseEmailTemplate, EmailTemplate, EmailTemplateData } from './base-template';
export { WelcomeEmailTemplate } from './welcome-template';
export { OTPEmailTemplate, OTPType } from './otp-template';
export { PasswordResetEmailTemplate } from './password-reset-template';

import { WelcomeEmailTemplate } from './welcome-template';
import { OTPEmailTemplate } from './otp-template';
import { PasswordResetEmailTemplate } from './password-reset-template';

// Template factory for easy template creation
export class EmailTemplateFactory {
  static createWelcomeTemplate(): WelcomeEmailTemplate {
    return new WelcomeEmailTemplate();
  }

  static createOTPTemplate(): OTPEmailTemplate {
    return new OTPEmailTemplate();
  }

  static createPasswordResetTemplate(): PasswordResetEmailTemplate {
    return new PasswordResetEmailTemplate();
  }
}