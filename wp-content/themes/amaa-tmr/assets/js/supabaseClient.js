/**
 * Supabase Client Initialization + Helpers
 * Centralized client for consistent session state across all components
 * Version: 2.2.0 - AuthManager Logout Fallback Fix
 * Date: 2025-10-24
 */

console.log('🚀 SupabaseClient.js v2.2.0 - AuthManager Logout Fallback Fix');

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

// --- Auth Event Logging (Legacy - AuthManager handles this now) ---
// Removed duplicate auth listener - AuthManager handles all auth events

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
     * DEPRECATED: Use AuthManager.signOut() instead
     * Kept for backward compatibility
     */
    async signOut() {
        console.warn('⚠️ supabaseHelpers.signOut() is deprecated. Use AuthManager.signOut() instead.');
        
        // Delegate to AuthManager if available
        if (window.authManager) {
            return await window.authManager.signOut();
        }
        
        // Fallback to direct Supabase call
        const client = await this.waitForClient();
        const { error } = await client.auth.signOut();
        
        if (error) {
            console.error('Sign-out error:', error.message);
            throw error;
        } else {
            log('✅ User signed out successfully (legacy method)');
            localStorage.removeItem('supabase_user_data');
        }
    }
};

/**
 * Centralized Authentication Manager
 * Handles auth state, cross-tab sync, and event broadcasting
 */
class AuthManager {
    constructor() {
        this.state = {
            user: null,
            session: null,
            loading: true,
            error: null
        };
        this.listeners = [];
        this.broadcastChannel = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize Supabase client
            this.client = await window.supabaseHelpers.waitForClient();
            
            // Set up cross-tab communication
            this.setupCrossTabSync();
            
            // Set up auth state listener
            this.setupAuthListener();
            
            // Initial auth check
            await this.checkAuthState();
            
        } catch (error) {
            console.error('❌ AuthManager initialization failed:', error);
            this.setState({ error: error.message, loading: false });
        }
    }
    
    setupCrossTabSync() {
        // Use BroadcastChannel for cross-tab communication
        if (typeof BroadcastChannel !== 'undefined') {
            this.broadcastChannel = new BroadcastChannel('supabase-auth');
            this.broadcastChannel.onmessage = (event) => {
                this.handleCrossTabMessage(event.data);
            };
        }
    }
    
    setupAuthListener() {
        this.client.auth.onAuthStateChange((event, session) => {
            console.log(`🔐 AuthManager: ${event}`, session?.user?.email || 'No user');
            
            this.setState({
                user: session?.user || null,
                session: session,
                loading: false,
                error: null
            });
            
            // Broadcast to other tabs
            this.broadcastToTabs({
                type: 'AUTH_STATE_CHANGE',
                event,
                user: session?.user || null,
                session: session
            });
            
            // Dispatch custom events for components
            this.dispatchAuthEvent(event, session);
        });
    }
    
    async checkAuthState() {
        try {
            const [userResult, sessionResult] = await Promise.all([
                this.client.auth.getUser(),
                this.client.auth.getSession()
            ]);
            
            const user = userResult.data.user;
            const session = sessionResult.data.session;
            
            this.setState({
                user,
                session,
                loading: false,
                error: null
            });
            
            // Cache user data for performance (not for auth)
            if (user) {
                localStorage.setItem('supabase_user_data', JSON.stringify(user));
            }
            
        } catch (error) {
            console.error('❌ Auth state check failed:', error);
            this.setState({ error: error.message, loading: false });
        }
    }
    
    setState(newState) {
        const prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        
        // Notify listeners
        this.listeners.forEach(listener => {
            listener(this.state, prevState);
        });
    }
    
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }
    
    handleCrossTabMessage(data) {
        switch (data.type) {
            case 'AUTH_STATE_CHANGE':
                // Update state from other tab
                this.setState({
                    user: data.user,
                    session: data.session,
                    loading: false
                });
                break;
                
            case 'LOGOUT':
                // Handle logout from other tab
                this.setState({
                    user: null,
                    session: null,
                    loading: false
                });
                break;
        }
    }
    
    broadcastToTabs(message) {
        if (this.broadcastChannel) {
            this.broadcastChannel.postMessage(message);
        }
    }
    
    dispatchAuthEvent(event, session) {
        // Dispatch custom events for backward compatibility
        window.dispatchEvent(new CustomEvent('supabase-auth-change', {
            detail: session?.user || null
        }));
        
        if (event === 'SIGNED_OUT') {
            window.dispatchEvent(new CustomEvent('supabase-logout', {
                detail: { timestamp: Date.now() }
            }));
        }
    }
    
    async signOut() {
        try {
            // Check if client is available
            if (!this.client) {
                console.warn('⚠️ AuthManager: Client not available, using legacy logout');
                return await window.supabaseHelpers.signOut();
            }
            
            const { error } = await this.client.auth.signOut();
            
            if (error) {
                throw error;
            }
            
            // Clear cached data
            localStorage.removeItem('supabase_user_data');
            
            // Update state
            this.setState({
                user: null,
                session: null,
                loading: false,
                error: null
            });
            
            // Broadcast logout to other tabs
            this.broadcastToTabs({
                type: 'LOGOUT',
                timestamp: Date.now()
            });
            
            // Dispatch events
            this.dispatchAuthEvent('SIGNED_OUT', null);
            
            console.log('✅ AuthManager: Logout successful');
            
        } catch (error) {
            console.error('❌ AuthManager: Logout failed:', error);
            this.setState({ error: error.message });
            throw error;
        }
    }
    
    getState() {
        return { ...this.state };
    }
    
    isAuthenticated() {
        return !!(this.state.user && this.state.session);
    }
    
    getUser() {
        return this.state.user;
    }
    
    getSession() {
        return this.state.session;
    }
    
    isLoading() {
        return this.state.loading;
    }
    
    getError() {
        return this.state.error;
    }
}

// Export globally
window.supabaseClient = supabaseClient;
window.supabaseHelpers = window.supabaseHelpers;
window.AuthManager = AuthManager;

// Initialize global AuthManager instance
let globalAuthManager = null;

// Initialize AuthManager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!globalAuthManager) {
        globalAuthManager = new AuthManager();
        window.authManager = globalAuthManager;
        console.log('🚀 Global AuthManager initialized');
    }
});

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded
    if (!globalAuthManager) {
        globalAuthManager = new AuthManager();
        window.authManager = globalAuthManager;
        console.log('🚀 Global AuthManager initialized (DOM already loaded)');
    }
}

// Global client is set above - no need for polling

console.log('✅ Supabase client & helpers initialized');

// For ES modules (future-proofing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = supabaseClient;
}
