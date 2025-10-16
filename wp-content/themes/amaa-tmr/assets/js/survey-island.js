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
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pxbG11bGFxdGZvcGd3ZW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTU2ODEsImV4cCI6MjA3NTE3MTY4MX0.dR0jytzP7h07DkaYdFwkrqyCAZOfVWUfzJwfiJy_O5g'
    };
    
    console.log('🔧 Supabase Config:', supabaseConfig);

    // Global functions for magic link authentication
    window.sendMagicLink = async function(email, userData) {
        try {
            const response = await fetch(`${supabaseConfig.url}/auth/v1/magiclink`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseConfig.anonKey
                },
                body: JSON.stringify({
                    email: email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/survey/`
                    }
                })
            });
            
            if (response.ok) {
                // Store pending data
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
                
                // Move pending data to form data
                const pendingData = localStorage.getItem('survey_pending_data');
                if (pendingData) {
                    localStorage.setItem('survey_form_data', pendingData);
                    localStorage.removeItem('survey_pending_data');
                }
                
                // Dispatch auth change event
                window.dispatchEvent(new CustomEvent('supabase-auth-changed', { detail: userData }));
                
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
        }
    };

    // Update header login state
    window.updateHeaderLoginState = function(userData) {
        const token = localStorage.getItem('supabase_token');
        const storedUserData = localStorage.getItem('supabase_user_data');
        
        if (token && (userData || storedUserData)) {
            try {
                const user = userData || JSON.parse(storedUserData);
                const initials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '');
                
                // Find the user state container and replace with avatar
                const userStateContainer = document.querySelector('.user-state');
                if (userStateContainer) {
                    userStateContainer.innerHTML = `
                        <div class="user-avatar" onclick="toggleUserDropdown()">
                            <span class="avatar-initials">${initials}</span>
                        </div>
                        <div class="user-dropdown" id="user-dropdown" style="display: none;">
                            <div class="dropdown-item" onclick="handleLogout()">Logout</div>
                        </div>
                    `;
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    };

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
    const { useState, useEffect, useRef, createElement } = React;
    const h = createElement;

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
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

        // Check authentication status on mount
        useEffect(() => {
            const token = localStorage.getItem('supabase_token');
            const userData = localStorage.getItem('supabase_user_data');
            
            if (token && userData) {
                setIsAuthenticated(true);
                try {
                    const user = JSON.parse(userData);
                    setFormData(prev => ({
                        ...prev,
                        email: user.email || '',
                        first_name: user.first_name || '',
                        last_name: user.last_name || ''
                    }));
                } catch (e) {
                    console.error('Error parsing user data:', e);
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
                            const response = await fetch(`${supabaseConfig.url}/functions/v1/check-membership`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'apikey': supabaseConfig.anonKey
                                },
                                body: JSON.stringify({ email })
                            });
                            
                            const data = await response.json();
                            if (data.found && data.hubspot_contact) {
                                // Prefill form with HubSpot data
                                setFormData(prev => ({
                                    ...prev,
                                    first_name: data.hubspot_contact.firstname || '',
                                    last_name: data.hubspot_contact.lastname || '',
                                    profession: data.hubspot_contact.profession || '',
                                    us_zip_code: data.hubspot_contact.zip || '',
                                    country: data.hubspot_contact.country || 'United States'
                                }));
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
            setIsLoading(true);
            
            // Save form data
            localStorage.setItem('survey_form_data', JSON.stringify(formData));
            await onSave(formData);
            
            if (isAuthenticated) {
                onNext();
            } else {
                // Send magic link
                await window.sendMagicLink(formData.email, formData);
            }
            
            setIsLoading(false);
        };

        return h('div', { className: 'survey-page' }, [
            h('div', { className: 'page-header' }, [
                h('h2', { className: 'page-title' }, 'Your Information'),
                h('p', { className: 'page-description' }, 
                    'Please provide your contact information to get started'
                )
            ]),
            
            h('form', { 
                className: 'survey-form',
                onSubmit: handleSubmit
            }, [
                h('div', { className: 'form-group' }, [
                    h('label', { 
                        className: 'form-label',
                        htmlFor: 'email'
                    }, 'Email Address *'),
                    h('input', {
                        type: 'email',
                        id: 'email',
                        className: 'form-input',
                        value: formData.email,
                        onChange: (e) => setFormData(prev => ({ ...prev, email: e.target.value })),
                        required: true
                    })
                ]),
                
                h('div', { className: 'form-group' }, [
                    h('label', { 
                        className: 'form-label',
                        htmlFor: 'first_name'
                    }, 'First Name *'),
                    h('input', {
                        type: 'text',
                        id: 'first_name',
                        className: 'form-input',
                        value: formData.first_name,
                        onChange: (e) => setFormData(prev => ({ ...prev, first_name: e.target.value })),
                        required: true
                    })
                ]),
                
                h('div', { className: 'form-group' }, [
                    h('label', { 
                        className: 'form-label',
                        htmlFor: 'last_name'
                    }, 'Last Name *'),
                    h('input', {
                        type: 'text',
                        id: 'last_name',
                        className: 'form-input',
                        value: formData.last_name,
                        onChange: (e) => setFormData(prev => ({ ...prev, last_name: e.target.value })),
                        required: true
                    })
                ]),
                
                h('div', { className: 'form-group' }, [
                    h('label', { 
                        className: 'form-label',
                        htmlFor: 'profession'
                    }, 'Profession'),
                    h('input', {
                        type: 'text',
                        id: 'profession',
                        className: 'form-input',
                        value: formData.profession,
                        onChange: (e) => setFormData(prev => ({ ...prev, profession: e.target.value }))
                    })
                ]),
                
                h('div', { className: 'form-group' }, [
                    h('label', { 
                        className: 'form-label',
                        htmlFor: 'us_zip_code'
                    }, 'US Zip Code'),
                    h('input', {
                        type: 'text',
                        id: 'us_zip_code',
                        className: 'form-input',
                        value: formData.us_zip_code,
                        onChange: (e) => setFormData(prev => ({ ...prev, us_zip_code: e.target.value }))
                    })
                ]),
                
                h('div', { className: 'form-group' }, [
                    h('label', { 
                        className: 'form-label',
                        htmlFor: 'country'
                    }, 'Country'),
                    h('select', {
                        id: 'country',
                        className: 'form-select',
                        value: formData.country,
                        onChange: (e) => setFormData(prev => ({ ...prev, country: e.target.value }))
                    }, [
                        h('option', { value: 'United States' }, 'United States'),
                        h('option', { value: 'Canada' }, 'Canada'),
                        h('option', { value: 'Other' }, 'Other')
                    ])
                ]),
                
                h('div', { className: 'form-actions' }, [
                    h('button', {
                        type: 'submit',
                        className: 'btn btn-primary',
                        disabled: isLoading
                    }, isLoading ? 'Sending...' : 'Next →')
                ])
            ])
        ]);
    }

    // Page 2: All Sections Component
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
                    const response = await fetch(`${supabaseConfig.url}/functions/v1/get-survey-questions?survey_slug=2025-summer`, {
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

        // Load Page 1 data for recap and populate form
        useEffect(() => {
            const savedFormData = localStorage.getItem('survey_form_data');
            if (savedFormData) {
                try {
                    const parsed = JSON.parse(savedFormData);
                    setPage1Data(parsed);
                    // Populate form fields with saved data
                    setFormData(prev => ({ ...prev, ...parsed }));
                } catch (e) {
                    console.error('Error parsing saved form data:', e);
                }
            }
        }, []);

        const handleSubmit = async (e) => {
            e.preventDefault();
            setIsSaving(true);
            
            // TODO: Implement actual save logic to Supabase
            console.log('Saving Page 2 data:', formData);
            await onSave(formData);
            onNext();
            setIsSaving(false);
        };

        // Render Page 1 Recap
        const renderPage1Recap = () => {
            if (!page1Data) return null;
            return h('div', { className: 'page1-recap' }, [
                h('h3', null, 'Your Information'),
                h('p', null, `Name: ${page1Data.first_name || ''} ${page1Data.last_name || ''}`),
                h('p', null, `Email: ${page1Data.email || ''}`),
                h('p', null, `Profession: ${page1Data.profession || ''}`),
                h('p', null, `Zip Code: ${page1Data.us_zip_code || ''}`),
                h('p', null, `Country: ${page1Data.country || ''}`)
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
            return sectionQuestions.map((question, index) => {
                // Get current value from formData or page1Data
                const currentValue = formData[question.code] || (page1Data && page1Data[question.code]) || '';
                
                // Get appropriate placeholder based on question type and content
                const getPlaceholder = (question) => {
                    if (question.code === 'email') return 'john.doe@example.com';
                    if (question.code === 'first_name') return 'John';
                    if (question.code === 'last_name') return 'Doe';
                    if (question.code === 'us_zip_code') return '90210';
                    if (question.code.includes('success_fee') || question.code.includes('retainer_fee')) return '2.5';
                    if (question.code.includes('deal') && question.code.includes('count')) return '3';
                    if (question.code.includes('total_consideration') || question.code.includes('deal_size')) return '10.5';
                    if (question.type === 'number') return 'Enter a number...';
                    if (question.type === 'text') return 'Enter your answer...';
                    return 'Select an option...';
                };
                
                return h('div', { 
                    key: question.id,
                    className: 'form-group' 
                }, [
                    h('label', { 
                        className: 'form-label',
                        htmlFor: `question_${question.code}`
                    }, question.text),
                    
                    // Render different input types based on question.type
                    question.type === 'text' && h('input', {
                        type: question.code === 'email' ? 'email' : 'text',
                        id: `question_${question.code}`,
                        className: 'form-input',
                        value: currentValue,
                        placeholder: getPlaceholder(question),
                        onChange: (e) => setFormData(prev => ({ ...prev, [question.code]: e.target.value }))
                    }),
                    
                    question.type === 'number' && h('input', {
                        type: 'number',
                        id: `question_${question.code}`,
                        className: 'form-input',
                        value: currentValue,
                        placeholder: getPlaceholder(question),
                        step: question.code.includes('fee') ? '0.1' : '1',
                        onChange: (e) => setFormData(prev => ({ ...prev, [question.code]: e.target.value }))
                    }),
                    
                    question.type === 'select' && h('select', {
                        id: `question_${question.code}`,
                        className: 'form-select',
                        value: currentValue,
                        onChange: (e) => setFormData(prev => ({ ...prev, [question.code]: e.target.value }))
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
                                    value: option.value,
                                    checked: formData[question.code] && formData[question.code].includes(option.value),
                                    onChange: (e) => {
                                        const currentValues = formData[question.code] || [];
                                        const newValues = e.target.checked 
                                            ? [...currentValues, option.value]
                                            : currentValues.filter(v => v !== option.value);
                                        setFormData(prev => ({ ...prev, [question.code]: newValues }));
                                    }
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
                                    value: option.value,
                                    checked: currentValue === option.value,
                                    onChange: (e) => setFormData(prev => ({ ...prev, [question.code]: e.target.value }))
                                }),
                                h('span', { className: 'radio-label' }, option.label || option.value)
                            ])
                        )
                    ),
                    
                    question.type === 'textarea' && h('textarea', {
                        id: `question_${question.code}`,
                        className: 'form-textarea',
                        rows: 4,
                        value: currentValue,
                        placeholder: 'Enter your answer...',
                        onChange: (e) => setFormData(prev => ({ ...prev, [question.code]: e.target.value }))
                    })
                ]);
            });
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

    // Progress Bar Component
    function ProgressBar({ currentPage, totalPages }) {
        const progress = (currentPage / totalPages) * 100;
        return h('div', { className: 'progress-bar' }, [
            h('div', { 
                className: 'progress-fill',
                style: { width: `${progress}%` }
            }),
            h('span', { className: 'progress-text' }, `${currentPage} of ${totalPages}`)
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

        // Check authentication status on mount
        useEffect(() => {
            const token = localStorage.getItem('supabase_token');
            const userData = localStorage.getItem('supabase_user_data');
            
            if (token && userData) {
                setIsAuthenticated(true);
                try {
                    const user = JSON.parse(userData);
                    setUserInfo(user);
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
        }, []);

        // Listen for auth changes
        useEffect(() => {
            const handleAuthChange = (event) => {
                setIsAuthenticated(true);
                setUserInfo(event.detail);
            };
            
            window.addEventListener('supabase-auth-changed', handleAuthChange);
            return () => window.removeEventListener('supabase-auth-changed', handleAuthChange);
        }, []);

        const handlePageSave = async (data) => {
            console.log('Saving page data:', data);
            setSurveyData(prev => ({ ...prev, ...data }));
        };

        const handleNextPage = () => {
            if (currentPage === 1) {
                // For Page 1, save data to localStorage before proceeding
                const formData = localStorage.getItem('survey_form_data');
                if (formData) {
                    console.log('Page 1 data to save:', JSON.parse(formData));
                }
            }
            
            if (currentPage < totalPages) {
                setCurrentPage(prev => prev + 1);
            } else {
                setIsCompleted(true);
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
                h('p', { className: 'completion-message' }, 'Thank you for completing the AM&AA Market Survey.'),
                h('button', { 
                    className: 'btn btn-primary',
                    onClick: () => {
                        setIsCompleted(false);
                        setCurrentPage(1);
                        setSurveyData({});
                        localStorage.removeItem('survey_form_data');
                    }
                }, 'Start New Survey')
            ]);
        }

        return h('div', { className: 'multi-page-survey' }, [
            h(ProgressBar, { currentPage, totalPages }),
            renderCurrentPage(),
            h('div', { className: 'survey-navigation' }, [
                currentPage > 1 && h('button', { 
                    className: 'btn btn-secondary', 
                    onClick: handlePrevPage 
                }, '← Previous'),
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