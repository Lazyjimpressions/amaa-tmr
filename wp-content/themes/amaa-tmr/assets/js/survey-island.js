/**
 * AM&AA TMR Survey Island - Refactored Version
 * Modal-first authentication + 2-page survey structure
 * Version: 3.1.0 - Fixed DOM container ID mismatch
 * Date: 2025-10-22
 */

(function() {
    'use strict';
    
    console.log('🚀 Survey Island Script Loading... [MODAL_AUTH_v3.0.0]');

            // Use centralized Supabase client (now guaranteed to be loaded by WordPress dependencies)
            const supabaseClient = window.supabaseClient;
            
            if (!supabaseClient) {
                console.error('❌ Supabase client not loaded - this should not happen with proper dependencies');
                console.error('Available window objects:', Object.keys(window).filter(key => key.includes('supabase')));
                console.error('Supabase JS loaded:', !!window.supabase);
                console.error('SupabaseHelpers loaded:', !!window.supabaseHelpers);
                return;
            }
            
            console.log('🔧 Using centralized Supabase client');

    // React components
    const { useState, useEffect, useRef, createElement } = React;
    const h = createElement;

    // LoginModal Component
    function LoginModal({ isOpen, onClose, redirectTo = 'survey' }) {
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
                        
                        console.log('🔍 Magic Link Debug:');
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
                            console.log('❌ Magic link failed:', error.message);
                            throw new Error(error.message);
                        } else {
                            console.log('✅ Setting success state');
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

                // Load user email from cached data or Supabase session on mount
                useEffect(() => {
                    const loadUserData = async () => {
                        // Try cached data first for instant loading
                        const cachedUserData = localStorage.getItem('supabase_user_data');
                        if (cachedUserData) {
                            try {
                                const user = JSON.parse(cachedUserData);
                                setFormData(prev => ({ ...prev, email: user.email }));
                                fetchHubSpotData(user.email);
                                return;
                            } catch (e) {
                                console.warn('Invalid cached user data, fetching fresh data');
                            }
                        }
                        
                        // Fallback to fresh session data
                        const user = await window.supabaseHelpers.getCurrentUser();
                        if (user) {
                            setFormData(prev => ({ ...prev, email: user.email }));
                            fetchHubSpotData(user.email);
                        }
                    };
                    loadUserData();
                }, []);

        const fetchHubSpotData = async (email) => {
            try {
                const response = await fetch(`${window.location.origin}/functions/v1/check-membership`, {
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
                const accessToken = await window.supabaseHelpers.getAccessToken();
                const hubspotResponse = await fetch(`${window.location.origin}/functions/v1/hubspot-contact-create`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
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
                    const response = await fetch(`${window.location.origin}/functions/v1/get-survey-questions`);
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

        // Check Supabase session on mount
        useEffect(() => {
            const checkAuth = async () => {
                console.log('🔐 Checking Supabase session...');
                
                // Use supabaseHelpers (now guaranteed to be loaded by WordPress dependencies)
                if (!window.supabaseHelpers) {
                    console.error('❌ SupabaseHelpers not available - this should not happen with proper dependencies');
                    setShowLoginModal(true);
                    setIsLoading(false);
                    return;
                }
                
                const user = await window.supabaseHelpers.getCurrentUser();

                if (user) {
                    console.log('✅ Active session found for:', user.email);
                    // Cache user data for instant loading on profile page
                    localStorage.setItem('supabase_user_data', JSON.stringify(user));
                    setIsAuthenticated(true);
                    setShowLoginModal(false);
                    setIsLoading(false);
                } else {
                    console.log('⚠️ No session found — subscribing to auth events');
                    setShowLoginModal(true);
                    setIsLoading(false);

                    // Listen for real-time auth changes
                    if (supabaseClient && supabaseClient.auth) {
                        supabaseClient.auth.onAuthStateChange((event, session) => {
                            console.log('🔄 Auth event detected:', event);
                            if (event === 'SIGNED_IN' && session?.user) {
                                console.log('✅ User signed in:', session.user.email);
                                setIsAuthenticated(true);
                                setShowLoginModal(false);
                            } else if (event === 'SIGNED_OUT') {
                                console.log('🚪 User signed out');
                                setIsAuthenticated(false);
                                setShowLoginModal(true);
                            }
                        });
                    }
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
                React.createElement('div', { 
                    className: 'loading-spinner',
                    style: { 
                        textAlign: 'center', 
                        padding: '2rem',
                        fontSize: '1.2rem',
                        color: '#666'
                    }
                }, 'Loading survey...')
            ]);
        }

        return React.createElement('div', { className: 'survey-container' }, [
            // Login Modal
                    React.createElement(LoginModal, {
                        isOpen: showLoginModal,
                        onClose: () => setShowLoginModal(false),
                        redirectTo: 'survey'
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

            // Magic link callback is now handled by Supabase client automatically
            // No manual token handling needed - Supabase manages sessions internally

})();