# Email Configuration Troubleshooting Guide

## Current Issue
Emails are not being sent during registration. Users see OTP codes in the console instead of receiving them via email.

## Root Cause Analysis
The email service is not properly configured or the SMTP credentials are incorrect.

## Solution Steps

### 1. Gmail App Password Setup (REQUIRED)
For Gmail accounts, you CANNOT use your regular password. You MUST use an App Password:

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

2. **Generate App Password**
   - Go to Google Account > Security > App passwords
   - Select "Mail" as the app
   - Generate a 16-character password (like: `abcd efgh ijkl mnop`)
   - Copy this password (remove spaces)

3. **Update Environment Variables**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcdefghijklmnop  # App password without spaces
   ```

### 2. Test Email Configuration

1. **Visit Test Page**
   - Go to `http://localhost:3000/test-email`
   - Enter your email address
   - Click "Send Test Email"

2. **Check Debug Info**
   - Visit `http://localhost:3000/api/debug/email-config`
   - Verify all SMTP settings are configured

3. **Check Console Logs**
   - Look for detailed error messages
   - Authentication errors indicate wrong App Password
   - Connection errors indicate network/firewall issues

### 3. Alternative Email Providers

If Gmail doesn't work, try these alternatives:

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password  # Yahoo also requires App Password
```

### 4. Verification Steps

1. **Registration Flow**
   - Try registering a new account
   - Check if email is received
   - If not, check browser console for OTP

2. **Email Service Status**
   - Check console logs for email service initialization
   - Look for "Email service initialized successfully" message
   - If not present, check environment variables

3. **Network Connectivity**
   - Ensure port 587 is not blocked by firewall
   - Try different network if corporate firewall blocks SMTP

### 5. Fallback Behavior

The system has multiple fallback layers:

1. **Direct Email Service** (Primary)
   - Uses nodemailer directly from frontend
   - Configured via .env.local

2. **Backend API** (Secondary)
   - Falls back to backend email service
   - Requires backend server running

3. **Console Logging** (Tertiary)
   - Shows OTP in browser console
   - Development mode only

### 6. Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Authentication failed" | Wrong password | Use Gmail App Password |
| "Connection timeout" | Firewall/Network | Check port 587 access |
| "Email not configured" | Missing env vars | Set SMTP_* variables |
| "Service unavailable" | Backend not running | Start backend or use direct service |

### 7. Production Considerations

For production deployment:

1. **Use Professional Email Service**
   - SendGrid, AWS SES, Mailgun
   - Better deliverability and monitoring

2. **Environment Variables**
   - Set SMTP_* variables in production environment
   - Never commit credentials to code

3. **Rate Limiting**
   - Implement proper rate limiting for OTP requests
   - Prevent abuse and spam

## Testing Commands

```bash
# Test email configuration
curl -X GET http://localhost:3000/api/debug/email-config

# Send test email
curl -X POST http://localhost:3000/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'

# Request OTP (registration flow)
curl -X POST http://localhost:3000/api/auth/request-email-verification-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

## Current Status

✅ **Fixed Issues:**
- Added direct email service to frontend
- Created fallback system (direct → backend → console)
- Added comprehensive error logging
- Created test endpoints for debugging

⚠️ **Remaining Tasks:**
- Verify Gmail App Password is correctly set
- Test email delivery end-to-end
- Confirm registration flow works with real emails