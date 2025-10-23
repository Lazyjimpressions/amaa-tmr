import { test, expect } from '@playwright/test';

test.describe('Supabase Authentication Flow', () => {
  test('Magic link login and session persistence', async ({ page }) => {
    // Capture all console logs for debugging
    page.on('console', msg => {
      console.log(`🔍 Browser [${msg.type()}]: ${msg.text()}`);
    });

    // Load the survey page
    console.log('🚀 Navigating to survey page...');
    await page.goto('https://marketrepstg.wpenginepowered.com/survey');

    // Wait for Supabase client to load
    console.log('⏳ Waiting for Supabase client...');
    await page.waitForFunction(() => window.supabaseClient !== undefined, { timeout: 10000 });
    console.log('✅ Supabase client loaded');

    // Wait for helpers to be available
    console.log('⏳ Waiting for Supabase helpers...');
    await page.waitForFunction(() => window.supabaseHelpers !== undefined, { timeout: 10000 });
    console.log('✅ Supabase helpers loaded');

    // Check initial session state
    console.log('🔍 Checking initial session state...');
    const initialSession = await page.evaluate(async () => {
      const { data } = await window.supabaseClient.auth.getSession();
      return data.session;
    });
    console.log('📊 Initial session:', initialSession);

    // Check if user is authenticated
    const isAuthenticated = await page.evaluate(async () => {
      const user = await window.supabaseHelpers.getCurrentUser();
      return user !== null;
    });
    console.log('🔐 Is authenticated:', isAuthenticated);

    // Check if login modal is visible
    const loginModalVisible = await page.isVisible('[data-testid="login-modal"], .login-modal-overlay');
    console.log('👁️ Login modal visible:', loginModalVisible);

    // If not authenticated, test the login flow
    if (!isAuthenticated) {
      console.log('🔑 Testing magic link flow...');
      
      // Wait for email input to be visible
      await page.waitForSelector('input[type="email"], input[placeholder*="email"]', { timeout: 5000 });
      
      // Enter real email (Supabase rejects test emails)
      await page.fill('input[type="email"], input[placeholder*="email"]', 'jonathan.hughes@thefivestar.com');
      console.log('📧 Email entered');
      
      // Click send magic link
      await page.click('button:has-text("Send Magic Link")');
      console.log('📤 Magic link sent');
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Check for success message or error message
      const successMessage = await page.textContent('text=Check your email').catch(() => null);
      const errorMessage = await page.textContent('text=For security purposes').catch(() => null);
      console.log('✅ Success message:', successMessage);
      console.log('❌ Error message:', errorMessage);
    }

    // Test session persistence across page reload
    console.log('🔄 Testing session persistence...');
    await page.reload();
    await page.waitForFunction(() => window.supabaseClient !== undefined);
    
    const reloadedSession = await page.evaluate(async () => {
      const { data } = await window.supabaseClient.auth.getSession();
      return data.session;
    });
    console.log('📊 Reloaded session:', reloadedSession);

    // Test auth state change events
    console.log('🎧 Testing auth state change events...');
    const authEvents = await page.evaluate(() => {
      return new Promise((resolve) => {
        const events = [];
        const unsubscribe = window.supabaseClient.auth.onAuthStateChange((event, session) => {
          events.push({ event, session: session?.user?.email || null });
          if (events.length >= 3) {
            unsubscribe.data.subscription.unsubscribe();
            resolve(events);
          }
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          unsubscribe.data.subscription.unsubscribe();
          resolve(events);
        }, 5000);
      });
    });
    console.log('📡 Auth events:', authEvents);

    // Final session check
    const finalSession = await page.evaluate(async () => {
      const { data } = await window.supabaseClient.auth.getSession();
      return data.session;
    });
    console.log('📊 Final session:', finalSession);

    // Assertions
    expect(window.supabaseClient).toBeDefined();
    expect(window.supabaseHelpers).toBeDefined();
  });

  test('Header authentication state', async ({ page }) => {
    page.on('console', msg => {
      console.log(`🔍 Header [${msg.type()}]: ${msg.text()}`);
    });

    console.log('🚀 Navigating to homepage...');
    await page.goto('https://marketrepstg.wpenginepowered.com/');

    // Wait for header components to load
    await page.waitForFunction(() => window.supabaseClient !== undefined);
    await page.waitForFunction(() => window.supabaseHelpers !== undefined);

    // Check header authentication state
    const headerAuthState = await page.evaluate(async () => {
      const user = await window.supabaseHelpers.getCurrentUser();
      return {
        isAuthenticated: user !== null,
        userEmail: user?.email || null,
        hasClient: !!window.supabaseClient,
        hasHelpers: !!window.supabaseHelpers
      };
    });
    console.log('📊 Header auth state:', headerAuthState);

    // Check if login button is visible
    const loginButtonVisible = await page.isVisible('button:has-text("Log In")');
    console.log('👁️ Login button visible:', loginButtonVisible);

    // Test header login modal
    if (loginButtonVisible) {
      console.log('🔑 Testing header login modal...');
      await page.click('button:has-text("Log In")');
      
      // Wait for modal to appear
      await page.waitForSelector('.login-modal-overlay', { timeout: 5000 });
      console.log('✅ Login modal appeared');
      
      // Close modal
      await page.click('.login-modal-close, button:has-text("Close")');
      console.log('❌ Login modal closed');
    }
  });

  test('Survey page authentication flow', async ({ page }) => {
    page.on('console', msg => {
      console.log(`🔍 Survey [${msg.type()}]: ${msg.text()}`);
    });

    console.log('🚀 Testing survey page flow...');
    await page.goto('https://marketrepstg.wpenginepowered.com/survey');

    // Wait for components to load
    await page.waitForFunction(() => window.supabaseClient !== undefined);
    await page.waitForFunction(() => window.supabaseHelpers !== undefined);

    // Check survey app state
    const surveyState = await page.evaluate(() => {
      // Try to get React component state if available
      const surveyRoot = document.querySelector('#survey-root');
      return {
        surveyRootExists: !!surveyRoot,
        surveyRootContent: surveyRoot?.textContent || 'No content'
      };
    });
    console.log('📊 Survey state:', surveyState);

    // Check for loading state
    const isLoading = await page.isVisible('text=Loading');
    console.log('⏳ Is loading:', isLoading);

    // Check for login modal
    const loginModalVisible = await page.isVisible('.login-modal-overlay');
    console.log('👁️ Login modal visible:', loginModalVisible);

    // Wait for final state
    await page.waitForTimeout(3000);
    
    const finalState = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasLoginModal: !!document.querySelector('.login-modal-overlay'),
        hasLoadingText: document.body.textContent.includes('Loading'),
        hasSurveyContent: document.body.textContent.includes('survey') || document.body.textContent.includes('Sign In')
      };
    });
    console.log('📊 Final survey state:', finalState);
  });
});
