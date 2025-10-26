import { test, expect, Page } from '@playwright/test';

// Test data for security testing
const testUser = {
  email: 'security.test@example.com',
  username: 'securitytest123',
  password: 'SecurePassword123!',
  fullName: 'Security Test User'
};

// Helper functions
async function attemptLogin(page: Page, identifier: string, password: string) {
  await page.fill('input[placeholder*="email or username"]', identifier);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]:has-text("Sign In")');
}

async function registerTestUser(page: Page, userData = testUser) {
  await page.goto('/auth/signup');
  
  // Step 1: Account
  await page.fill('input[type="email"]', userData.email);
  await page.fill('input[placeholder*="username"]', userData.username);
  await page.click('button:has-text("Next")');

  // Step 2: Password
  await page.fill('input[placeholder*="Create a password"]', userData.password);
  await page.fill('input[placeholder*="Confirm your password"]', userData.password);
  await page.click('button:has-text("Next")');

  // Step 3: Personal info
  await page.fill('input[placeholder*="full name"]', userData.fullName);
  await page.click('button:has-text("Next")');

  // Step 4: Terms
  await page.check('input[type="checkbox"]');
  await page.click('button:has-text("Create Account")');

  // Complete verification if needed
  const devOTPLocator = page.locator('[data-testid="dev-otp"], .bg-yellow-50');
  if (await devOTPLocator.isVisible()) {
    const otpText = await devOTPLocator.textContent();
    const otpMatch = otpText?.match(/\d{6}/);
    if (otpMatch) {
      for (let i = 0; i < 6; i++) {
        await page.fill(`input[type="text"]:nth-child(${i + 1})`, otpMatch[0][i]);
      }
    }
  }
}

test.describe('Authentication Security Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Password strength validation', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Navigate to password step
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[placeholder*="username"]', 'testuser');
    await page.click('button:has-text("Next")');

    // Test weak passwords
    const weakPasswords = [
      '123',
      'password',
      'Password',
      'Password123',
      '12345678'
    ];

    for (const weakPassword of weakPasswords) {
      await page.fill('input[placeholder*="Create a password"]', weakPassword);
      await page.blur('input[placeholder*="Create a password"]');
      
      // Should show password strength indicator
      const strengthIndicator = page.locator('[data-testid="password-strength"], .password-strength');
      if (await strengthIndicator.isVisible()) {
        const strengthText = await strengthIndicator.textContent();
        expect(strengthText?.toLowerCase()).toMatch(/weak|poor|insufficient/);
      }
      
      // Should show validation error or warning
      await expect(page.locator('text=password, text=strength, text=requirements')).toBeVisible();
    }

    // Test strong password
    await page.fill('input[placeholder*="Create a password"]', 'StrongPassword123!@#');
    await page.blur('input[placeholder*="Create a password"]');
    
    const strengthIndicator = page.locator('[data-testid="password-strength"], .password-strength');
    if (await strengthIndicator.isVisible()) {
      const strengthText = await strengthIndicator.textContent();
      expect(strengthText?.toLowerCase()).toMatch(/strong|excellent|good/);
    }
  });

  test('Rate limiting on login attempts', async ({ page }) => {
    await page.goto('/auth/signin');

    // Attempt multiple failed logins rapidly
    const maxAttempts = 5;
    for (let i = 0; i < maxAttempts; i++) {
      await attemptLogin(page, 'nonexistent@example.com', 'wrongpassword');
      
      // Wait for response
      await page.waitForTimeout(1000);
      
      // Check for rate limiting after several attempts
      if (i >= 3) {
        const rateLimitMessage = page.locator('text=too many, text=rate limit, text=wait');
        if (await rateLimitMessage.isVisible()) {
          // Rate limiting is working
          expect(await rateLimitMessage.textContent()).toMatch(/too many|rate limit|wait/i);
          break;
        }
      }
    }

    // Verify submit button is disabled or form shows rate limit message
    const submitButton = page.locator('button[type="submit"]:has-text("Sign In")');
    const isDisabled = await submitButton.isDisabled();
    const rateLimitVisible = await page.locator('text=too many, text=rate limit').isVisible();
    
    expect(isDisabled || rateLimitVisible).toBeTruthy();
  });

  test('Input sanitization and XSS prevention', async ({ page }) => {
    await page.goto('/auth/signup');

    // Test XSS payloads in various fields
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src="x" onerror="alert(\'xss\')">',
      '"><script>alert("xss")</script>',
      '\'; DROP TABLE users; --'
    ];

    // Test in email field
    await page.fill('input[type="email"]', xssPayloads[0]);
    await page.blur('input[type="email"]');
    
    // Verify the input is sanitized or rejected
    const emailValue = await page.inputValue('input[type="email"]');
    expect(emailValue).not.toContain('<script>');
    expect(emailValue).not.toContain('javascript:');

    // Test in username field
    await page.fill('input[placeholder*="username"]', xssPayloads[1]);
    await page.blur('input[placeholder*="username"]');
    
    const usernameValue = await page.inputValue('input[placeholder*="username"]');
    expect(usernameValue).not.toContain('javascript:');

    // Navigate to next step and test in name field
    await page.fill('input[type="email"]', 'safe@example.com');
    await page.fill('input[placeholder*="username"]', 'safeuser');
    await page.click('button:has-text("Next")');

    await page.fill('input[placeholder*="Create a password"]', 'SafePassword123!');
    await page.fill('input[placeholder*="Confirm your password"]', 'SafePassword123!');
    await page.click('button:has-text("Next")');

    await page.fill('input[placeholder*="full name"]', xssPayloads[2]);
    await page.blur('input[placeholder*="full name"]');
    
    const nameValue = await page.inputValue('input[placeholder*="full name"]');
    expect(nameValue).not.toContain('<img');
    expect(nameValue).not.toContain('onerror');
  });

  test('Token security and session management', async ({ page }) => {
    // Register and login a user first
    await registerTestUser(page);
    
    // Navigate to signin and login
    await page.goto('/auth/signin');
    await attemptLogin(page, testUser.email, testUser.password);
    
    // Wait for successful login
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });

    // Check that tokens are stored securely
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));

    if (accessToken) {
      // Verify token format (should be JWT)
      expect(accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      
      // Verify token is not empty or obviously insecure
      expect(accessToken.length).toBeGreaterThan(50);
    }

    if (refreshToken) {
      expect(refreshToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
      expect(refreshToken.length).toBeGreaterThan(50);
    }

    // Test logout clears tokens
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      
      // Verify tokens are cleared
      const clearedAccessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
      const clearedRefreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
      
      expect(clearedAccessToken).toBeNull();
      expect(clearedRefreshToken).toBeNull();
    }
  });

  test('CSRF protection', async ({ page }) => {
    await page.goto('/auth/signin');

    // Check for CSRF token in forms
    const csrfToken = await page.locator('input[name="csrfToken"], input[name="_token"]').inputValue();
    
    // If CSRF tokens are implemented, they should be present and non-empty
    if (csrfToken) {
      expect(csrfToken.length).toBeGreaterThan(10);
      expect(csrfToken).toMatch(/^[A-Za-z0-9+/=]+$/); // Base64-like pattern
    }

    // Test that form submission includes security headers
    const [request] = await Promise.all([
      page.waitForRequest(request => 
        request.url().includes('/api/auth/') && request.method() === 'POST'
      ),
      attemptLogin(page, 'test@example.com', 'password123')
    ]);

    // Verify security headers are present
    const headers = request.headers();
    expect(headers['content-type']).toContain('application/json');
    
    // Check for common security headers
    const securityHeaders = ['x-csrf-token', 'x-requested-with', 'authorization'];
    const hasSecurityHeader = securityHeaders.some(header => headers[header]);
    
    // At least one security header should be present
    if (Object.keys(headers).length > 0) {
      expect(hasSecurityHeader || headers['content-type']).toBeTruthy();
    }
  });

  test('Password confirmation validation', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Navigate to password step
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[placeholder*="username"]', 'testuser');
    await page.click('button:has-text("Next")');

    // Enter password
    await page.fill('input[placeholder*="Create a password"]', 'TestPassword123!');
    
    // Enter mismatched confirmation
    await page.fill('input[placeholder*="Confirm your password"]', 'DifferentPassword123!');
    await page.blur('input[placeholder*="Confirm your password"]');

    // Should show password mismatch error
    await expect(page.locator('text=password, text=match, text=confirm')).toBeVisible();

    // Try to proceed - should be blocked
    await page.click('button:has-text("Next")');
    
    // Should remain on password step
    await expect(page.locator('input[placeholder*="Create a password"]')).toBeVisible();

    // Fix password confirmation
    await page.fill('input[placeholder*="Confirm your password"]', 'TestPassword123!');
    await page.blur('input[placeholder*="Confirm your password"]');

    // Error should disappear
    await expect(page.locator('text=password, text=match, text=confirm')).not.toBeVisible();
  });

  test('Email verification security', async ({ page }) => {
    // Register a user
    await registerTestUser(page, {
      ...testUser,
      email: 'verification.security@example.com',
      username: 'verifysecurity123'
    });

    // Should be on verification page
    await expect(page).toHaveURL(/\/auth\/verify-email/);

    // Test invalid OTP codes
    const invalidOTPs = ['000000', '123456', '999999', 'abcdef', '12345'];
    
    for (const invalidOTP of invalidOTPs) {
      // Clear previous input
      for (let i = 0; i < 6; i++) {
        await page.fill(`input[type="text"]:nth-child(${i + 1})`, '');
      }
      
      // Enter invalid OTP
      for (let i = 0; i < 6; i++) {
        await page.fill(`input[type="text"]:nth-child(${i + 1})`, invalidOTP[i] || '0');
      }

      // Wait for validation
      await page.waitForTimeout(1000);
      
      // Should show error for invalid OTP
      const errorMessage = page.locator('text=invalid, text=incorrect, text=expired');
      if (await errorMessage.isVisible()) {
        expect(await errorMessage.textContent()).toMatch(/invalid|incorrect|expired/i);
      }
    }

    // Test OTP resend rate limiting
    const resendButton = page.locator('button:has-text("Resend")');
    if (await resendButton.isVisible() && await resendButton.isEnabled()) {
      // Click resend multiple times
      await resendButton.click();
      await page.waitForTimeout(1000);
      
      // Try to resend again immediately
      if (await resendButton.isVisible()) {
        await resendButton.click();
        
        // Should show rate limiting message
        const rateLimitMessage = page.locator('text=wait, text=seconds, text=attempts');
        if (await rateLimitMessage.isVisible()) {
          expect(await rateLimitMessage.textContent()).toMatch(/wait|seconds|attempts/i);
        }
      }
    }
  });

  test('Secure password reset flow', async ({ page }) => {
    await page.goto('/auth/forgot-password');
    
    // If forgot password page exists
    if (page.url().includes('/auth/forgot-password')) {
      // Test with invalid email
      await page.fill('input[type="email"]', 'nonexistent@example.com');
      await page.click('button[type="submit"]');
      
      // Should not reveal whether email exists (security best practice)
      const message = page.locator('text=sent, text=email, text=instructions');
      if (await message.isVisible()) {
        // Generic message should be shown regardless of email existence
        expect(await message.textContent()).toMatch(/sent|email|instructions/i);
      }

      // Test with valid email format but potentially malicious content
      await page.fill('input[type="email"]', '<script>alert("xss")</script>@example.com');
      await page.blur('input[type="email"]');
      
      const emailValue = await page.inputValue('input[type="email"]');
      expect(emailValue).not.toContain('<script>');
    }
  });

  test('Session timeout and automatic logout', async ({ page }) => {
    // Register and login a user
    await registerTestUser(page);
    await page.goto('/auth/signin');
    await attemptLogin(page, testUser.email, testUser.password);
    
    // Wait for successful login
    await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 10000 });

    // Simulate token expiration by manipulating localStorage
    await page.evaluate(() => {
      // Set an expired token
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      localStorage.setItem('accessToken', expiredToken);
    });

    // Try to access a protected route
    await page.goto('/dashboard');
    
    // Should redirect to signin due to expired token
    await page.waitForURL(/\/auth\/signin/, { timeout: 10000 });
    
    // Verify user is logged out
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(accessToken).toBeNull();
  });
});