(function() {
  'use strict';
  
  // Wait for React to be available
  function waitForReact() {
    return new Promise((resolve) => {
      if (window.React && window.ReactDOM) {
        resolve();
      } else {
        setTimeout(() => waitForReact().then(resolve), 100);
      }
    });
  }
  
          // Use centralized Supabase client
          const supabaseClient = window.supabaseClient;
          
          if (!supabaseClient) {
            console.error('❌ Supabase client not loaded');
            return;
          }
          
          console.log('🔧 Using centralized Supabase client for header login');
  
  // Make sure React hooks are available
  const { useState, useEffect } = React;
  
  // LoginModal Component
  function LoginModal({ isOpen, onClose, redirectTo = 'dashboard' }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

            const handleSubmit = async (e) => {
              e.preventDefault();
              setError('');
              setIsLoading(true);

              try {
                const redirectPath = redirectTo === 'dashboard' ? '/dashboard' : '/survey';
                const fullRedirectUrl = `${window.location.origin}/auth/confirm?next=${encodeURIComponent(redirectPath)}`;
                
                console.log('🔍 Header Magic Link Debug:');
                console.log('  - Full Redirect URL:', fullRedirectUrl);
                
                const { error } = await supabaseClient.auth.signInWithOtp({
                    email: email.toLowerCase(),
                    options: {
                        shouldCreateUser: false,
                        emailRedirectTo: fullRedirectUrl
                    }
                });

                console.log('  - Magic link result:', error ? 'Error' : 'Success');
                console.log('  - Error details:', error);

                if (error) {
                    throw new Error(error.message);
                } else {
                    setSuccess(true);
                }
              } catch (err) {
                setError(err.message || 'Failed to send magic link. Please try again.');
                console.error('Magic link error:', err);
              } finally {
                setIsLoading(false);
              }
            };

    if (!isOpen) return null;

    return React.createElement('div', { 
      className: 'login-modal-overlay', 
      onClick: onClose 
    }, [
      React.createElement('div', { 
        className: 'login-modal-content',
        onClick: (e) => e.stopPropagation()
      }, [
        React.createElement('button', {
          className: 'login-modal-close',
          onClick: onClose,
          'aria-label': 'Close'
        }, '×'),
        
        React.createElement('div', { className: 'login-modal-header' }, [
          React.createElement('h2', {}, 'Sign In'),
          React.createElement('p', {}, 'Enter your email to receive a magic link')
        ]),

        success ? (
          React.createElement('div', { className: 'login-modal-success' }, [
            React.createElement('div', { className: 'success-icon' }, '✓'),
            React.createElement('h3', {}, 'Check your email!'),
            React.createElement('p', {}, `We sent a magic link to ${email}`),
            React.createElement('p', { className: 'success-hint' }, 'Click the link in the email to sign in.'),
            React.createElement('button', {
              className: 'btn btn-primary',
              onClick: onClose
            }, 'Got it')
          ])
        ) : (
          React.createElement('form', { onSubmit: handleSubmit, className: 'login-modal-form' }, [
            React.createElement('div', { className: 'form-group' }, [
              React.createElement('label', { htmlFor: 'login-email' }, 'Email Address'),
              React.createElement('input', {
                id: 'login-email',
                type: 'email',
                className: 'input',
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: 'you@example.com',
                required: true,
                disabled: isLoading
              })
            ]),

            error && React.createElement('div', { className: 'error-message' }, error),

            React.createElement('button', {
              type: 'submit',
              className: 'btn btn-primary btn-large',
              disabled: isLoading || !email
            }, isLoading ? 'Sending...' : 'Send Magic Link'),

            React.createElement('p', { className: 'login-modal-hint' }, [
              'New to AM&AA TMR? ',
              React.createElement('a', { href: '/about', target: '_blank' }, 'Learn more')
            ])
          ])
        )
      ])
    ]);
  }
  
  function HeaderLoginManager() {
    const [showModal, setShowModal] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userData, setUserData] = useState(null);
    
    // Check authentication state on mount
    useEffect(() => {
      const checkAuth = () => {
        const token = localStorage.getItem('supabase_token');
        const storedUserData = localStorage.getItem('supabase_user_data');
        
        if (token && storedUserData) {
          try {
            const user = JSON.parse(storedUserData);
            setIsAuthenticated(true);
            setUserData(user);
          } catch (e) {
            console.error('Error parsing user data:', e);
            setIsAuthenticated(false);
            setUserData(null);
          }
        } else {
          setIsAuthenticated(false);
          setUserData(null);
        }
      };
      
      checkAuth();
      
      // Listen for auth state changes
      const handleAuthChange = () => checkAuth();
      window.addEventListener('supabase-auth-change', handleAuthChange);
      
      return () => {
        window.removeEventListener('supabase-auth-change', handleAuthChange);
      };
    }, []);
    
    // Listen for open modal event
    useEffect(() => {
      const handleOpenModal = () => {
        console.log('📣 Opening login modal...');
        setShowModal(true);
      };
      
      window.addEventListener('open-login-modal', handleOpenModal);
      window.openLoginModal = handleOpenModal;
      
      return () => {
        window.removeEventListener('open-login-modal', handleOpenModal);
      };
    }, []);
    
    // Render authentication state component (reusable)
    const AuthState = () => {
      if (isAuthenticated && userData) {
        const initials = (userData.first_name?.[0] || '') + (userData.last_name?.[0] || '') || userData.email?.[0] || 'U';
        return React.createElement('div', { className: 'user-avatar' }, [
          React.createElement('div', { 
            className: 'avatar-circle',
            onClick: () => {
              const dropdown = document.getElementById('user-dropdown');
              if (dropdown) dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            }
          }, initials),
          React.createElement('div', { 
            className: 'user-dropdown', 
            id: 'user-dropdown',
            style: { display: 'none' }
          }, [
            React.createElement('a', { href: '/app/dashboard' }, 'Dashboard'),
            React.createElement('a', { href: '/app/profile' }, 'Profile'),
            React.createElement('a', { 
              href: '#',
              onClick: (e) => {
                e.preventDefault();
                localStorage.removeItem('supabase_token');
                localStorage.removeItem('supabase_refresh_token');
                localStorage.removeItem('supabase_user_data');
                window.dispatchEvent(new CustomEvent('supabase-auth-change'));
                window.location.reload();
              }
            }, 'Logout')
          ])
        ]);
      } else {
        return React.createElement('button', {
          className: 'btn btn-secondary',
          onClick: () => setShowModal(true)
        }, 'Log In');
      }
    };
    
    // Get target elements for portals
    const desktopAuthState = document.getElementById('supabase-auth-state');
    const mobileAuthState = document.getElementById('mobile-login-container');
    
    return React.createElement('div', {}, [
      // Modal (appears once)
      React.createElement(LoginModal, {
        key: 'modal',
        isOpen: showModal,
        onClose: () => setShowModal(false),
        redirectTo: 'dashboard'
      }),
      
      // Desktop auth state (portal)
      desktopAuthState && ReactDOM.createPortal(
        React.createElement(AuthState),
        desktopAuthState
      ),
      
      // Mobile auth state (portal)
      mobileAuthState && ReactDOM.createPortal(
        React.createElement(AuthState),
        mobileAuthState
      )
    ]);
  }
  
  // Initialize when React is available
  waitForReact().then(() => {
    console.log('✅ Initializing Supabase authentication with single mount point');
    
    // Mount ONLY in modal root - it will handle all other locations via portals
    const modalRoot = document.getElementById('login-modal-root');
    if (modalRoot) {
      console.log('✅ Mounting single HeaderLoginManager instance');
      if (ReactDOM.createRoot) {
        const root = ReactDOM.createRoot(modalRoot);
        root.render(React.createElement(HeaderLoginManager));
      } else {
        ReactDOM.render(React.createElement(HeaderLoginManager), modalRoot);
      }
    }
  });
})();
