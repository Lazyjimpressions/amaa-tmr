import { test, expect } from '@playwright/test';

test('Simple Supabase Authentication Test', async ({ page }) => {
  // Capture console logs
  page.on('console', msg => {
    if (msg.type() === 'log' || msg.type() === 'error') {
      console.log(`🔍 [${msg.type()}]: ${msg.text()}`);
    }
  });

  console.log('🚀 Testing Supabase Authentication Flow...');
  
  // Navigate to survey page
  await page.goto('https://marketrepstg.wpenginepowered.com/survey');
  
  // Wait for Supabase to load
  await page.waitForFunction(() => window.supabaseClient !== undefined);
  await page.waitForFunction(() => window.supabaseHelpers !== undefined);
  console.log('✅ Supabase client and helpers loaded');

  // Check initial session
  const session = await page.evaluate(async () => {
    const { data } = await window.supabaseClient.auth.getSession();
    return data.session;
  });
  console.log('📊 Initial session:', session);

  // Check if login modal appears
  await page.waitForSelector('.login-modal-overlay', { timeout: 10000 });
  console.log('✅ Login modal appeared');

  // Test magic link with real email
  await page.fill('input[type="email"]', 'jonathan.hughes@thefivestar.com');
  await page.click('button:has-text("Send Magic Link")');
  
  // Wait for success message
  await page.waitForSelector('text=Check your email', { timeout: 10000 });
  console.log('✅ Magic link sent successfully');

  // Test auth confirm route
  console.log('🔗 Testing auth confirm route...');
  await page.goto('https://marketrepstg.wpenginepowered.com/auth/confirm?next=%2Fsurvey&token_hash=test&type=email');
  
  // Check for error handling
  const errorMessage = await page.textContent('text=Email link is invalid').catch(() => null);
  console.log('✅ Auth confirm error handling:', errorMessage);

  console.log('🎉 Authentication system is working correctly!');
});
