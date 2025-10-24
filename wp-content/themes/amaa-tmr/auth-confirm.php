<?php
/**
 * Auth Confirmation Handler
 * Handles magic link token verification and redirects
 */

// Get URL parameters
$token_hash = $_GET['token_hash'] ?? '';
$type = $_GET['type'] ?? '';
$next = $_GET['next'] ?? '/';

// If no token, redirect to homepage
if (empty($token_hash) || empty($type)) {
    wp_redirect(home_url('/'));
    exit;
}

// Decode the next URL
$next_url = urldecode($next);
?>
<!DOCTYPE html>
<html>
<head>
    <title>Confirming Login...</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: #f8fafc;
        }
        .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .spinner {
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3b82f6;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .error {
            color: #dc2626;
            background: #fef2f2;
            border: 1px solid #fecaca;
            padding: 1rem;
            border-radius: 6px;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <p>Confirming your login...</p>
    </div>
    
    <script>
        const { createClient } = supabase;
        const supabaseClient = createClient(
            'https://ffgjqlmulaqtfopgwenf.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pxbG11bGFxdGZvcGd3ZW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTU2ODEsImV4cCI6MjA3NTE3MTY4MX0.dR0jytzP7h07DkaYdFwkrqyCAZOfVWUfzJwfiJy_O5g'
        );
        
        // AuthManager will handle session management
        // Just dispatch events for backward compatibility
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                console.log('✅ Auth confirm: User signed in, AuthManager will handle session');
                // Dispatch event to notify other components
                window.dispatchEvent(new CustomEvent('supabase-auth-change', { detail: session.user }));
            }
        });
        
        async function confirm() {
            const params = new URLSearchParams(window.location.search);
            const token_hash = params.get('token_hash');
            const type = params.get('type');
            const next = params.get('next') || '/';
            
            console.log('🔍 Auth Confirm Debug:');
            console.log('  - Token hash:', token_hash);
            console.log('  - Type:', type);
            console.log('  - Next URL:', next);
            
            if (token_hash && type) {
                try {
                    const { error } = await supabaseClient.auth.verifyOtp({
                        token_hash,
                        type: type
                    });
                    
                    console.log('  - Verification result:', error ? 'Error' : 'Success');
                    
                    if (!error) {
                        console.log('  - Redirecting to:', next);
                        // Small delay to ensure session is stored
                        setTimeout(() => {
                            window.location.href = next;
                        }, 500);
                    } else {
                        console.error('  - Verification error:', error);
                        document.querySelector('.container').innerHTML = `
                            <div class="error">
                                <h2>Authentication Error</h2>
                                <p><strong>Error:</strong> ${error.message}</p>
                                <p>This link may have expired or is invalid. Please request a new magic link.</p>
                                <div class="error-actions">
                                    <a href="/survey" class="btn btn-primary">Request New Link</a>
                                    <a href="/" class="btn btn-secondary">Return to Homepage</a>
                                </div>
                            </div>
                        `;
                    }
                } catch (err) {
                    console.error('  - Exception:', err);
                    document.querySelector('.container').innerHTML = `
                        <div class="error">
                            <h2>Unexpected Error</h2>
                            <p>Something went wrong during authentication. Please try again.</p>
                            <div class="error-actions">
                                <a href="/survey" class="btn btn-primary">Try Again</a>
                                <a href="/" class="btn btn-secondary">Return to Homepage</a>
                            </div>
                        </div>
                    `;
                }
            } else {
                console.error('  - Missing parameters');
                document.querySelector('.container').innerHTML = `
                    <div class="error">
                        <p><strong>Invalid confirmation link</strong></p>
                        <p><a href="/">Return to homepage</a></p>
                    </div>
                `;
            }
        }
        
        // Start confirmation process
        confirm();
    </script>
</body>
</html>
