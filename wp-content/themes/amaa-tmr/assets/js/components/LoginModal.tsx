import { h } from 'preact';
import { useState } from 'preact/hooks';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string; // 'survey' or 'dashboard'
  supabaseConfig: {
    url: string;
    anonKey: string;
  };
}

export function LoginModal({ isOpen, onClose, redirectTo = 'survey', supabaseConfig }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: Event) => {
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
        // Keep modal open to show success message
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

  return h('div', { className: 'login-modal-overlay', onClick: onClose }, [
    h('div', { 
      className: 'login-modal-content',
      onClick: (e: Event) => e.stopPropagation()
    }, [
      h('button', {
        className: 'login-modal-close',
        onClick: onClose,
        'aria-label': 'Close'
      }, '×'),
      
      h('div', { className: 'login-modal-header' }, [
        h('h2', {}, 'Sign In'),
        h('p', {}, 'Enter your email to receive a magic link')
      ]),

      success ? (
        h('div', { className: 'login-modal-success' }, [
          h('div', { className: 'success-icon' }, '✓'),
          h('h3', {}, 'Check your email!'),
          h('p', {}, `We sent a magic link to ${email}`),
          h('p', { className: 'success-hint' }, 'Click the link in the email to sign in.'),
          h('button', {
            className: 'btn btn-primary',
            onClick: onClose
          }, 'Got it')
        ])
      ) : (
        h('form', { onSubmit: handleSubmit, className: 'login-modal-form' }, [
          h('div', { className: 'form-group' }, [
            h('label', { htmlFor: 'login-email' }, 'Email Address'),
            h('input', {
              id: 'login-email',
              type: 'email',
              className: 'input',
              value: email,
              onInput: (e: any) => setEmail(e.target.value),
              placeholder: 'you@example.com',
              required: true,
              disabled: isLoading
            })
          ]),

          error && h('div', { className: 'error-message' }, error),

          h('button', {
            type: 'submit',
            className: 'btn btn-primary btn-large',
            disabled: isLoading || !email
          }, isLoading ? 'Sending...' : 'Send Magic Link'),

          h('p', { className: 'login-modal-hint' }, [
            'New to AM&AA TMR? ',
            h('a', { href: '/about', target: '_blank' }, 'Learn more')
          ])
        ])
      )
    ])
  ]);
}
