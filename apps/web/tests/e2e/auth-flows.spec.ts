import { test, expect, Page } from '@playwright/test';

// Test data
const testUser = {
  email: 'test.user@example.com',
  username: 'testuser123',
  password: 'TestPassword123!',
  fullName: 'Test User',
  bio: 'This is a test user bio for e2e testing'
};

// Helper functions
async function fillRegistrationForm(page: Page, userData = testUser) {
  // Step 1: Account information
  await page.fill('input[type="email"]', userData.email);
  await page.fill('input[placeholder*="username"]', userData.username);
  await page.click('button:has-text("Next")');

  // Step 2: Password
  await page.fill('input[placeholder*="Create a password"]', userData.password);
  await page.fill('input[placeholder*="Confirm your password"]', userData.password);
  await page.click('button:has-text("Next")');

  // Step 3: Personal info
  await page.fill('input[placeholder*="full name"]', userData.fullName);
  await page.fill('textarea[placeholder*="Tell us"]', userData.bio);
  await page.click('button:has-text("Next")');

  // Step 4: Terms and conditions
  await page.check('input[type="checkbox"]');
  await page.click('button:has-text("Create Account")');
}

async function fillOTPCode(page: Page, otp: string) {
  // Fill OTP inputs
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[type="text"]:nth-child(${i + 1})`, otp[i]);
  }
}

async function completeOnboarding(page: Page) {
  // Step 1: Personal Info (should be pre-filled from registration)
  await page.click('button:has-text("Next")');

  // Step 2: Academic Info (optional - skip)
  await page.click('button:has-text("Skip")');

  // Step 3: Interests (optional - skip)
  await page.click('button:has-text("Skip")');

  // Step 4: Privacy Settings (required - use defaults)
  await page.click('button:has-text("Next")');

  // Step 5: Wellness Settings (optional - complete setup)
  await page.click('button:has-text("Complete Setup")');
}

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Complete registration to dashboard flow', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/auth/signup');
    await expect(page).toHaveTitle(/Sign Up|Create Account/);

    // Fill registration form
    await fillRegistrationForm(page);

    // Should redirect to email verification
    await expect(page).toHaveURL(/\/auth\/verify-email/);
    await expect(page.locator('h1')).toContainText('Verify Your Email');

    // Check for development OTP display
    const devOTPLocator = page.locator('[data-testid="dev-otp"], .bg-yellow-50');
    if (await devOTPLocator.isVisible()) {
      const otpText = await devOTPLocator.textContent();
      const otpMatch = otpText?.match(/\d{6}/);
      if (otpMatch) {
        await fillOTPCode(page, otpMatch[0]);
      }
    } else {
      // Use a test OTP if no dev OTP is shown
      await fillOTPCode(page, '123456');
    }

    // Should show verification success and redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });
    await expect(page.locator('h1')).toContainText(/Welcome|Onboarding/);

    // Complete onboarding flow
    await completeOnboarding(page);

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.locator('h1, h2')).toContainText(/Dashboard|Welcome/);
  });

  test('Sign in with email', async ({ page }) => {
    // First, register a user (assuming registration works)
    await page.goto('/auth/signup');
    await fillRegistrationForm(page);
    
    // Complete verification and onboarding quickly
    await page.goto('/auth/verify-email');
    const devOTPLocator = page.locator('[data-testid="dev-otp"], .bg-yellow-50');
    if (await devOTPLocator.isVisible()) {
      const otpText = await devOTPLocator.textContent();
      const otpMatch = otpText?.match(/\d{6}/);
      if (otpMatch) {
        await fillOTPCode(page, otpMatch[0]);
      }
    }
    
    await page.goto('/onboarding');
    await completeOnboarding(page);

    // Now test sign in
    await page.goto('/auth/signin');
    await expect(page).toHaveTitle(/Sign In|Login/);

    // Fill sign in form with email
    await page.fill('input[placeholder*="email or username"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.locator('h1, h2')).toContainText(/Dashboard|Welcome/);
  });

  test('Sign in with username', async ({ page }) => {
    // Assuming user is already registered from previous test
    await page.goto('/auth/signin');

    // Fill sign in form with username
    await page.fill('input[placeholder*="email or username"]', testUser.username);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Should redirect to dashboard or show verification prompt
    await page.waitForURL(/\/(dashboard|auth\/verify-email)/, { timeout: 10000 });
    
    if (page.url().includes('/auth/verify-email')) {
      // Handle verification if needed
      const devOTPLocator = page.locator('[data-testid="dev-otp"], .bg-yellow-50');
      if (await devOTPLocator.isVisible()) {
        const otpText = await devOTPLocator.textContent();
        const otpMatch = otpText?.match(/\d{6}/);
        if (otpMatch) {
          await fillOTPCode(page, otpMatch[0]);
        }
      }
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    }
  });

  test('Email verification flow', async ({ page }) => {
    // Register a new user
    await page.goto('/auth/signup');
    await fillRegistrationForm(page, {
      ...testUser,
      email: 'verification.test@example.com',
      username: 'verifytest123'
    });

    // Should be on verification page
    await expect(page).toHaveURL(/\/auth\/verify-email/);
    await expect(page.locator('h1')).toContainText('Verify Your Email');

    // Check email display
    await expect(page.locator('text=verification.test@example.com')).toBeVisible();

    // Test resend functionality
    const resendButton = page.locator('button:has-text("Resend")');
    if (await resendButton.isVisible() && await resendButton.isEnabled()) {
      await resendButton.click();
      await expect(page.locator('text=sent successfully')).toBeVisible({ timeout: 5000 });
    }

    // Enter OTP
    const devOTPLocator = page.locator('[data-testid="dev-otp"], .bg-yellow-50');
    if (await devOTPLocator.isVisible()) {
      const otpText = await devOTPLocator.textContent();
      const otpMatch = otpText?.match(/\d{6}/);
      if (otpMatch) {
        await fillOTPCode(page, otpMatch[0]);
        
        // Should show success and redirect
        await expect(page.locator('text=Email Verified')).toBeVisible({ timeout: 5000 });
        await expect(page).toHaveURL(/\/onboarding/, { timeout: 10000 });
      }
    }
  });

  test('Onboarding completion flow', async ({ page }) => {
    // Start from onboarding (assuming user is verified)
    await page.goto('/onboarding');
    
    // If redirected to signin, complete auth flow first
    if (page.url().includes('/auth/signin')) {
      await page.fill('input[placeholder*="email or username"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]:has-text("Sign In")');
      await page.waitForURL(/\/onboarding/, { timeout: 10000 });
    }

    await expect(page.locator('h1')).toContainText(/Welcome|Onboarding/);

    // Step 1: Personal Info
    await expect(page.locator('text=Personal Info')).toBeVisible();
    
    // Fill required fields if not pre-filled
    const nameInput = page.locator('input[placeholder*="full name"]');
    if (await nameInput.isVisible() && await nameInput.inputValue() === '') {
      await nameInput.fill(testUser.fullName);
    }
    await page.click('button:has-text("Next")');

    // Step 2: Academic Info (optional)
    await expect(page.locator('text=Academic')).toBeVisible();
    await page.click('button:has-text("Skip")');

    // Step 3: Interests (optional)
    await expect(page.locator('text=Interests')).toBeVisible();
    
    // Select some interests if available
    const interestButtons = page.locator('button[data-testid*="interest"], .interest-button');
    const count = await interestButtons.count();
    if (count > 0) {
      // Select first 3 interests
      for (let i = 0; i < Math.min(3, count); i++) {
        await interestButtons.nth(i).click();
      }
    }
    await page.click('button:has-text("Next")');

    // Step 4: Privacy Settings
    await expect(page.locator('text=Privacy')).toBeVisible();
    // Use default settings
    await page.click('button:has-text("Next")');

    // Step 5: Wellness Settings
    await expect(page.locator('text=Wellness')).toBeVisible();
    
    // Enable some wellness features
    const wellnessCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await wellnessCheckboxes.count();
    if (checkboxCount > 0) {
      await wellnessCheckboxes.first().check();
    }
    
    await page.click('button:has-text("Complete Setup")');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.locator('h1, h2')).toContainText(/Dashboard|Welcome/);
  });

  test('Remember me functionality', async ({ page }) => {
    await page.goto('/auth/signin');

    // Sign in with remember me checked
    await page.fill('input[placeholder*="email or username"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    
    // Check remember me
    const rememberMeCheckbox = page.locator('input[type="checkbox"]:near(:text("Remember me"))');
    if (await rememberMeCheckbox.isVisible()) {
      await rememberMeCheckbox.check();
      
      // Select session duration if available
      const sessionSelect = page.locator('select');
      if (await sessionSelect.isVisible()) {
        await sessionSelect.selectOption('168'); // 1 week
      }
    }

    await page.click('button[type="submit"]:has-text("Sign In")');

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Verify tokens are stored
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
    
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
  });

  test('Invalid credentials error handling', async ({ page }) => {
    await page.goto('/auth/signin');

    // Try to sign in with invalid credentials
    await page.fill('input[placeholder*="email or username"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Should show error message
    await expect(page.locator('text=Invalid credentials, text=Authentication failed')).toBeVisible({ timeout: 5000 });
    
    // Should remain on signin page
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('Form validation errors', async ({ page }) => {
    await page.goto('/auth/signup');

    // Try to proceed without filling required fields
    await page.click('button:has-text("Next")');

    // Should show validation errors
    await expect(page.locator('text=required, text=invalid')).toBeVisible();

    // Fill invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.blur('input[type="email"]');
    await expect(page.locator('text=valid email')).toBeVisible();

    // Fill weak password
    await page.fill('input[type="email"]', 'valid@example.com');
    await page.fill('input[placeholder*="username"]', 'validuser');
    await page.click('button:has-text("Next")');
    
    await page.fill('input[placeholder*="Create a password"]', '123');
    await page.blur('input[placeholder*="Create a password"]');
    await expect(page.locator('text=password, text=strength, text=requirements')).toBeVisible();
  });

  test('Navigation between auth pages', async ({ page }) => {
    // Start at signin
    await page.goto('/auth/signin');
    await expect(page.locator('h1, h2')).toContainText(/Sign In|Welcome Back/);

    // Navigate to signup
    await page.click('a:has-text("Sign up")');
    await expect(page).toHaveURL(/\/auth\/signup/);
    await expect(page.locator('h1, h2')).toContainText(/Sign Up|Create Account/);

    // Navigate back to signin
    await page.click('a:has-text("Sign in")');
    await expect(page).toHaveURL(/\/auth\/signin/);

    // Navigate to forgot password
    await page.click('a:has-text("Forgot password")');
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
  });
});