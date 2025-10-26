export interface EmailTemplateData {
  recipientName?: string;
  recipientEmail: string;
  otp?: string;
  resetLink?: string;
  verificationLink?: string;
  companyName?: string;
  supportEmail?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class BaseEmailTemplate {
  protected readonly brandName = 'Auralis';
  protected readonly brandTagline = 'Student Community Platform';
  protected readonly supportEmail = 'support@auralis.com';
  protected readonly primaryColor = '#3b82f6';
  protected readonly secondaryColor = '#8b5cf6';

  protected getBaseStyles(): string {
    return `
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          display: inline-block;
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, ${this.primaryColor}, ${this.secondaryColor});
          border-radius: 8px;
          color: white;
          font-weight: bold;
          font-size: 24px;
          line-height: 48px;
          margin-bottom: 16px;
        }
        .brand {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }
        .tagline {
          color: #6b7280;
          margin: 0;
          font-size: 14px;
        }
        .content {
          margin: 30px 0;
        }
        .title {
          color: #1f2937;
          text-align: center;
          margin-bottom: 20px;
          font-size: 24px;
          font-weight: 600;
        }
        .message {
          font-size: 16px;
          color: #4b5563;
          margin-bottom: 20px;
          line-height: 1.6;
        }
        .otp-container {
          background: linear-gradient(135deg, #eff6ff, #f3e8ff);
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #1f2937;
          letter-spacing: 8px;
          margin: 20px 0;
          font-family: 'Courier New', monospace;
        }
        .otp-label {
          margin: 0;
          font-size: 18px;
          color: #4b5563;
        }
        .otp-expiry {
          margin: 0;
          font-size: 14px;
          color: #6b7280;
        }
        .warning {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          font-size: 14px;
          color: #92400e;
        }
        .success {
          background: #d1fae5;
          border: 1px solid #10b981;
          border-radius: 8px;
          padding: 16px;
          margin: 20px 0;
          font-size: 14px;
          color: #065f46;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, ${this.primaryColor}, ${this.secondaryColor});
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
        .footer-links {
          margin-top: 20px;
        }
        .footer-links a {
          color: ${this.primaryColor};
          text-decoration: none;
          margin: 0 10px;
        }
        .footer-links a:hover {
          text-decoration: underline;
        }
      </style>
    `;
  }

  protected getHeader(): string {
    return `
      <div class="header">
        <div class="logo">A</div>
        <h1 class="brand">${this.brandName}</h1>
        <p class="tagline">${this.brandTagline}</p>
      </div>
    `;
  }

  protected getFooter(): string {
    return `
      <div class="footer">
        <p>This email was sent by ${this.brandName} ${this.brandTagline}.</p>
        <p>If you didn't request this, please ignore this email or contact our support team.</p>
        <div class="footer-links">
          <a href="#" style="color: ${this.primaryColor};">Visit ${this.brandName}</a> |
          <a href="mailto:${this.supportEmail}" style="color: ${this.primaryColor};">Support</a> |
          <a href="#" style="color: ${this.primaryColor};">Privacy Policy</a>
        </div>
      </div>
    `;
  }

  protected wrapTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.brandName} - Email Notification</title>
        ${this.getBaseStyles()}
      </head>
      <body>
        <div class="container">
          ${this.getHeader()}
          <div class="content">
            ${content}
          </div>
          ${this.getFooter()}
        </div>
      </body>
      </html>
    `;
  }

  protected generatePlainText(content: string): string {
    // Strip HTML tags and format for plain text
    return content
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\n\s*\n/g, '\n\n');
  }
}