# TMR Supabase Bridge Plugin

## Overview
This WordPress plugin provides Supabase authentication and membership gating for The Market Report (TMR). It integrates with Supabase Edge Functions to check membership status and provides shortcodes for content gating.

## Features
- ✅ **Magic Link Authentication** via Supabase Auth
- ✅ **Membership Status Checking** via `/me` Edge Function
- ✅ **Content Gating** with `[tmr_member_only]` shortcode
- ✅ **Caching** (5-minute TTL) to reduce API calls
- ✅ **Client-side UI Gating** for MVP
- ✅ **CORS Configuration** support

## Installation & Setup

### 1. Plugin Configuration
Go to **WordPress Admin → Settings → TMR Supabase Bridge** and configure:

- **Supabase URL**: `https://ffgjqlmulaqtfopgwenf.supabase.co`
- **Supabase Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pxbG11bGFxdGZvcGd3ZW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTU2ODEsImV4cCI6MjA3NTE3MTY4MX0.dR0jytzP7h07DkaYdFwkrqyCAZOfVWUfzJwfiJy_O5g`
- **Edge Functions Base URL**: `https://ffgjqlmulaqtfopgwenf.functions.supabase.co`
- **Teaser (HubSpot) URL**: Your HubSpot teaser file URL

### 2. Supabase CORS Configuration
Add to your Supabase Edge Functions environment variables:
```
ALLOWED_ORIGIN="https://marketrepstg.wpenginepowered.com"
```

### 3. Test the Plugin
Create a test page with the `page-test-plugin.html` template or add `?test=plugin` to any page URL.

## Usage

### Shortcodes

#### Login Form
```
[tmr_login]
```
Displays a magic link login form.

#### Logout Button
```
[tmr_logout]
```
Displays a logout button.

#### Member-Only Content
```
[tmr_member_only fallback="Custom fallback message"]
Your member-only content here
[/tmr_member_only]
```
Shows content only to members. Non-members see the fallback message.

### JavaScript API

The plugin exposes a global `window.TMRUser` object:
```javascript
{
  isLoggedIn: boolean,
  isMember: boolean,
  email: string | null,
  membership_level: string | null
}
```

### React Integration
Your React components can access the user state:
```javascript
// Check if user is logged in
if (window.TMRUser?.isLoggedIn) {
  // User is authenticated
}

// Check if user is a member
if (window.TMRUser?.isMember) {
  // User is a member
}
```

## File Structure
```
wp-content/plugins/supabase-bridge/
├── supabase-bridge.php          # Main plugin file
├── assets/
│   ├── tmr-auth.js             # Core authentication logic
│   └── tmr-test.js             # Test page functionality
└── README.md                   # This file
```

## Caching Strategy
- **Membership status** is cached for 5 minutes in `sessionStorage`
- **Cache key**: `tmr_membership_v1`
- **Cache invalidation**: On logout, login, or manual refresh

## Security Considerations
- **Client-side gating** for MVP (server-side hardening can be added later)
- **JWT tokens** stored in Supabase's secure session management
- **CORS** properly configured for your domain
- **Environment variables** stored securely in WordPress options

## Troubleshooting

### Common Issues

1. **"Missing Supabase config" warning**
   - Check that all fields are filled in the plugin settings
   - Verify the Supabase URL and anon key are correct

2. **CORS errors**
   - Ensure `ALLOWED_ORIGIN` is set in Supabase Edge Functions
   - Check that your domain matches the allowed origin

3. **Membership not updating**
   - Clear browser cache and sessionStorage
   - Check that the HubSpot webhook is working
   - Verify the `/me` Edge Function is responding correctly

### Debug Mode
Add `?test=plugin` to any page URL to enable debug information and test functionality.

## Next Steps
- Add server-side hardening with signed URLs
- Implement download gating for full reports
- Add analytics tracking for authentication events
- Create admin tools for testing membership status
