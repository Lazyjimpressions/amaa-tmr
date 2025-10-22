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
  
  // LoginModal Component
  function LoginModal({ isOpen, onClose, redirectTo = 'dashboard', supabaseConfig }) {
    const [email, setEmail] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState(false);

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
    const [showModal, setShowModal] = React.useState(false);
    
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
      ReactDOM.render(React.createElement(HeaderLoginManager), modalRoot);
      
      // Wire up header login button
      const loginBtn = document.getElementById('header-login-btn');
      if (loginBtn) {
        loginBtn.addEventListener('click', () => {
          // Trigger modal open via custom event
          window.dispatchEvent(new CustomEvent('open-login-modal'));
        });
      }
    }
  });
})();
