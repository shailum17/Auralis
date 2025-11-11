# Newsletter Module

This module handles newsletter subscriptions for the Auralis platform.

## Setup

1. **Generate Prisma Client** (after schema changes):
   ```bash
   cd apps/api
   npx prisma generate
   ```

2. **Push schema to database** (for MongoDB):
   ```bash
   npx prisma db push
   ```

## API Endpoints

### Subscribe to Newsletter
- **POST** `/newsletter/subscribe`
- **Body**: `{ "email": "user@example.com" }`
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Successfully subscribed to newsletter! Check your email for confirmation.",
    "data": {
      "email": "user@example.com",
      "subscribedAt": "2024-11-11T..."
    }
  }
  ```

### Unsubscribe from Newsletter
- **POST** `/newsletter/unsubscribe`
- **Body**: `{ "email": "user@example.com", "token": "unsubscribe_token" }`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Successfully unsubscribed from newsletter"
  }
  ```

## Email Integration

Currently, the email sending is stubbed out with console logs. To integrate with a real email service:

1. Choose an email service provider:
   - **SendGrid** - Popular, easy to use
   - **AWS SES** - Cost-effective for high volume
   - **Resend** - Modern, developer-friendly
   - **Mailgun** - Reliable, good deliverability

2. Update the `sendWelcomeEmail` and `sendGoodbyeEmail` methods in `newsletter.service.ts`

3. Example with SendGrid:
   ```typescript
   import sgMail from '@sendgrid/mail';
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   
   private async sendWelcomeEmail(email: string) {
     const msg = {
       to: email,
       from: 'newsletter@auralis.com',
       subject: 'Welcome to Auralis Newsletter!',
       html: '<strong>Welcome to our community!</strong>',
     };
     
     await sgMail.send(msg);
   }
   ```

## Database Schema

The `NewsletterSubscription` model includes:
- `email` - Unique email address
- `unsubscribeToken` - Secure token for unsubscribing
- `isActive` - Whether subscription is active
- `subscribedAt` - Timestamp of subscription
- `unsubscribedAt` - Timestamp of unsubscription (if applicable)

## Testing

You can test the API using curl:

```bash
# Subscribe
curl -X POST http://localhost:3001/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Unsubscribe
curl -X POST http://localhost:3001/newsletter/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","token":"your_token_here"}'
```
