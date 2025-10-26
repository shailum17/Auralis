import { BaseEmailTemplate, EmailTemplate, EmailTemplateData } from './base-template';

export type OTPType = 'EMAIL_VERIFICATION' | 'LOGIN' | 'PASSWORD_LOGIN' | 'PASSWORD_RESET';

export class OTPEmailTemplate extends BaseEmailTemplate {
  generate(data: EmailTemplateData & { otpType: OTPType }): EmailTemplate {
    const { recipientName, otp, otpType } = data;
    const name = recipientName || 'there';

    const config = this.getOTPConfig(otpType);
    
    const subject = `${config.subject} - ${this.brandName}`;

    const htmlContent = `
      <h2 class="title">${config.icon} ${config.title}</h2>
      <p class="message">
        Hi ${name},
      </p>
      <p class="message">
        ${config.description}
      </p>
      
      <div class="otp-container">
        <p class="otp-label">${config.codeLabel}:</p>
        <div class="otp-code">${otp}</div>
        <p class="otp-expiry">This code expires in ${config.expiryMinutes} minutes</p>
      </div>
      
      <div class="${config.alertType}">
        <strong>${config.alertTitle}:</strong> ${config.alertMessage}
      </div>
      
      ${config.additionalInfo ? `
        <p class="message">
          ${config.additionalInfo}
        </p>
      ` : ''}
      
      <p class="message">
        If you didn't request this code, please ignore this email or contact our support team immediately.
      </p>
    `;

    const plainTextContent = `
${config.title}

Hi ${name},

${config.description}

${config.codeLabel}: ${otp}
This code expires in ${config.expiryMinutes} minutes.

${config.alertTitle}: ${config.alertMessage}

${config.additionalInfo || ''}

If you didn't request this code, please ignore this email or contact support.

The ${this.brandName} Team
    `;

    return {
      subject,
      html: this.wrapTemplate(htmlContent),
      text: plainTextContent.trim()
    };
  }

  private getOTPConfig(otpType: OTPType) {
    switch (otpType) {
      case 'EMAIL_VERIFICATION':
        return {
          icon: '✉️',
          title: 'Verify Your Email Address',
          subject: 'Email Verification Code',
          description: 'Please use the verification code below to confirm your email address and activate your account.',
          codeLabel: 'Your verification code is',
          expiryMinutes: 10,
          alertType: 'warning',
          alertTitle: 'Security Note',
          alertMessage: `Never share this code with anyone. ${this.brandName} will never ask for your verification code via phone or email.`,
          additionalInfo: null
        };

      case 'LOGIN':
        return {
          icon: '🔐',
          title: 'Your Login Code',
          subject: 'Login Verification Code',
          description: 'You requested to sign in to your account. Use the code below to complete your login.',
          codeLabel: 'Your login code is',
          expiryMinutes: 10,
          alertType: 'warning',
          alertTitle: 'Security Alert',
          alertMessage: 'If you didn\'t request this login code, someone may be trying to access your account. Never share this code with anyone and secure your account immediately.',
          additionalInfo: null
        };

      case 'PASSWORD_LOGIN':
        return {
          icon: '🛡️',
          title: 'Secure Login Verification',
          subject: 'Additional Security Verification',
          description: 'Your password has been verified successfully! For additional security, please use the verification code below to complete your login.',
          codeLabel: 'Your security verification code is',
          expiryMinutes: 5,
          alertType: 'success',
          alertTitle: 'Enhanced Security',
          alertMessage: 'This extra step helps protect your account from unauthorized access. Never share this code with anyone.',
          additionalInfo: 'This verification is part of our enhanced security measures to keep your account safe.'
        };

      case 'PASSWORD_RESET':
        return {
          icon: '🔑',
          title: 'Reset Your Password',
          subject: 'Password Reset Code',
          description: 'You requested to reset your password. Use the code below to proceed with creating a new password.',
          codeLabel: 'Your password reset code is',
          expiryMinutes: 10,
          alertType: 'warning',
          alertTitle: 'Security Note',
          alertMessage: 'If you didn\'t request a password reset, please ignore this email and consider securing your account. Never share this code with anyone.',
          additionalInfo: 'After entering this code, you\'ll be able to create a new secure password for your account.'
        };

      default:
        return {
          icon: '🔐',
          title: 'Verification Code',
          subject: 'Verification Code',
          description: 'Here\'s your verification code.',
          codeLabel: 'Your verification code is',
          expiryMinutes: 10,
          alertType: 'warning',
          alertTitle: 'Security Note',
          alertMessage: 'Keep this code secure and don\'t share it with anyone.',
          additionalInfo: null
        };
    }
  }
}