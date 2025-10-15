/**
 * AM&AA TMR Survey Island - Clean Version
 * Progressive Trust Authentication + Dynamic Database Questions
 */

(function() {
    'use strict';
    
    console.log('🚀 Survey Island Script Loading...');

    // Global configuration from WordPress
    const supabaseConfig = window.supabaseConfig || {
        url: 'https://ffgjqlmulaqtfopgwenf.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pxbG11bGFxdGZvcGdlbmYiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczOTU2NzQwMCwiZXhwIjoyMDU1MTQzNDAwfQ.example'
    };
    
    console.log('🔧 Supabase Config:', supabaseConfig);

    // Global functions for magic link authentication
    window.sendMagicLink = async function(email, userData) {
        try {
            const response = await fetch('https://ffgjqlmulaqtfopgwenf.functions.supabase.co/auth-callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({ email, userData })
            });

            if (response.ok) {
                // Store pending data for after authentication
                localStorage.setItem('survey_pending_data', JSON.stringify(userData));
                alert('Magic link sent! Check your email and click the link to continue.');
            } else {
                throw new Error('Failed to send magic link');
            }
        } catch (error) {
            console.error('Error sending magic link:', error);
            alert('Error sending magic link. Please try again.');
        }
    };

    // Handle magic link callback
    window.handleMagicLinkCallback = async function() {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken && refreshToken) {
            // Store tokens
            localStorage.setItem('supabase_token', accessToken);
            localStorage.setItem('supabase_refresh_token', refreshToken);

            try {
                // Get user data
                const userResponse = await fetch('https://ffgjqlmulaqtfopgwenf.functions.supabase.co/me', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    localStorage.setItem('supabase_user_data', JSON.stringify(userData));

                    // Restore pending form data
                    const pendingData = localStorage.getItem('survey_pending_data');
                    if (pendingData) {
                        localStorage.setItem('survey_form_data', pendingData);
                        localStorage.removeItem('survey_pending_data');
                    }

                    // Update header
                    updateHeaderLoginState(userData);

                    // Dispatch auth change event
                    window.dispatchEvent(new CustomEvent('supabase-auth-changed', { detail: userData }));

                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
    };

    // Update header login state
    function updateHeaderLoginState(userData) {
        const authStateElement = document.getElementById('supabase-auth-state');
        if (authStateElement && userData) {
            const initials = (userData.first_name?.[0] || '') + (userData.last_name?.[0] || '');
            authStateElement.innerHTML = `
                <div class="user-avatar" onclick="toggleUserDropdown()">
                    <span class="avatar-initials">${initials}</span>
                </div>
                <div class="user-dropdown" id="user-dropdown">
                    <div class="dropdown-item" onclick="handleLogout()">Logout</div>
                </div>
            `;
        }
    }

    // Global dropdown functions
    window.toggleUserDropdown = function() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }
    };

    window.handleLogout = function() {
        localStorage.removeItem('supabase_token');
        localStorage.removeItem('supabase_refresh_token');
        localStorage.removeItem('supabase_user_data');
        location.reload();
    };

    // React components
    const { useState, useEffect, useRef } = React;
    const { createElement: h } = React;

    // Page 1: User Profile Component
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
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [userInfo, setUserInfo] = useState(null);

        // Check authentication status on mount
        useEffect(() => {
            const token = localStorage.getItem('supabase_token');
            const userData = localStorage.getItem('supabase_user_data');
            
            if (token && userData) {
                try {
                    const parsed = JSON.parse(userData);
                    setUserInfo(parsed);
                    setIsAuthenticated(true);
                    
                    // Prefill form with user data
                    setFormData(prev => ({
                        ...prev,
                        email: parsed.email || prev.email,
                        first_name: parsed.first_name || prev.first_name,
                        last_name: parsed.last_name || prev.last_name
                    }));
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }

            // Restore form data from localStorage
            const savedData = localStorage.getItem('survey_form_data');
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setFormData(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error('Error parsing saved form data:', e);
                }
            }
        }, []);

        // Email validation on blur
        useEffect(() => {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                const handleEmailBlur = async () => {
                    const email = emailInput.value.trim();
                    if (email && email.includes('@')) {
                        try {
                            const response = await fetch('https://ffgjqlmulaqtfopgwenf.functions.supabase.co/check-membership', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Origin': window.location.origin
                                },
                                body: JSON.stringify({ email })
                            });

                            if (response.ok) {
                                const data = await response.json();
                                if (data.found && data.hubspot_contact) {
                                    // Prefill form with HubSpot data
                                    setFormData(prev => ({
                                        ...prev,
                                        first_name: data.hubspot_contact.first_name || prev.first_name,
                                        last_name: data.hubspot_contact.last_name || prev.last_name,
                                        profession: data.hubspot_contact.profession || prev.profession
                                    }));
                                    
                                    // Store HubSpot contact ID
                                    localStorage.setItem('hubspot_contact_data', JSON.stringify(data.hubspot_contact));
                                } else if (data.status === 'created') {
                                    console.log('New HubSpot contact created:', data.hubspot_contact_id);
                                }
                            }
                        } catch (error) {
                            console.error('Error checking membership:', error);
                        }
                    }
                };

                emailInput.addEventListener('blur', handleEmailBlur);
                return () => emailInput.removeEventListener('blur', handleEmailBlur);
            }
        }, []);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsSaving(true);

            try {
                // Save form data
                localStorage.setItem('survey_form_data', JSON.stringify(formData));
                await onSave(formData);
                onNext();
            } catch (error) {
                console.error('Error saving user profile:', error);
            } finally {
                setIsSaving(false);
            }
        };

        const handleNext = async () => {
            if (isAuthenticated) {
                await handleSubmit({ preventDefault: () => {} });
            } else {
                // Send magic link
                await window.sendMagicLink(formData.email, formData);
            }
        };

        return h('div', { className: 'survey-page' }, [
            h('div', { className: 'page-header' }, [
                h('h2', { className: 'page-title' }, 'User Profile'),
                h('p', { className: 'page-description' }, 
                    'Please provide your basic information to get started'
                )
            ]),
            
            h('form', { 
                className: 'survey-form',
                onSubmit: handleSubmit
            }, [
                h('div', { className: 'form-group' }, [
                    h('label', { className: 'form-label', htmlFor: 'email' }, 'Email Address *'),
                    h('input', {
                        type: 'email',
                        id: 'email',
                        className: `form-input ${errors.email ? 'error' : ''}`,
                        value: formData.email,
                        onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })),
                        placeholder: 'Enter your email address',
                        required: true
                    })
                ]),

                h('div', { className: 'form-group' }, [
                    h('label', { className: 'form-label', htmlFor: 'first_name' }, 'First Name *'),
                    h('input', {
                        type: 'text',
                        id: 'first_name',
                        className: `form-input ${errors.first_name ? 'error' : ''}`,
                        value: formData.first_name,
                        onChange: (e) => setFormData(prev => ({ ...prev, first_name: e.target.value })),
                        placeholder: 'Enter your first name',
                        required: true
                    })
                ]),

                h('div', { className: 'form-group' }, [
                    h('label', { className: 'form-label', htmlFor: 'last_name' }, 'Last Name *'),
                    h('input', {
                        type: 'text',
                        id: 'last_name',
                        className: `form-input ${errors.last_name ? 'error' : ''}`,
                        value: formData.last_name,
                        onChange: (e) => setFormData(prev => ({ ...prev, last_name: e.target.value })),
                        placeholder: 'Enter your last name',
                        required: true
                    })
                ]),

                h('div', { className: 'form-group' }, [
                    h('label', { className: 'form-label', htmlFor: 'profession' }, 'Profession *'),
                    h('select', {
                        id: 'profession',
                        className: `form-select ${errors.profession ? 'error' : ''}`,
                        value: formData.profession,
                        onChange: (e) => setFormData(prev => ({ ...prev, profession: e.target.value })),
                        required: true
                    }, [
                        h('option', { value: '' }, 'Select your profession'),
                        h('option', { value: 'Investment Banker / M&A Intermediary' }, 'Investment Banker / M&A Intermediary'),
                        h('option', { value: 'Private Equity Professional' }, 'Private Equity Professional'),
                        h('option', { value: 'Corporate Development Professional' }, 'Corporate Development Professional'),
                        h('option', { value: 'Business Broker' }, 'Business Broker'),
                        h('option', { value: 'M&A Attorney' }, 'M&A Attorney'),
                        h('option', { value: 'M&A Accountant/CPA' }, 'M&A Accountant/CPA'),
                        h('option', { value: 'M&A Consultant' }, 'M&A Consultant'),
                        h('option', { value: 'Valuation Professional' }, 'Valuation Professional'),
                        h('option', { value: 'Other' }, 'Other')
                    ])
                ]),

                h('div', { className: 'form-group' }, [
                    h('label', { className: 'form-label', htmlFor: 'us_zip_code' }, 'US Zip Code'),
                    h('input', {
                        type: 'text',
                        id: 'us_zip_code',
                        className: 'form-input',
                        value: formData.us_zip_code,
                        onChange: (e) => setFormData(prev => ({ ...prev, us_zip_code: e.target.value })),
                        placeholder: 'Enter your zip code'
                    })
                ]),

                h('div', { className: 'form-group' }, [
                    h('label', { className: 'form-label', htmlFor: 'country' }, 'Country'),
                    h('select', {
                        id: 'country',
                        className: 'form-select',
                        value: formData.country,
                        onChange: (e) => setFormData(prev => ({ ...prev, country: e.target.value }))
                    }, [
                        h('option', { value: 'United States' }, 'United States'),
                        h('option', { value: 'Canada' }, 'Canada'),
                        h('option', { value: 'United Kingdom' }, 'United Kingdom'),
                        h('option', { value: 'Germany' }, 'Germany'),
                        h('option', { value: 'France' }, 'France'),
                        h('option', { value: 'Australia' }, 'Australia'),
                        h('option', { value: 'Japan' }, 'Japan'),
                        h('option', { value: 'China' }, 'China'),
                        h('option', { value: 'India' }, 'India'),
                        h('option', { value: 'Brazil' }, 'Brazil'),
                        h('option', { value: 'Mexico' }, 'Mexico'),
                        h('option', { value: 'Other' }, 'Other')
                    ])
                ]),

                h('div', { className: 'form-actions' }, [
                    h('button', {
                        type: 'submit',
                        className: 'btn btn-primary',
                        disabled: isSaving
                    }, isSaving ? 'Saving...' : 'Next')
                ])
            ])
        ]);
    }

    // Page 2: All Sections Component (Dynamic Database Questions)
    function AllSectionsPage({ onNext, onSave }) {
        const [formData, setFormData] = useState({});
        const [errors, setErrors] = useState({});
        const [isSaving, setIsSaving] = useState(false);
        const [questions, setQuestions] = useState([]);
        const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
        const [page1Data, setPage1Data] = useState(null);

        // Fetch questions from database
        useEffect(() => {
            const fetchQuestions = async () => {
                try {
                    setIsLoadingQuestions(true);
                    const response = await fetch('https://ffgjqlmulaqtfopgwenf.functions.supabase.co/get-survey-questions?survey_slug=2025-summer', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch questions: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log('✅ Fetched questions:', data);
                    setQuestions(data.questions || []);
                } catch (error) {
                    console.error('❌ Error fetching questions:', error);
                    setQuestions([]);
                } finally {
                    setIsLoadingQuestions(false);
                }
            };

            fetchQuestions();
        }, []);

        // Load Page 1 data for recap
        useEffect(() => {
            const savedFormData = localStorage.getItem('survey_form_data');
            if (savedFormData) {
                try {
                    const parsed = JSON.parse(savedFormData);
                    setPage1Data(parsed);
                } catch (e) {
                    console.error('Error parsing saved form data:', e);
                }
            }
        }, []);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsSaving(true);
            
            try {
                await onSave(formData);
                onNext();
            } catch (error) {
                console.error('Error saving survey data:', error);
            } finally {
                setIsSaving(false);
            }
        };

        // Render Page 1 recap
        const renderPage1Recap = () => {
            if (!page1Data) return null;

            return h('div', { className: 'page1-recap' }, [
                h('h3', { className: 'recap-title' }, 'Your Information'),
                h('div', { className: 'recap-content' }, [
                    h('p', null, `Name: ${page1Data.first_name} ${page1Data.last_name}`),
                    h('p', null, `Email: ${page1Data.email}`),
                    h('p', null, `Profession: ${page1Data.profession}`),
                    page1Data.us_zip_code && h('p', null, `Zip Code: ${page1Data.us_zip_code}`),
                    h('p', null, `Country: ${page1Data.country}`)
                ])
            ]);
        };

        // Group questions by section
        const questionsBySection = questions.reduce((acc, question) => {
            const section = question.section || 'Other';
            if (!acc[section]) acc[section] = [];
            acc[section].push(question);
            return acc;
        }, {});

        // Render questions for a section
        const renderSectionQuestions = (sectionQuestions) => {
            return sectionQuestions.map((question, index) => 
                h('div', { 
                    key: question.id,
                    className: 'form-group' 
                }, [
                    h('label', { 
                        className: 'form-label',
                        htmlFor: `question_${question.code}`
                    }, question.text),
                    
                    // Render different input types based on question.type
                    question.type === 'text' && h('input', {
                        type: 'text',
                        id: `question_${question.code}`,
                        className: 'form-input',
                        placeholder: 'Enter your answer...'
                    }),
                    
                    question.type === 'number' && h('input', {
                        type: 'number',
                        id: `question_${question.code}`,
                        className: 'form-input',
                        placeholder: 'Enter a number...'
                    }),
                    
                    question.type === 'select' && h('select', {
                        id: `question_${question.code}`,
                        className: 'form-select'
                    }, [
                        h('option', { value: '' }, 'Select an option...'),
                        ...(question.options?.choices || []).map(option => 
                            h('option', { 
                                key: option.value,
                                value: option.value 
                            }, option.label || option.value)
                        )
                    ]),
                    
                    question.type === 'checkbox' && h('div', { className: 'checkbox-group' }, 
                        (question.options?.choices || []).map(option => 
                            h('label', { key: option.value, className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    name: `question_${question.code}`,
                                    value: option.value
                                }),
                                h('span', { className: 'checkbox-label' }, option.label || option.value)
                            ])
                        )
                    ),
                    
                    question.type === 'radio' && h('div', { className: 'radio-group' }, 
                        (question.options?.choices || []).map(option => 
                            h('label', { key: option.value, className: 'radio-item' }, [
                                h('input', {
                                    type: 'radio',
                                    name: `question_${question.code}`,
                                    value: option.value
                                }),
                                h('span', { className: 'radio-label' }, option.label || option.value)
                            ])
                        )
                    ),
                    
                    question.type === 'textarea' && h('textarea', {
                        id: `question_${question.code}`,
                        className: 'form-textarea',
                        rows: 4,
                        placeholder: 'Enter your answer...'
                    })
                ])
            );
        };

        return h('div', { className: 'survey-page' }, [
            h('div', { className: 'page-header' }, [
                h('h2', { className: 'page-title' }, 'Survey Questions'),
                h('p', { className: 'page-description' }, 
                    'Please answer the following questions about your market experience'
                )
            ]),
            
            // Page 1 Recap
            renderPage1Recap(),
            
            // Dynamic Questions by Section
            h('div', { className: 'questions-container' }, [
                isLoadingQuestions ? h('div', { className: 'loading-questions' }, [
                    h('div', { className: 'loading-spinner' }, '⏳'),
                    h('p', null, 'Loading survey questions...')
                ]) : questions.length === 0 ? h('div', { className: 'no-questions' }, [
                    h('p', null, 'No questions available. Please contact support.')
                ]) : Object.entries(questionsBySection).map(([sectionName, sectionQuestions]) => 
                    h('div', { 
                        key: sectionName,
                        className: 'survey-section' 
                    }, [
                        h('h3', { className: 'section-title' }, sectionName),
                        h('div', { className: 'section-questions' }, renderSectionQuestions(sectionQuestions))
                    ])
                )
            ]),
            
            h('form', { 
                className: 'survey-form',
                onSubmit: handleSubmit
            }, [
                // Form Actions
                h('div', { className: 'form-actions' }, [
                    h('button', {
                        type: 'submit',
                        className: 'btn btn-primary',
                        disabled: isSaving || isLoadingQuestions
                    }, isSaving ? 'Saving...' : 'Complete Survey')
                ])
            ])
        ]);
    }

    // Main Multi-Page Survey Component
    function MultiPageSurvey() {
        const [currentPage, setCurrentPage] = useState(1);
        const [surveyData, setSurveyData] = useState({});
        const [isLoading, setIsLoading] = useState(false);
        const [isCompleted, setIsCompleted] = useState(false);
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [userInfo, setUserInfo] = useState(null);

        const totalPages = 2;

        // Check authentication status on component mount
        useEffect(() => {
            const checkAuthStatus = async () => {
                try {
                    // Check for Supabase auth callback (magic link)
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    const accessToken = hashParams.get('access_token');
                    const refreshToken = hashParams.get('refresh_token');

                    if (accessToken && refreshToken) {
                        // Store tokens
                        localStorage.setItem('supabase_token', accessToken);
                        localStorage.setItem('supabase_refresh_token', refreshToken);

                        // Get user data
                        const userResponse = await fetch('https://ffgjqlmulaqtfopgwenf.functions.supabase.co/me', {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'Content-Type': 'application/json'
                            }
                        });

                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            localStorage.setItem('supabase_user_data', JSON.stringify(userData));
                            setUserInfo(userData);
                            setIsAuthenticated(true);

                            // Restore pending form data
                            const pendingData = localStorage.getItem('survey_pending_data');
                            if (pendingData) {
                                localStorage.setItem('survey_form_data', pendingData);
                                localStorage.removeItem('survey_pending_data');
                            }

                            // Update header
                            updateHeaderLoginState(userData);

                            // Clean URL
                            window.history.replaceState({}, document.title, window.location.pathname);
                        }
                    } else {
                        // Check existing authentication
                        const token = localStorage.getItem('supabase_token');
                        const userData = localStorage.getItem('supabase_user_data');
                        
                        if (token && userData) {
                            try {
                                const parsed = JSON.parse(userData);
                                setUserInfo(parsed);
                                setIsAuthenticated(true);
                                updateHeaderLoginState(parsed);
                            } catch (e) {
                                console.error('Error parsing user data:', e);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error checking auth status:', error);
                }
            };

            checkAuthStatus();
        }, []);

        // Listen for auth changes
        useEffect(() => {
            const handleAuthChange = (event) => {
                const userData = event.detail;
                setUserInfo(userData);
                setIsAuthenticated(true);
            };

            window.addEventListener('supabase-auth-changed', handleAuthChange);
            return () => window.removeEventListener('supabase-auth-changed', handleAuthChange);
        }, []);

        const handlePageSave = async (pageData) => {
            setSurveyData(prev => ({ ...prev, ...pageData }));
            
            // Store form data in localStorage for later use
            localStorage.setItem('survey_form_data', JSON.stringify({ ...surveyData, ...pageData }));
            console.log('Form data saved to localStorage:', { ...surveyData, ...pageData });
        };

        const handleNextPage = () => {
            if (currentPage < totalPages) {
                setCurrentPage(prev => prev + 1);
            }
        };

        const handlePrevPage = () => {
            if (currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        };

        const renderCurrentPage = () => {
            switch (currentPage) {
                case 1:
                    return h(UserProfilePage, {
                        onNext: handleNextPage,
                        onSave: handlePageSave
                    });
                case 2:
                    return h(AllSectionsPage, {
                        onNext: handleNextPage,
                        onSave: handlePageSave
                    });
                default:
                    return h('div', null, 'Unknown page');
            }
        };

        if (isCompleted) {
            return h('div', { className: 'survey-completion' }, [
                h('div', { className: 'completion-icon' }, '✓'),
                h('h2', { className: 'completion-title' }, 'Survey Completed!'),
                h('p', { className: 'completion-message' }, 
                    'Thank you for participating in our market survey. Your responses will help us provide valuable insights to the M&A community.'
                )
            ]);
        }

        return h('div', { className: 'multi-page-survey' }, [
            h('div', { className: 'survey-header' }, [
                h('div', { className: 'progress-bar' }, [
                    h('div', { 
                        className: 'progress-fill',
                        style: { width: `${(currentPage / totalPages) * 100}%` }
                    })
                ]),
                h('div', { className: 'page-indicator' }, [
                    h('span', { className: 'current-page' }, currentPage),
                    h('span', { className: 'total-pages' }, ` of ${totalPages}`)
                ])
            ]),
            
            renderCurrentPage(),
            
            h('div', { className: 'survey-navigation' }, [
                currentPage > 1 && h('button', {
                    className: 'btn btn-secondary',
                    onClick: handlePrevPage
                }, '← Previous'),
                
                h('div', { className: 'nav-spacer' }),
                
                currentPage < totalPages && h('button', {
                    className: 'btn btn-primary',
                    onClick: handleNextPage
                }, 'Next →')
            ])
        ]);
    }

    // Initialize the survey
    function initSurvey() {
        console.log('🚀 Initializing survey...');
        console.log('Supabase config:', window.supabaseConfig);
        
        // Handle magic link callback first
        window.handleMagicLinkCallback();
        
        // Mount React app
        const container = document.getElementById('survey-container');
        console.log('Survey container found:', container);
        
        if (container) {
            console.log('✅ Mounting React survey app');
            ReactDOM.render(h(MultiPageSurvey), container);
        } else {
            console.error('❌ Survey container not found!');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSurvey);
    } else {
        initSurvey();
    }

})();