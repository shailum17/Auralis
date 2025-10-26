import { test, expect, Page } from '@playwright/test';

// Test data
const testUser = {
  email: 'performance.test@example.com',
  username: 'perftest123',
  password: 'PerformanceTest123!',
  fullName: 'Performance Test User'
};

// Helper functions
async function measurePageLoad(page: Page, url: string): Promise<number> {
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  return Date.now() - startTime;
}

async function measureFormSubmission(page: Page, formAction: () => Promise<void>): Promise<number> {
  const startTime = Date.now();
  await formAction();
  // Wait for either success redirect or error message
  await Promise.race([
    page.waitForURL(/\/(dashboard|onboarding|verify-email)/, { timeout: 10000 }),
    page.waitForSelector('text=error, text=invalid, text=failed', { timeout: 10000 })
  ]);
  return Date.now() - startTime;
}

async function registerUser(page: Page, userData = testUser) {
  await page.fill('input[type="email"]', userData.email);
  await page.fill('input[placeholder*="username"]', userData.username);
  await page.click('button:has-text("Next")');

  await page.fill('input[placeholder*="Create a password"]', userData.password);
  await page.fill('input[placeholder*="Confirm your password"]', userData.password);
  await page.click('button:has-text("Next")');

  await page.fill('input[placeholder*="full name"]', userData.fullName);
  await page.click('button:has-text("Next")');

  await page.check('input[type="checkbox"]');
  await page.click('button:has-text("Create Account")');
}

test.describe('Authentication Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Page load performance', async ({ page }) => {
    // Test signin page load time
    const signinLoadTime = await measurePageLoad(page, '/auth/signin');
    console.log(`Signin page load time: ${signinLoadTime}ms`);
    expect(signinLoadTime).toBeLessThan(3000); // Should load within 3 seconds

    // Test signup page load time
    const signupLoadTime = await measurePageLoad(page, '/auth/signup');
    console.log(`Signup page load time: ${signupLoadTime}ms`);
    expect(signupLoadTime).toBeLessThan(3000);

    // Test verify email page load time (with session data)
    await page.evaluate(() => {
      sessionStorage.setItem('verificationEmail', 'test@example.com');
    });
    const verifyLoadTime = await measurePageLoad(page, '/auth/verify-email');
    console.log(`Verify email page load time: ${verifyLoadTime}ms`);
    expect(verifyLoadTime).toBeLessThan(3000);
  });

  test('Form submission performance', async ({ page }) => {
    // Test registration form submission time
    await page.goto('/auth/signup');
    
    const registrationTime = await measureFormSubmission(page, async () => {
      await registerUser(page);
    });
    
    console.log(`Registration submission time: ${registrationTime}ms`);
    expect(registrationTime).toBeLessThan(5000); // Should complete within 5 seconds

    // Test signin form submission time
    await page.goto('/auth/signin');
    
    const signinTime = await measureFormSubmission(page, async () => {
      await page.fill('input[placeholder*="email or username"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]:has-text("Sign In")');
    });
    
    console.log(`Signin submission time: ${signinTime}ms`);
    expect(signinTime).toBeLessThan(3000); // Should complete within 3 seconds
  });

  test('Email verification performance', async ({ page }) => {
    // Register user first
    await page.goto('/auth/signup');
    await registerUser(page);
    
    // Should be on verification page
    await expect(page).toHaveURL(/\/auth\/verify-email/);

    // Test OTP verification time
    const verificationTime = await measureFormSubmission(page, async () => {
      // Get development OTP if available
      const devOTPLocator = page.locator('[data-testid="dev-otp"], .bg-yellow-50');
      if (await devOTPLocator.isVisible()) {
        const otpText = await devOTPLocator.textContent();
        const otpMatch = otpText?.match(/\d{6}/);
        if (otpMatch) {
          for (let i = 0; i < 6; i++) {
            await page.fill(`input[type="text"]:nth-child(${i + 1})`, otpMatch[0][i]);
          }
        }
      } else {
        // Use test OTP
        for (let i = 0; i < 6; i++) {
          await page.fill(`input[type="text"]:nth-child(${i + 1})`, '123456'[i]);
        }
      }
    });
    
    console.log(`Email verification time: ${verificationTime}ms`);
    expect(verificationTime).toBeLessThan(3000);
  });

  test('Onboarding flow performance', async ({ page }) => {
    // Start from onboarding page (simulate verified user)
    await page.goto('/onboarding');
    
    // If redirected to signin, complete auth first
    if (page.url().includes('/auth/signin')) {
      await page.fill('input[placeholder*="email or username"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]:has-text("Sign In")');
      await page.waitForURL(/\/onboarding/, { timeout: 10000 });
    }

    const onboardingStartTime = Date.now();

    // Complete onboarding steps
    // Step 1: Personal Info
    const nameInput = page.locator('input[placeholder*="full name"]');
    if (await nameInput.isVisible() && await nameInput.inputValue() === '') {
      await nameInput.fill(testUser.fullName);
    }
    await page.click('button:has-text("Next")');

    // Step 2: Academic Info (skip)
    await page.click('button:has-text("Skip")');

    // Step 3: Interests (skip)
    await page.click('button:has-text("Skip")');

    // Step 4: Privacy Settings
    await page.click('button:has-text("Next")');

    // Step 5: Wellness Settings
    await page.click('button:has-text("Complete Setup")');

    // Wait for completion
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
    
    const onboardingTime = Date.now() - onboardingStartTime;
    console.log(`Onboarding completion time: ${onboardingTime}ms`);
    expect(onboardingTime).toBeLessThan(10000); // Should complete within 10 seconds
  });

  test('Concurrent user registration performance', async ({ browser }) => {
    // Test multiple concurrent registrations
    const concurrentUsers = 3;
    const registrationPromises: Promise<number>[] = [];

    for (let i = 0; i < concurrentUsers; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      const userData = {
        ...testUser,
        email: `concurrent${i}@example.com`,
        username: `concurrent${i}user`
      };

      const promise = (async () => {
        await page.goto('/auth/signup');
        return await measureFormSubmission(page, async () => {
          await registerUser(page, userData);
        });
      })();

      registrationPromises.push(promise);
    }

    const registrationTimes = await Promise.all(registrationPromises);
    
    console.log('Concurrent registration times:', registrationTimes);
    
    // All registrations should complete within reasonable time
    registrationTimes.forEach((time, index) => {
      console.log(`User ${index} registration time: ${time}ms`);
      expect(time).toBeLessThan(8000); // Allow more time for concurrent operations
    });

    // Average time should be reasonable
    const averageTime = registrationTimes.reduce((sum, time) => sum + time, 0) / registrationTimes.length;
    console.log(`Average concurrent registration time: ${averageTime}ms`);
    expect(averageTime).toBeLessThan(6000);
  });

  test('Form validation performance', async ({ page }) => {
    await page.goto('/auth/signup');

    // Test real-time validation performance
    const validationTests = [
      { field: 'input[type="email"]', value: 'invalid-email', expectedError: true },
      { field: 'input[type="email"]', value: 'valid@example.com', expectedError: false },
      { field: 'input[placeholder*="username"]', value: 'ab', expectedError: true },
      { field: 'input[placeholder*="username"]', value: 'validusername', expectedError: false }
    ];

    for (const test of validationTests) {
      const startTime = Date.now();
      
      await page.fill(test.field, test.value);
      await page.blur(test.field);
      
      // Wait for validation to complete
      await page.waitForTimeout(500);
      
      const validationTime = Date.now() - startTime;
      console.log(`Validation time for ${test.value}: ${validationTime}ms`);
      
      // Validation should be fast
      expect(validationTime).toBeLessThan(2000);
    }
  });

  test('Password strength calculation performance', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Navigate to password step
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[placeholder*="username"]', 'testuser');
    await page.click('button:has-text("Next")');

    const passwords = [
      '123',
      'password',
      'Password123',
      'StrongPassword123!',
      'VeryStrongPassword123!@#$%'
    ];

    for (const password of passwords) {
      const startTime = Date.now();
      
      await page.fill('input[placeholder*="Create a password"]', password);
      
      // Wait for strength calculation
      await page.waitForTimeout(300);
      
      const calculationTime = Date.now() - startTime;
      console.log(`Password strength calculation time for "${password}": ${calculationTime}ms`);
      
      // Password strength calculation should be very fast
      expect(calculationTime).toBeLessThan(1000);
    }
  });

  test('API response times', async ({ page }) => {
    // Test registration API performance
    await page.goto('/auth/signup');
    
    let registrationApiTime = 0;
    
    // Listen for registration API call
    page.on('response', response => {
      if (response.url().includes('/api/auth/register')) {
        registrationApiTime = response.timing().responseEnd;
        console.log(`Registration API response time: ${registrationApiTime}ms`);
      }
    });

    await registerUser(page);
    
    // Wait for API call to complete
    await page.waitForTimeout(2000);
    
    if (registrationApiTime > 0) {
      expect(registrationApiTime).toBeLessThan(3000); // API should respond within 3 seconds
    }

    // Test signin API performance
    await page.goto('/auth/signin');
    
    let signinApiTime = 0;
    
    page.on('response', response => {
      if (response.url().includes('/api/auth/signin') || response.url().includes('/api/auth/login')) {
        signinApiTime = response.timing().responseEnd;
        console.log(`Signin API response time: ${signinApiTime}ms`);
      }
    });

    await page.fill('input[placeholder*="email or username"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]:has-text("Sign In")');
    
    await page.waitForTimeout(2000);
    
    if (signinApiTime > 0) {
      expect(signinApiTime).toBeLessThan(2000); // Signin API should be faster
    }
  });

  test('Memory usage during authentication flow', async ({ page }) => {
    // Monitor memory usage during complete auth flow
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    // Complete registration flow
    await page.goto('/auth/signup');
    await registerUser(page);

    const afterRegistrationMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    // Complete verification
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

    const afterVerificationMemory = await page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });

    // Log memory usage if available
    if (initialMemory > 0) {
      console.log(`Initial memory: ${initialMemory} bytes`);
      console.log(`After registration: ${afterRegistrationMemory} bytes`);
      console.log(`After verification: ${afterVerificationMemory} bytes`);
      
      const memoryIncrease = afterVerificationMemory - initialMemory;
      console.log(`Total memory increase: ${memoryIncrease} bytes`);
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }
  });
});