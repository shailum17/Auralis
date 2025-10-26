import { BaseEmailTemplate, EmailTemplate, EmailTemplateData } from './base-template';

export class PasswordResetEmailTemplate extends BaseEmailTemplate {
  generate(data: EmailTemplateData): EmailTemplate {
    const { recipientName, otp, resetLink } = data;
    const name = recipientName || 'there';

    const subject = `Reset Your Password - ${this.brandName}`;

    const htmlContent = `
      <h2 class="title">🔑 Password Reset Request</h2>
      <p class="message">
        Hi ${name},
      </p>
      <p class="message">
        We received a request to reset the password for your ${this.brandName} account. 
        If you made this request, please use the verification code below to proceed with resetting your password.
      </p>
      
      ${otp ? `
        <div class="otp-container">
          <p class="otp-label">Your password reset code is:</p>
          <div class="otp-code">${otp}</div>
          <p class="otp-expiry">This code expires in 10 minutes</p>
        </div>
      ` : ''}
      
      ${resetLink ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" class="button">Reset Your Password</a>
        </div>
        <p class="message" style="text-align: center; font-size: 14px; color: #6b7280;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetLink}" style="color: ${this.primaryColor}; word-break: break-all;">${resetLink}</a>
        </p>
      ` : ''}
      
      <div class="warning">
        <strong>Security Information:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>This password reset request was made from your account</li>
          <li>The verification code will expire in 10 minutes for security</li>
          <li>Never share this code with anyone</li>
          <li>If you didn't request this reset, you can safely ignore this email</li>
        </ul>
      </div>
      
      <div class="success">
        <strong>Password Security Tips:</strong>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Use a unique password that you don't use elsewhere</li>
          <li>Include uppercase and lowercase letters, numbers, and symbols</li>
          <li>Make it at least 8 characters long</li>
          <li>Consider using a password manager</li>
        </ul>
      </div>
      
      <p class="message">
        If you continue to have trouble accessing your account, please contact our support team at 
        <a href="mailto:${this.supportEmail}" style="color: ${this.primaryColor};">${this.supportEmail}</a>.
      </p>
      
      <p class="message">
        Best regards,<br>
        The ${this.brandName} Security Team
      </p>
    `;

    const plainTextContent = `
Password Reset Request

Hi ${name},

We received a request to reset the password for your ${this.brandName} account.

${otp ? `Your password reset code is: ${otp}
This code expires in 10 minutes.` : ''}

${resetLink ? `You can also reset your password using this link:
${resetLink}` : ''}

Security Information:
- This password reset request was made from your account
- The verification code will expire in 10 minutes for security
- Never share this code with anyone
- If you didn't request this reset, you can safely ignore this email

Password Security Tips:
- Use a unique password that you don't use elsewhere
- Include uppercase and lowercase letters, numbers, and symbols
- Make it at least 8 characters long
- Consider using a password manager

If you need help, contact us at ${this.supportEmail}.

Best regards,
The ${this.brandName} Security Team
    `;

    return {
      subject,
      html: this.wrapTemplate(htmlContent),
      text: plainTextContent.trim()
    };
  }
}