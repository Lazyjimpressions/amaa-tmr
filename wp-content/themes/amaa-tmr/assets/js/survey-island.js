/**
 * AM&AA TMR Survey Island - Refactored Version
 * Modal-first authentication + 2-page survey structure
 * Version: 3.1.0 - Fixed DOM container ID mismatch
 * Date: 2025-10-22
 */

(function() {
    'use strict';
    
    console.log('🚀 Survey Island Script Loading... [MODAL_AUTH_v3.0.0]');

    // Global configuration from WordPress
    const supabaseConfig = window.supabaseConfig || {
        url: 'https://ffgjqlmulaqtfopgwenf.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pxbG11bGFxdGZvcGd3ZW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTU2ODEsImV4cCI6MjA3NTE3MTY4MX0.dR0jytzP7h07DkaYdFwkrqyCAZOfVWUfzJwfiJy_O5g'
    };
    
    console.log('🔧 Supabase Config:', supabaseConfig);

    // React components
    const { useState, useEffect, useRef, createElement } = React;
    const h = createElement;

    // LoginModal Component
    function LoginModal({ isOpen, onClose, redirectTo = 'survey', supabaseConfig }) {
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
                        const fullRedirectUrl = `${window.location.origin}${redirectPath}`;
                        
                        // 🔍 DEBUG: Log what we're sending
                        console.log('🔍 Magic Link Debug:');
                        console.log('  - Origin:', window.location.origin);
                        console.log('  - Redirect Path:', redirectPath);
                        console.log('  - Full Redirect URL:', fullRedirectUrl);
                        console.log('  - Supabase URL:', supabaseConfig.url);
                        
                        const requestBody = {
                            email: email.toLowerCase(),
                            options: {
                                emailRedirectTo: fullRedirectUrl
                            }
                        };
                        
                        console.log('  - Request Body:', JSON.stringify(requestBody, null, 2));
                        
                        const response = await fetch(`${supabaseConfig.url}/auth/v1/magiclink`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'apikey': supabaseConfig.anonKey
                            },
                            body: JSON.stringify(requestBody)
                        });

                        console.log('  - Response Status:', response.status);
                        const responseData = await response.json();
                        console.log('  - Response Data:', responseData);

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

        return h('div', { className: 'login-modal-overlay', onClick: onClose }, [
            h('div', { 
                className: 'login-modal-content',
                onClick: (e) => e.stopPropagation()
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
                                onInput: (e) => setEmail(e.target.value),
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

    // UserProfilePage Component (Page 1)
    function UserProfilePage({ onNext, onSave }) {
        const [formData, setFormData] = useState({
            email: '',
            first_name: '',
            last_name: '',
            profession: '',
            us_zip_code: '',
            country: 'United States'
        });
        const [errors, setErrors] = useState({});
        const [isSaving, setIsSaving] = useState(false);

        // Load user email from token on mount
        useEffect(() => {
            const token = localStorage.getItem('supabase_token');
            const userData = localStorage.getItem('supabase_user_data');
            if (token && userData) {
                try {
                    const user = JSON.parse(userData);
                    setFormData(prev => ({ ...prev, email: user.email }));
                    
                    // Fetch HubSpot data if available
                    fetchHubSpotData(user.email);
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
        }, []);

        const fetchHubSpotData = async (email) => {
            try {
                const response = await fetch(`${supabaseConfig.url}/functions/v1/check-membership`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.found) {
                        setFormData(prev => ({
                            ...prev,
                            first_name: data.first_name || '',
                            last_name: data.last_name || '',
                            profession: data.profession || '',
                            us_zip_code: data.us_zip_code || '',
                            country: data.country || 'United States'
                        }));
                    }
                }
            } catch (error) {
                console.error('Error fetching HubSpot data:', error);
            }
        };

        const handleSubmit = async () => {
            if (!validateForm()) return;
            
            setIsSaving(true);
            try {
                // 1. Save to survey_non_deal_responses
                await onSave('user_profile', formData);
                
                // 2. Create/update HubSpot contact
                const token = localStorage.getItem('supabase_token');
                const hubspotResponse = await fetch(`${supabaseConfig.url}/functions/v1/hubspot-contact-create`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        profession: formData.profession,
                        us_zip_code: formData.us_zip_code,
                        country: formData.country
                    })
                });
                
                if (!hubspotResponse.ok) {
                    console.warn('HubSpot contact creation failed (non-blocking)');
                }
                
                // 3. Proceed to next page
                onNext();
            } catch (error) {
                console.error('Error saving user profile:', error);
                alert('Error saving profile. Please try again.');
            } finally {
                setIsSaving(false);
            }
        };

        const validateForm = () => {
            const newErrors = {};
            if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
            if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        return h('div', { className: 'survey-page user-profile-page' }, [
            h('div', { className: 'page-header' }, [
                h('h2', { className: 'page-title' }, 'About You'),
                h('p', { className: 'page-description' }, 'Please complete your profile to continue.')
            ]),
            
            // Email as read-only text
            h('div', { className: 'form-section' }, [
                h('div', { className: 'form-group' }, [
                    h('label', {}, 'Email Address'),
                    h('div', { className: 'email-readonly' }, [
                        h('span', { className: 'email-text' }, formData.email),
                        h('span', { className: 'email-badge' }, '✓ Verified')
                    ])
                ]),
                
                // Rest of form fields
                h('div', { className: 'form-group' }, [
                    h('label', { htmlFor: 'first_name' }, 'First Name *'),
                    h('input', {
                        id: 'first_name',
                        type: 'text',
                        className: 'input',
                        value: formData.first_name,
                        onInput: (e) => setFormData(prev => ({ ...prev, first_name: e.target.value })),
                        required: true
                    }),
                    errors.first_name && h('div', { className: 'error-message' }, errors.first_name)
                ]),
                
                h('div', { className: 'form-group' }, [
                    h('label', { htmlFor: 'last_name' }, 'Last Name *'),
                    h('input', {
                        id: 'last_name',
                        type: 'text',
                        className: 'input',
                        value: formData.last_name,
                        onInput: (e) => setFormData(prev => ({ ...prev, last_name: e.target.value })),
                        required: true
                    }),
                    errors.last_name && h('div', { className: 'error-message' }, errors.last_name)
                ]),
                
                h('div', { className: 'form-group' }, [
                    h('label', { htmlFor: 'profession' }, 'Profession'),
                    h('input', {
                        id: 'profession',
                        type: 'text',
                        className: 'input',
                        value: formData.profession,
                        onInput: (e) => setFormData(prev => ({ ...prev, profession: e.target.value }))
                    })
                ]),
                
                h('div', { className: 'form-group' }, [
                    h('label', { htmlFor: 'us_zip_code' }, 'US Zip Code'),
                    h('input', {
                        id: 'us_zip_code',
                        type: 'text',
                        className: 'input',
                        value: formData.us_zip_code,
                        onInput: (e) => setFormData(prev => ({ ...prev, us_zip_code: e.target.value }))
                    })
                ]),
                
                h('div', { className: 'form-group' }, [
                    h('label', { htmlFor: 'country' }, 'Country'),
                    h('select', {
                        id: 'country',
                        className: 'input',
                        value: formData.country,
                        onChange: (e) => setFormData(prev => ({ ...prev, country: e.target.value }))
                    }, [
                        h('option', { value: 'United States' }, 'United States'),
                        h('option', { value: 'Canada' }, 'Canada'),
                        h('option', { value: 'Other' }, 'Other')
                    ])
                ])
            ]),
            
            h('div', { className: 'form-actions' }, [
                h('button', {
                    type: 'button',
                    className: 'btn btn-primary btn-large',
                    onClick: handleSubmit,
                    disabled: isSaving
                }, isSaving ? 'Saving...' : 'Next →')
            ])
        ]);
    }

    // AllSectionsPage Component (Page 2) with conditional deal tables
    function AllSectionsPage({ onNext, onSave }) {
        const [formData, setFormData] = useState({});
        const [showClosedDeals, setShowClosedDeals] = useState(false);
        const [showActiveDeals, setShowActiveDeals] = useState(false);
        const [questions, setQuestions] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        
        // Watch for closed_deals_count changes
        useEffect(() => {
            const closedCount = parseInt(formData.closed_deals_count || '0');
            setShowClosedDeals(closedCount > 0);
        }, [formData.closed_deals_count]);
        
        // Watch for active_deals_count changes
        useEffect(() => {
            const activeCount = parseInt(formData.active_deals_count || '0');
            setShowActiveDeals(activeCount > 0);
        }, [formData.active_deals_count]);

        // Load questions from database
        useEffect(() => {
            const loadQuestions = async () => {
                try {
                    const response = await fetch(`${supabaseConfig.url}/functions/v1/get-survey-questions`);
                    if (response.ok) {
                        const data = await response.json();
                        setQuestions(data.questions || []);
                    }
                } catch (error) {
                    console.error('Error loading questions:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            loadQuestions();
        }, []);

        const handleSubmit = async () => {
            try {
                await onSave('survey_responses', formData);
                        // Redirect to dashboard
                        window.location.href = '/dashboard';
            } catch (error) {
                console.error('Error submitting survey:', error);
                alert('Error submitting survey. Please try again.');
            }
        };

        if (isLoading) {
            return h('div', { className: 'survey-page' }, [
                h('div', { className: 'loading-spinner' }, 'Loading questions...')
            ]);
        }

        return h('div', { className: 'survey-page all-sections-page' }, [
            h('div', { className: 'page-header' }, [
                h('h2', { className: 'page-title' }, 'Market Survey Questions'),
                h('p', { className: 'page-description' }, 'Please answer the following questions about your M&A experience.')
            ]),
            
            // Basic questions
            h('div', { className: 'form-section' }, [
                h('h3', {}, 'Basic Information'),
                // Render basic questions here
                h('div', { className: 'form-group' }, [
                    h('label', { htmlFor: 'closed_deals_count' }, 'How many deals did you close in the past 12 months?'),
                    h('input', {
                        id: 'closed_deals_count',
                        type: 'number',
                        className: 'input',
                        value: formData.closed_deals_count || '',
                        onInput: (e) => setFormData(prev => ({ ...prev, closed_deals_count: e.target.value }))
                    })
                ]),
                
                h('div', { className: 'form-group' }, [
                    h('label', { htmlFor: 'active_deals_count' }, 'How many active deals are you currently working on?'),
                    h('input', {
                        id: 'active_deals_count',
                        type: 'number',
                        className: 'input',
                        value: formData.active_deals_count || '',
                        onInput: (e) => setFormData(prev => ({ ...prev, active_deals_count: e.target.value }))
                    })
                ])
            ]),
            
            // Conditional closed deals table
            showClosedDeals && h('div', { className: 'form-section' }, [
                h('h3', {}, 'Closed Deals Details'),
                h('p', {}, 'Please provide details for your closed deals.')
                // Render closed deals table here
            ]),
            
            // Conditional active deals table
            showActiveDeals && h('div', { className: 'form-section' }, [
                h('h3', {}, 'Active Deals Details'),
                h('p', {}, 'Please provide details for your active deals.')
                // Render active deals table here
            ]),
            
            // Submit button
            h('div', { className: 'form-actions' }, [
                h('button', {
                    className: 'btn btn-primary btn-large',
                    onClick: handleSubmit
                }, 'Submit Survey')
            ])
        ]);
    }

    // Main Survey Component
    function SurveyApp() {
        console.log('🚀 SurveyApp component rendering...');
        const [currentPage, setCurrentPage] = useState(1);
        const [showLoginModal, setShowLoginModal] = useState(false);
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
        
        console.log('📊 SurveyApp state:', { currentPage, showLoginModal, isAuthenticated, isLoading });

        // Check authentication on mount
        useEffect(() => {
            const checkAuth = async () => {
                console.log('🔐 Checking authentication...');
                const token = localStorage.getItem('supabase_token');
                console.log('🔑 Token:', token ? 'Present' : 'Not present');
                
                if (!token) {
                    console.log('❌ No token - showing login modal');
                    setShowLoginModal(true);
                    setIsLoading(false);
                    return;
                }

                try {
                    console.log('🔍 Validating token with /me endpoint...');
                    const response = await fetch(`${supabaseConfig.url}/functions/v1/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log('📡 /me response status:', response.status);
                    
                    if (response.ok) {
                        console.log('✅ Token valid - user authenticated');
                        setIsAuthenticated(true);
                    } else {
                        console.log('❌ Token invalid - showing login modal');
                        setShowLoginModal(true);
                    }
                } catch (error) {
                    console.error('❌ Error checking auth:', error);
                    setShowLoginModal(true);
                } finally {
                    setIsLoading(false);
                }
            };

            checkAuth();
        }, []);

        const handleSave = async (type, data) => {
            // Save data to appropriate table
            console.log(`Saving ${type}:`, data);
            // Implementation for saving to survey_non_deal_responses or survey_deal_responses
        };

        const handleNext = () => {
            setCurrentPage(2);
        };

        if (isLoading) {
            return React.createElement('div', { className: 'survey-container' }, [
                React.createElement('div', { className: 'loading-spinner' }, 'Loading...')
            ]);
        }

        return React.createElement('div', { className: 'survey-container' }, [
            // Login Modal
            React.createElement(LoginModal, {
                isOpen: showLoginModal,
                onClose: () => setShowLoginModal(false),
                redirectTo: 'survey',
                supabaseConfig: supabaseConfig
            }),

            // Survey Pages (only show when authenticated)
            isAuthenticated && currentPage === 1 && React.createElement(UserProfilePage, {
                onNext: handleNext,
                onSave: handleSave
            }),

            isAuthenticated && currentPage === 2 && React.createElement(AllSectionsPage, {
                onNext: handleNext,
                onSave: handleSave
            })
        ]);
    }

    // Initialize the app when dependencies are ready
    function initSurveyApp() {
        console.log('🔍 Attempting to mount Survey App...');
        const surveyContainer = document.getElementById('survey-root');
        
        if (!surveyContainer) {
            console.error('❌ #survey-root container not found');
            return;
        }
        
        if (!window.React || !window.ReactDOM) {
            console.error('❌ React/ReactDOM not loaded yet');
            setTimeout(initSurveyApp, 100);
            return;
        }
        
        console.log('✅ Mounting React survey app to #survey-root');
        
        // Use createRoot for React 18+
        if (ReactDOM.createRoot) {
            const root = ReactDOM.createRoot(surveyContainer);
            root.render(React.createElement(SurveyApp));
        } else {
            ReactDOM.render(React.createElement(SurveyApp), surveyContainer);
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSurveyApp);
    } else {
        initSurveyApp();
    }

    // Handle magic link callback
    window.handleMagicLinkCallback = function() {
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
            console.log('🔑 Magic link callback detected');
            
            // Store tokens
            localStorage.setItem('supabase_token', accessToken);
            localStorage.setItem('supabase_refresh_token', refreshToken);
            
            // Fetch user data
            fetch(`${supabaseConfig.url}/auth/v1/user`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'apikey': supabaseConfig.anonKey
                }
            })
            .then(response => response.json())
            .then(userData => {
                        localStorage.setItem('supabase_user_data', JSON.stringify(userData));
                        
                        // Clean URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                        
                        // Dispatch auth change event for header updates
                        window.dispatchEvent(new CustomEvent('supabase-auth-change'));
                        
                        // Reload to show authenticated state
                        window.location.reload();
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
        }
    };

    // Call magic link handler on page load
    window.handleMagicLinkCallback();

})();