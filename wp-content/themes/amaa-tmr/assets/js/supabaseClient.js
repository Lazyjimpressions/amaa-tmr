/**
 * Supabase Client Initialization
 * Centralized client for consistent session state across all components
 * Version: 1.0.0
 * Date: 2025-01-22
 */

// Configuration (use constants already defined in functions.php)
const SUPABASE_URL = 'https://ffgjqlmulaqtfopgwenf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pxbG11bGFxdGZvcGd3ZW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTU2ODEsImV4cCI6MjA3NTE3MTY4MX0.dR0jytzP7h07DkaYdFwkrqyCAZOfVWUfzJwfiJy_O5g';

// Initialize client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth state listener for debugging and session management
supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Supabase Auth event:', event);
    if (event === 'SIGNED_IN') {
        console.log('✅ User signed in:', session?.user?.email);
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('supabase-auth-change', {
            detail: { event, session }
        }));
    } else if (event === 'SIGNED_OUT') {
        console.log('❌ User signed out');
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('supabase-auth-change', {
            detail: { event, session: null }
        }));
    }
});

// Export for other scripts
window.supabaseClient = supabaseClient;

// For ES modules (future-proofing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = supabaseClient;
}
