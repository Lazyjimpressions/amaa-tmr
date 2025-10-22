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
  
  const supabaseConfig = window.supabaseConfig || {
    url: 'https://ffgjqlmulaqtfopgwenf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pxbG11bGFxdGZvcGd3ZW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTU2ODEsImV4cCI6MjA3NTE3MTY4MX0.dR0jytzP7h07DkaYdFwkrqyCAZOfVWUfzJwfiJy_O5g'
  };
  
  // Make sure React hooks are available
  const { useState, useEffect } = React;
  
  // LoginModal Component
  function LoginModal({ isOpen, onClose, redirectTo = 'dashboard', supabaseConfig }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      try {
        const redirectPath = redirectTo === 'dashboard' ? '/app/dashboard' : '/survey';
        
        const response = await fetch(`${supabaseConfig.url}/auth/v1/magiclink`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseConfig.anonKey
          },
          body: JSON.stringify({
            email: email.toLowerCase(),
            options: {
              emailRedirectTo: `${window.location.origin}${redirectPath}`
            }
          })
        });

        if (response.ok) {
          setSuccess(true);
        } else {
          throw new Error('Failed to send magic link');
        }
      } catch (err) {
        setError('Failed to send magic link. Please try again.');
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
    
    // Listen for open modal event
    useEffect(() => {
      const handleOpenModal = () => {
        console.log('📣 Opening login modal...');
        setShowModal(true);
      };
      
      window.addEventListener('open-login-modal', handleOpenModal);
      
      // Also expose global function for direct access
      window.openLoginModal = handleOpenModal;
      
      return () => {
        window.removeEventListener('open-login-modal', handleOpenModal);
      };
    }, []);
    
    return React.createElement(LoginModal, {
      isOpen: showModal,
      onClose: () => setShowModal(false),
      redirectTo: 'dashboard',
      supabaseConfig: supabaseConfig
    });
  }
  
  // Initialize when React is available
  waitForReact().then(() => {
    const modalRoot = document.getElementById('login-modal-root');
    if (modalRoot) {
      console.log('✅ Mounting header login manager');
      
      // Use createRoot for React 18+
      if (ReactDOM.createRoot) {
        const root = ReactDOM.createRoot(modalRoot);
        root.render(React.createElement(HeaderLoginManager));
      } else {
        ReactDOM.render(React.createElement(HeaderLoginManager), modalRoot);
      }
      
      // Wire up header login button
      setTimeout(() => {
        const loginBtn = document.getElementById('header-login-btn');
        if (loginBtn) {
          console.log('✅ Wiring up header login button');
          loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔘 Header login button clicked');
            window.dispatchEvent(new CustomEvent('open-login-modal'));
          });
        } else {
          console.warn('⚠️ Header login button not found');
        }
      }, 100);
    } else {
      console.error('❌ #login-modal-root not found');
    }
  });
})();
