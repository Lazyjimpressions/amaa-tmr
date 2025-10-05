# WordPress + Supabase Frontend Integration Guide

**Project:** AMAA TMR
**Last Updated:** October 5, 2025

---

## Overview

This guide walks through integrating Supabase authentication and data access into your WordPress block theme.

**Current State:**
- ✅ WordPress block theme setup
- ✅ Survey/Insights page templates ready
- ❌ No Supabase client yet
- ❌ No authentication implemented

**Goal:** Add Supabase authentication and data access to WordPress frontend

---

## Architecture Diagram

```
WordPress Frontend (Browser)
  ↓
app.js (Supabase Client)
  ↓ (uses Publishable Key)
Supabase Auth + Database
  ↓ (returns JWT)
User Session Established
  ↓
Survey Submission / Insights Display
  ↓ (respects RLS policies)
Protected Resources
```

---

## Prerequisites

Before starting, complete:
1. ✅ [SETUP-SECRETS.md](./SETUP-SECRETS.md) - Generate API keys
2. ✅ Create `.env` file with keys
3. ✅ Restart Cursor and authenticate MCP

---

## Step-by-Step Integration

### Step 1: Create Assets Directory Structure

```bash
mkdir -p wp-content/themes/amaa-tmr/assets/js
mkdir -p wp-content/themes/amaa-tmr/assets/css
```

### Step 2: Install Supabase Client

**Option A: Via CDN (Recommended for WordPress)**

No build process needed. Add to theme:

```php
// wp-content/themes/amaa-tmr/functions.php

add_action('wp_enqueue_scripts', function () {
  // Supabase client via CDN
  wp_enqueue_script(
    'supabase-js',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    [],
    null,
    true
  );

  // Your app script
  wp_enqueue_script(
    'tmr-app',
    get_template_directory_uri() . '/assets/js/app.js',
    ['supabase-js'], // depends on supabase
    filemtime(get_template_directory() . '/assets/js/app.js'),
    true
  );

  // Pass PHP env vars to JavaScript
  wp_localize_script('tmr-app', 'tmrConfig', [
    'supabaseUrl' => getenv('SUPABASE_URL') ?: 'https://ffgjqlmulaqtfopgwenf.supabase.co',
    'supabaseKey' => getenv('SUPABASE_PUBLISHABLE_KEY') ?: '',
  ]);
});
```

**Option B: Via NPM (Build Process Required)**

```bash
npm init -y
npm install @supabase/supabase-js
npm install --save-dev webpack webpack-cli
```

Then set up webpack to bundle `assets/js/app.js`

---

### Step 3: Initialize Supabase Client

Create `wp-content/themes/amaa-tmr/assets/js/app.js`:

```javascript
/**
 * AMAA TMR - Supabase Integration
 */

// Initialize Supabase client
const { createClient } = supabase;

const supabaseClient = createClient(
  tmrConfig.supabaseUrl,
  tmrConfig.supabaseKey
);

console.log('Supabase client initialized:', {
  url: tmrConfig.supabaseUrl,
  hasKey: !!tmrConfig.supabaseKey
});

// Export for use in other modules
window.tmrSupabase = supabaseClient;
```

---

### Step 4: Implement Authentication UI

Create `wp-content/themes/amaa-tmr/assets/js/auth.js`:

```javascript
/**
 * Authentication Module
 */

class TMRAuth {
  constructor(supabase) {
    this.supabase = supabase;
    this.user = null;
    this.init();
  }

  async init() {
    // Check for existing session
    const { data: { session } } = await this.supabase.auth.getSession();

    if (session) {
      this.user = session.user;
      this.onAuthStateChange(true);
    }

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user || null;
      this.onAuthStateChange(!!session);
    });
  }

  async signUp(email, password) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }

    return data;
  }

  async signIn(email, password) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  onAuthStateChange(isAuthenticated) {
    // Update UI based on auth state
    document.body.classList.toggle('user-authenticated', isAuthenticated);

    // Show/hide elements
    document.querySelectorAll('.auth-only').forEach(el => {
      el.style.display = isAuthenticated ? 'block' : 'none';
    });

    document.querySelectorAll('.guest-only').forEach(el => {
      el.style.display = isAuthenticated ? 'none' : 'block';
    });
  }

  isAuthenticated() {
    return !!this.user;
  }

  getUser() {
    return this.user;
  }
}

// Initialize auth
const tmrAuth = new TMRAuth(window.tmrSupabase);
window.tmrAuth = tmrAuth;
```

Enqueue in `functions.php`:

```php
wp_enqueue_script(
  'tmr-auth',
  get_template_directory_uri() . '/assets/js/auth.js',
  ['tmr-app'],
  filemtime(get_template_directory() . '/assets/js/auth.js'),
  true
);
```

---

### Step 5: Create Login/Signup Form

Create WordPress block pattern `patterns/auth-form.php`:

```php
<?php
/**
 * Title: Authentication Form
 * Slug: amaa-tmr/auth-form
 * Categories: pages
 */
?>

<!-- wp:group {"className":"tmr-auth-form guest-only"} -->
<div class="tmr-auth-form guest-only">

  <!-- wp:heading -->
  <h2>Sign In</h2>
  <!-- /wp:heading -->

  <!-- wp:html -->
  <form id="tmr-signin-form">
    <div class="form-group">
      <label for="signin-email">Email</label>
      <input type="email" id="signin-email" required />
    </div>
    <div class="form-group">
      <label for="signin-password">Password</label>
      <input type="password" id="signin-password" required />
    </div>
    <button type="submit" class="wp-block-button__link">Sign In</button>
  </form>
  <!-- /wp:html -->

  <!-- wp:separator -->
  <hr class="wp-block-separator" />
  <!-- /wp:separator -->

  <!-- wp:heading -->
  <h2>Sign Up</h2>
  <!-- /wp:heading -->

  <!-- wp:html -->
  <form id="tmr-signup-form">
    <div class="form-group">
      <label for="signup-email">Email</label>
      <input type="email" id="signup-email" required />
    </div>
    <div class="form-group">
      <label for="signup-password">Password</label>
      <input type="password" id="signup-password" required />
    </div>
    <button type="submit" class="wp-block-button__link">Sign Up</button>
  </form>
  <!-- /wp:html -->

</div>
<!-- /wp:group -->

<!-- wp:group {"className":"tmr-user-info auth-only"} -->
<div class="tmr-user-info auth-only" style="display:none">

  <!-- wp:heading -->
  <h2>Welcome!</h2>
  <!-- /wp:heading -->

  <!-- wp:paragraph -->
  <p>You are signed in as: <span id="user-email"></span></p>
  <!-- /wp:paragraph -->

  <!-- wp:button -->
  <div class="wp-block-button">
    <button id="tmr-signout-btn" class="wp-block-button__link">Sign Out</button>
  </div>
  <!-- /wp:button -->

</div>
<!-- /wp:group -->
```

Add form handlers to `auth.js`:

```javascript
// Add to TMRAuth class init() method:

// Sign in form
document.getElementById('tmr-signin-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;

  try {
    await this.signIn(email, password);
    alert('Signed in successfully!');
  } catch (error) {
    alert('Sign in failed: ' + error.message);
  }
});

// Sign up form
document.getElementById('tmr-signup-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  try {
    await this.signUp(email, password);
    alert('Check your email to confirm your account!');
  } catch (error) {
    alert('Sign up failed: ' + error.message);
  }
});

// Sign out button
document.getElementById('tmr-signout-btn')?.addEventListener('click', async () => {
  try {
    await this.signOut();
    alert('Signed out successfully!');
  } catch (error) {
    alert('Sign out failed: ' + error.message);
  }
});

// Update user email display
if (this.user) {
  const emailSpan = document.getElementById('user-email');
  if (emailSpan) emailSpan.textContent = this.user.email;
}
```

---

### Step 6: Implement Survey Submission

Create `wp-content/themes/amaa-tmr/assets/js/survey.js`:

```javascript
/**
 * Survey Module
 */

class TMRSurvey {
  constructor(supabase, auth) {
    this.supabase = supabase;
    this.auth = auth;
    this.init();
  }

  init() {
    const surveyForm = document.getElementById('tmr-survey-form');
    if (surveyForm) {
      surveyForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    if (!this.auth.isAuthenticated()) {
      alert('Please sign in to submit a survey');
      return;
    }

    const formData = new FormData(e.target);
    const surveyData = {
      communication_rating: parseInt(formData.get('communication_rating')),
      collaboration_rating: parseInt(formData.get('collaboration_rating')),
      leadership_rating: parseInt(formData.get('leadership_rating')),
      comments: formData.get('comments'),
      team_id: formData.get('team_id'),
      user_id: this.auth.getUser().id
    };

    try {
      const { data, error } = await this.supabase
        .from('surveys')
        .insert([surveyData])
        .select();

      if (error) throw error;

      alert('Survey submitted successfully!');
      e.target.reset();

      // Redirect to AI briefs page
      window.location.href = '/briefs';
    } catch (error) {
      console.error('Survey submission error:', error);
      alert('Failed to submit survey: ' + error.message);
    }
  }
}

// Initialize survey
const tmrSurvey = new TMRSurvey(window.tmrSupabase, window.tmrAuth);
```

Update survey template `templates/page-survey.html`:

```html
<!-- wp:group {"tagName":"main","className":"tmr-survey auth-only"} -->
<main class="tmr-survey auth-only" id="main">

  <!-- wp:heading {"level":1} -->
  <h1>Team Survey</h1>
  <!-- /wp:heading -->

  <!-- wp:paragraph -->
  <p>Answer a few questions to power the report.</p>
  <!-- /wp:paragraph -->

  <!-- wp:html -->
  <form id="tmr-survey-form">
    <input type="hidden" name="team_id" value="[team-id-placeholder]" />

    <div class="form-group">
      <label>Communication Rating (1-5)</label>
      <input type="number" name="communication_rating" min="1" max="5" required />
    </div>

    <div class="form-group">
      <label>Collaboration Rating (1-5)</label>
      <input type="number" name="collaboration_rating" min="1" max="5" required />
    </div>

    <div class="form-group">
      <label>Leadership Rating (1-5)</label>
      <input type="number" name="leadership_rating" min="1" max="5" required />
    </div>

    <div class="form-group">
      <label>Comments</label>
      <textarea name="comments" rows="4"></textarea>
    </div>

    <button type="submit" class="wp-block-button__link">Submit Survey</button>
  </form>
  <!-- /wp:html -->

</main>
<!-- /wp:group -->

<!-- wp:group {"className":"guest-only"} -->
<div class="guest-only">
  <!-- wp:paragraph -->
  <p>Please <a href="/login">sign in</a> to access the survey.</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
```

---

### Step 7: Display AI Briefs Data

Create `wp-content/themes/amaa-tmr/assets/js/briefs.js`:

```javascript
/**
 * AI Briefs Module
 */

class TMRBriefs {
  constructor(supabase, auth) {
    this.supabase = supabase;
    this.auth = auth;
    this.init();
  }

  async init() {
    if (!this.auth.isAuthenticated()) {
      return;
    }

    const container = document.getElementById('tmr-briefs');
    if (!container) return;

    try {
      await this.loadBriefs(container);
    } catch (error) {
      console.error('Failed to load briefs:', error);
      container.innerHTML = '<p>Failed to load AI briefs</p>';
    }
  }

  async loadBriefs(container) {
    container.innerHTML = '<p>Loading AI briefs...</p>';

    const userEmail = this.auth.getUser().email;

    const { data, error } = await this.supabase
      .from('ai_briefs')
      .select(`
        *,
        surveys (
          title,
          year
        )
      `)
      .eq('member_email', userEmail)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!data || data.length === 0) {
      container.innerHTML = '<p>No AI briefs available yet. Submit a survey to generate your personalized brief!</p>';
      return;
    }

    // Render briefs
    const html = `
      <div class="briefs-grid">
        ${data.map(brief => this.renderBrief(brief)).join('')}
      </div>
    `;

    container.innerHTML = html;
  }

  renderBrief(brief) {
    return `
      <div class="brief-card">
        <h3>${brief.surveys?.title || 'Survey'} (${brief.surveys?.year || 'N/A'})</h3>
        <div class="brief-content">
          ${marked(brief.brief_md || 'No content available')}
        </div>
        <small>Generated: ${new Date(brief.created_at).toLocaleDateString()}</small>
      </div>
    `;
  }
}

// Initialize briefs
document.addEventListener('DOMContentLoaded', () => {
  // Wait for auth to initialize
  setTimeout(() => {
    new TMRBriefs(window.tmrSupabase, window.tmrAuth);
  }, 100);
});
```

Update briefs template `templates/page-briefs.html`:

```html
<!-- wp:group {"tagName":"main","className":"tmr-briefs-page auth-only"} -->
<main class="tmr-briefs-page auth-only" id="main">

  <!-- wp:heading {"level":1} -->
  <h1>AI Briefs</h1>
  <!-- /wp:heading -->

  <!-- wp:paragraph -->
  <p>View your personalized AI-generated insights and analysis.</p>
  <!-- /wp:paragraph -->

  <!-- wp:html -->
  <div id="tmr-briefs"></div>
  <!-- /wp:html -->

</main>
<!-- /wp:group -->

<!-- wp:group {"className":"guest-only"} -->
<div class="guest-only">
  <!-- wp:paragraph -->
  <p>Please <a href="/login">sign in</a> to view your AI briefs.</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
```

---

### Step 8: Add Basic Styling

Create `wp-content/themes/amaa-tmr/assets/css/app.css`:

```css
/* Authentication Forms */
.tmr-auth-form {
  max-width: 500px;
  margin: 2rem auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Survey */
.tmr-survey {
  max-width: 600px;
  margin: 2rem auto;
}

/* Insights */
.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.insight-card {
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
}

.insight-card h3 {
  margin-top: 0;
}

.metric {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
}

.metric .label {
  font-weight: 600;
}

.metric-trend {
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  text-align: center;
}

.metric-trend.positive {
  background: #d4edda;
  color: #155724;
}

.metric-trend.neutral {
  background: #d1ecf1;
  color: #0c5460;
}

.metric-trend.negative {
  background: #f8d7da;
  color: #721c24;
}

/* Visibility control */
.auth-only {
  display: none;
}

body.user-authenticated .auth-only {
  display: block;
}

body.user-authenticated .guest-only {
  display: none;
}
```

Enqueue CSS in `functions.php`:

```php
wp_enqueue_style(
  'tmr-app-styles',
  get_template_directory_uri() . '/assets/css/app.css',
  [],
  filemtime(get_template_directory() . '/assets/css/app.css')
);
```

---

## Testing Checklist

### Local Testing

1. **Environment Setup**
   - [ ] `.env` file created with API keys
   - [ ] WordPress can read environment variables
   - [ ] Supabase client loads without errors

2. **Authentication**
   - [ ] Sign up form creates new user
   - [ ] Email confirmation received
   - [ ] Sign in form authenticates user
   - [ ] Sign out clears session
   - [ ] UI updates based on auth state

3. **Survey Submission**
   - [ ] Form requires authentication
   - [ ] Data submits to Supabase
   - [ ] Row appears in `surveys` table
   - [ ] RLS policies allow user's own data

4. **Insights Display**
   - [ ] Insights load for authenticated user
   - [ ] Data displays correctly
   - [ ] No data for unauthenticated users

### Production Deployment

1. **Environment Variables**
   - [ ] Production `.env` on server
   - [ ] Correct publishable key (production)
   - [ ] No secret keys in frontend code

2. **Security**
   - [ ] RLS enabled on all tables
   - [ ] Policies tested and working
   - [ ] No sensitive data exposed in responses

3. **Performance**
   - [ ] JavaScript minified (if using build process)
   - [ ] CDN scripts load correctly
   - [ ] No console errors

---

## Troubleshooting

### "Supabase is not defined"

**Cause:** CDN script not loaded

**Solution:**
```php
// Check script enqueue order in functions.php
// tmr-app must depend on supabase-js
wp_enqueue_script('tmr-app', '...', ['supabase-js'], ...);
```

### "Invalid API key"

**Cause:** Wrong key or not loaded from env

**Solution:**
```php
// Debug in functions.php
error_log('Supabase Key: ' . getenv('SUPABASE_PUBLISHABLE_KEY'));

// Check wp_localize_script passes key correctly
```

### "Row Level Security policy violation"

**Cause:** RLS policy doesn't allow operation

**Solution:**
1. Check Supabase dashboard → Authentication → Policies
2. Ensure user ID matches policy requirements
3. Test with service role key (bypasses RLS) to isolate issue

### Forms not submitting

**Cause:** Event listeners not attached

**Solution:**
```javascript
// Ensure DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Your initialization code
});
```

---

## Next Steps

1. ✅ Complete [SETUP-SECRETS.md](./SETUP-SECRETS.md)
2. ✅ Create assets directory structure
3. ✅ Implement authentication UI
4. ✅ Build survey submission
5. ✅ Create insights dashboard
6. ✅ Test end-to-end flow
7. ✅ Deploy to production

---

## Resources

- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Main Reference: supabase.md](./supabase.md)
- [Setup Secrets: SETUP-SECRETS.md](./SETUP-SECRETS.md)
