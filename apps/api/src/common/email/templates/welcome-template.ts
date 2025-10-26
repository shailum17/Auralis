import { BaseEmailTemplate, EmailTemplate, EmailTemplateData } from './base-template';

export class WelcomeEmailTemplate extends BaseEmailTemplate {
  generate(data: EmailTemplateData): EmailTemplate {
    const { recipientName, otp } = data;
    const name = recipientName || 'there';

    const subject = `Welcome to ${this.brandName} - Verify Your Email`;

    const htmlContent = `
      <h2 class="title">🎉 Welcome to ${this.brandName}!</h2>
      <p class="message">
        Hi ${name},
      </p>
      <p class="message">
        Welcome to ${this.brandName}! We're excited to have you join our student community platform. 
        ${otp ? 'To get started and ensure the security of your account, please verify your email address using the code below.' : 'We\'re thrilled to have you as part of our community!'}
      </p>
      
      ${otp ? `
        <div class="otp-container">
          <p class="otp-label">Your verification code is:</p>
          <div class="otp-code">${otp}</div>
          <p class="otp-expiry">This code expires in 10 minutes</p>
        </div>
      ` : ''}
      
      <div class="success">
        <strong>What's Next?</strong><br>
        After verifying your email, you'll be able to:
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Complete your profile setup</li>
          <li>Connect with fellow students</li>
          <li>Access wellness resources</li>
          <li>Join study groups and discussions</li>
        </ul>
      </div>
      
      ${otp ? `
        <div class="warning">
          <strong>Security Note:</strong> Never share this verification code with anyone. 
          ${this.brandName} will never ask for your verification code via phone or other means.
        </div>
      ` : ''}
      
      <p class="message">
        If you have any questions or need assistance, don't hesitate to reach out to our support team at 
        <a href="mailto:${this.supportEmail}" style="color: ${this.primaryColor};">${this.supportEmail}</a>.
      </p>
      
      <p class="message">
        Welcome aboard!<br>
        The ${this.brandName} Team
      </p>
    `;

    const plainTextContent = `
Welcome to ${this.brandName}!

Hi ${name},

Welcome to ${this.brandName}! We're excited to have you join our student community platform.

${otp ? `Your verification code is: ${otp}
This code expires in 10 minutes.` : ''}

After verifying your email, you'll be able to:
- Complete your profile setup
- Connect with fellow students  
- Access wellness resources
- Join study groups and discussions

Security Note: Never share this verification code with anyone.

If you need assistance, contact us at ${this.supportEmail}.

Welcome aboard!
The ${this.brandName} Team
    `;

    return {
      subject,
      html: this.wrapTemplate(htmlContent),
      text: plainTextContent.trim()
    };
  }
}