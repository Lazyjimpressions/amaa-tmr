/**
 * Supabase Client Initialization + Helpers
 * Centralized client for consistent session state across all components
 * Version: 2.0.0
 * Date: 2025-01-22
 */

// Configuration (use constants already defined in functions.php)
const SUPABASE_URL = 'https://ffgjqlmulaqtfopgwenf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pxbG11bGFxdGZvcGd3ZW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTU2ODEsImV4cCI6MjA3NTE3MTY4MX0.dR0jytzP7h07DkaYdFwkrqyCAZOfVWUfzJwfiJy_O5g';

// Initialize client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Optional Debug Mode ---
const DEBUG = true;
function log(...args) {
    if (DEBUG) console.log(...args);
}

// --- Auth Event Logging ---
supabaseClient.auth.onAuthStateChange((event, session) => {
    log('🔐 Supabase Auth Event:', event);
    if (event === 'SIGNED_IN') {
        log('✅ User signed in:', session?.user?.email);
        window.dispatchEvent(new CustomEvent('supabase-auth-change', { detail: session?.user }));
    } else if (event === 'SIGNED_OUT') {
        log('🚪 User signed out');
        window.dispatchEvent(new CustomEvent('supabase-auth-change', { detail: null }));
    }
});

// =====================================
// 🔧 Global Helper Methods
// =====================================
window.supabaseHelpers = {
    /**
     * Get the current Supabase session (user + token)
     * @returns {Promise<object|null>} user or null
     */
    async getCurrentUser() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error('Error getting session:', error.message);
            return null;
        }
        return session?.user || null;
    },

    /**
     * Wait until a user is signed in (useful for deferred components)
     */
    async waitForSignIn(timeoutMs = 5000) {
        const start = Date.now();
        let user = await this.getCurrentUser();
        if (user) return user;

        return new Promise((resolve, reject) => {
            const unsub = supabaseClient.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    unsub.data.subscription.unsubscribe();
                    resolve(session.user);
                }
            });
            setTimeout(() => {
                unsub.data.subscription.unsubscribe();
                reject(new Error('Timeout waiting for user sign-in'));
            }, timeoutMs);
        });
    },

    /**
     * Get the current access token for authenticated API calls
     * @returns {Promise<string|null>} access token or null
     */
    async getAccessToken() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        return session?.access_token || null;
    },

    /**
     * Sign out and broadcast logout to all listeners
     */
    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) console.error('Sign-out error:', error.message);
        else log('✅ User signed out successfully');
    }
};

// Export globally
window.supabaseClient = supabaseClient;

// For ES modules (future-proofing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = supabaseClient;
}
