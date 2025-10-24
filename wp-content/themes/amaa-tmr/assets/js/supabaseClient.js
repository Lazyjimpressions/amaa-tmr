/**
 * Supabase Client Initialization + Helpers
 * Centralized client for consistent session state across all components
 * Version: 2.1.0 - Dynamic Loading Fix
 * Date: 2025-01-22
 */

console.log('🚀 SupabaseClient.js v2.1.0 - Dynamic Loading Fix');

// Configuration (use constants already defined in functions.php)
const SUPABASE_URL = 'https://ffgjqlmulaqtfopgwenf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pxbG11bGFxdGZvcGd3ZW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTU2ODEsImV4cCI6MjA3NTE3MTY4MX0.dR0jytzP7h07DkaYdFwkrqyCAZOfVWUfzJwfiJy_O5g';

// Wait for Supabase to be available, then initialize client
let supabaseClient;

if (window.supabase) {
    // Supabase CDN is already loaded
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    // Load Supabase CDN dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client loaded dynamically');
    };
    script.onerror = () => {
        console.error('❌ Failed to load Supabase CDN');
    };
    document.head.appendChild(script);
}

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
     * Wait for Supabase client to be ready
     * @returns {Promise<object>} Supabase client
     */
    async waitForClient() {
        while (!supabaseClient) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return supabaseClient;
    },

    /**
     * Get the current Supabase session (user + token)
     * @returns {Promise<object|null>} user or null
     */
    async getCurrentUser() {
        const client = await this.waitForClient();
        const { data: { session }, error } = await client.auth.getSession();
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

        return new Promise(async (resolve, reject) => {
            const client = await this.waitForClient();
            const unsub = client.auth.onAuthStateChange((event, session) => {
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
        const client = await this.waitForClient();
        const { data: { session } } = await client.auth.getSession();
        return session?.access_token || null;
    },

    /**
     * Sign out and broadcast logout to all listeners
     */
    async signOut() {
        const client = await this.waitForClient();
        const { error } = await client.auth.signOut();
        
        if (error) {
            console.error('Sign-out error:', error.message);
        } else {
            log('✅ User signed out successfully');
            
            // Clear all session data from localStorage
            localStorage.removeItem('supabase_user_data');
            localStorage.removeItem('supabase.auth.token');
            localStorage.removeItem('supabase.auth.refresh_token');
            
            // Clear any other session-related data
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.includes('supabase')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Broadcast logout event to all components
            window.dispatchEvent(new CustomEvent('supabase-auth-change', { 
                detail: null 
            }));
            
            // Dispatch custom logout event for additional cleanup
            window.dispatchEvent(new CustomEvent('supabase-logout', { 
                detail: { timestamp: Date.now() }
            }));
            
            log('🧹 Cleared all session data and broadcasted logout events');
        }
    }
};

// Export globally
window.supabaseClient = supabaseClient;
window.supabaseHelpers = window.supabaseHelpers;

// Update global client when it becomes available
if (!supabaseClient) {
    const checkClient = setInterval(() => {
        if (supabaseClient) {
            window.supabaseClient = supabaseClient;
            clearInterval(checkClient);
        }
    }, 100);
}

console.log('✅ Supabase client & helpers initialized');

// For ES modules (future-proofing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = supabaseClient;
}
