// AMAA TMR Survey React App - Multi-Page Survey
(function() {
    'use strict';

    console.log('NEW MULTI-PAGE SURVEY LOADING - VERSION 1.0.4');

    // Global no-op for showNotification to prevent errors
    window.showNotification = window.showNotification || function() {};

    function waitForDependencies() {
        if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
            setTimeout(waitForDependencies, 100);
            return;
        }

        const { createElement: h, useState, useEffect, useRef } = React;

        // Progress Bar Component
        function ProgressBar({ currentPage, totalPages }) {
            const percentage = (currentPage / totalPages) * 100;
            
            return h('div', { className: 'survey-progress' }, [
                h('div', { className: 'progress-bar' }, 
                    h('div', { 
                        className: 'progress-fill',
                        style: { width: `${percentage}%` }
                    })
                ),
                h('div', { className: 'progress-text' }, 
                    `Page ${currentPage} of ${totalPages}`
                )
            ]);
        }

        // Page 1: User Profile Component
        function UserProfilePage({ onNext, onSave }) {
            const [formData, setFormData] = useState({
                email: '',
                first_name: '',
                last_name: '',
                us_zip_code: '',
                country: '',
                profession: ''
            });
            const [errors, setErrors] = useState({});
            const [isValidatingEmail, setIsValidatingEmail] = useState(false);
            const [emailValidationStatus, setEmailValidationStatus] = useState(null);
            const [isSaving, setIsSaving] = useState(false);

            // Email validation with HubSpot lookup
            const validateEmail = async (email) => {
                if (!email || !email.includes('@')) return;
                
                setIsValidatingEmail(true);
                setEmailValidationStatus(null);
                
                try {
                    // Check if email exists in Supabase members table (synced from HubSpot)
                    const response = await fetch(`https://ffgjqlmulaqtfopgwenf.functions.supabase.co/me`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('supabase_token') || ''}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.email === email.toLowerCase()) {
                            // Email found in HubSpot, prepopulate fields
                            setFormData(prev => ({
                                ...prev,
                                first_name: data.first_name || '',
                                last_name: data.last_name || '',
                                us_zip_code: data.us_zip_code || '',
                                country: data.country || '',
                                profession: data.profession || ''
                            }));
                            setEmailValidationStatus('found');
                        } else {
                            setEmailValidationStatus('not_found');
                        }
                    } else {
                        setEmailValidationStatus('not_found');
                    }
                } catch (error) {
                    console.error('Email validation error:', error);
                    setEmailValidationStatus('error');
                } finally {
                    setIsValidatingEmail(false);
                }
            };

            // Handle email input with debounced validation
            useEffect(() => {
                const timeoutId = setTimeout(() => {
                    if (formData.email) {
                        validateEmail(formData.email);
                    }
                }, 1000);

                return () => clearTimeout(timeoutId);
            }, [formData.email]);

            const handleInputChange = (field, value) => {
                setFormData(prev => ({ ...prev, [field]: value }));
                
                // Clear error when user starts typing
                if (errors[field]) {
                    setErrors(prev => ({ ...prev, [field]: null }));
                }
            };

            const validateForm = () => {
                const newErrors = {};
                
                if (!formData.email) {
                    newErrors.email = 'Email is required';
                } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    newErrors.email = 'Please enter a valid email address';
                }
                
                if (!formData.first_name) {
                    newErrors.first_name = 'First name is required';
                }
                
                if (!formData.last_name) {
                    newErrors.last_name = 'Last name is required';
                }
                
                if (!formData.profession) {
                    newErrors.profession = 'Profession is required';
                }
                
                // Location validation: either US zip OR country, not both
                if (!formData.us_zip_code && !formData.country) {
                    newErrors.location = 'Please provide either US zip code or country';
                }
                
                if (formData.us_zip_code && formData.country) {
                    newErrors.location = 'Please provide either US zip code OR country, not both';
                }
                
                // US zip code format validation
                if (formData.us_zip_code && !/^\d{5}(-\d{4})?$/.test(formData.us_zip_code)) {
                    newErrors.us_zip_code = 'Please enter a valid US zip code (12345 or 12345-6789)';
                }
                
                setErrors(newErrors);
                return Object.keys(newErrors).length === 0;
            };

            const handleNext = async () => {
                if (!validateForm()) return;
                
                setIsSaving(true);
                try {
                    // Save page 1 data to Supabase
                    await onSave('user_profile', formData);
                    onNext();
                } catch (error) {
                    console.error('Error saving user profile:', error);
                    alert('Error saving your information. Please try again.');
                } finally {
                    setIsSaving(false);
                }
            };

            return h('div', { className: 'survey-page user-profile-page' }, [
                h('div', { className: 'page-header' }, [
                    h('h2', { className: 'page-title' }, 'About You'),
                    h('p', { className: 'page-description' }, 
                        'Let\'s start with some basic information about you and your firm.'
                    )
                ]),
                
                h('div', { className: 'form-section' }, [
                    h('div', { className: 'form-group' }, [
                        h('label', { 
                            htmlFor: 'email',
                            className: 'form-label required'
                        }, 'Email Address'),
                        h('div', { className: 'input-with-status' }, [
                            h('input', {
                                type: 'email',
                                id: 'email',
                                className: `form-input ${errors.email ? 'error' : ''}`,
                                value: formData.email,
                                onChange: (e) => handleInputChange('email', e.target.value),
                                placeholder: 'Enter your email address',
                                required: true
                            }),
                            isValidatingEmail && h('div', { className: 'validation-spinner' }, 'Checking...'),
                            emailValidationStatus === 'found' && h('div', { className: 'validation-success' }, '✓ Found in our records'),
                            emailValidationStatus === 'not_found' && h('div', { className: 'validation-info' }, 'New contact - we\'ll create a record')
                        ]),
                        errors.email && h('div', { className: 'form-error' }, errors.email)
                    ]),
                    
                    h('div', { className: 'form-row' }, [
                        h('div', { className: 'form-group' }, [
                            h('label', { 
                                htmlFor: 'first_name',
                                className: 'form-label required'
                            }, 'First Name'),
                            h('input', {
                                type: 'text',
                                id: 'first_name',
                                className: `form-input ${errors.first_name ? 'error' : ''}`,
                                value: formData.first_name,
                                onChange: (e) => handleInputChange('first_name', e.target.value),
                                placeholder: 'Enter your first name',
                                required: true
                            }),
                            errors.first_name && h('div', { className: 'form-error' }, errors.first_name)
                        ]),
                        
                        h('div', { className: 'form-group' }, [
                            h('label', { 
                                htmlFor: 'last_name',
                                className: 'form-label required'
                            }, 'Last Name'),
                            h('input', {
                                type: 'text',
                                id: 'last_name',
                                className: `form-input ${errors.last_name ? 'error' : ''}`,
                                value: formData.last_name,
                                onChange: (e) => handleInputChange('last_name', e.target.value),
                                placeholder: 'Enter your last name',
                                required: true
                            }),
                            errors.last_name && h('div', { className: 'form-error' }, errors.last_name)
                        ])
                    ]),
                    
                    h('div', { className: 'form-group' }, [
                        h('label', { 
                            htmlFor: 'profession',
                            className: 'form-label required'
                        }, 'Profession'),
                        h('select', {
                            id: 'profession',
                            className: `form-select ${errors.profession ? 'error' : ''}`,
                            value: formData.profession,
                            onChange: (e) => handleInputChange('profession', e.target.value),
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
                        ]),
                        errors.profession && h('div', { className: 'form-error' }, errors.profession)
                    ]),
                    
                    h('div', { className: 'form-group' }, [
                        h('label', { 
                            className: 'form-label required'
                        }, 'Firm Location'),
                        h('div', { className: 'location-inputs' }, [
                            h('div', { className: 'form-group' }, [
                                h('label', { 
                                    htmlFor: 'us_zip_code',
                                    className: 'form-label'
                                }, 'US Zip Code'),
                                h('input', {
                                    type: 'text',
                                    id: 'us_zip_code',
                                    className: `form-input ${errors.us_zip_code ? 'error' : ''}`,
                                    value: formData.us_zip_code,
                                    onChange: (e) => {
                                        const value = e.target.value;
                                        handleInputChange('us_zip_code', value);
                                        if (value) {
                                            handleInputChange('country', 'United States');
                                        }
                                    },
                                    placeholder: '12345 or 12345-6789',
                                    pattern: '\\d{5}(-\\d{4})?'
                                }),
                                errors.us_zip_code && h('div', { className: 'form-error' }, errors.us_zip_code)
                            ]),
                            
                            h('div', { className: 'form-group' }, [
                                h('label', { 
                                    htmlFor: 'country',
                                    className: 'form-label'
                                }, 'Country (if outside US)'),
                                h('select', {
                                    id: 'country',
                                    className: `form-select ${errors.country ? 'error' : ''}`,
                                    value: formData.country,
                                    onChange: (e) => {
                                        const value = e.target.value;
                                        handleInputChange('country', value);
                                        if (value && value !== 'United States') {
                                            handleInputChange('us_zip_code', '');
                                        }
                                    }
                                }, [
                                    h('option', { value: '' }, 'Select country'),
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
                                ]),
                                errors.country && h('div', { className: 'form-error' }, errors.country)
                            ])
                        ]),
                        errors.location && h('div', { className: 'form-error' }, errors.location)
                    ])
                ]),
                
                h('div', { className: 'page-navigation' }, [
                    h('button', {
                        className: 'btn btn-primary btn-large',
                        onClick: handleNext,
                        disabled: isSaving,
                        style: { width: '100%' }
                    }, isSaving ? 'Saving...' : 'Continue to Deal Information')
                ])
            ]);
        }

        // Main Multi-Page Survey Component
        function MultiPageSurvey() {
            const [currentPage, setCurrentPage] = useState(1);
            const [surveyData, setSurveyData] = useState({});
            const [isLoading, setIsLoading] = useState(false);
            const [isCompleted, setIsCompleted] = useState(false);

            const totalPages = 5;

            const handlePageSave = async (pageKey, data) => {
                setIsLoading(true);
                try {
                    // Save to Supabase via Edge Function
                    const response = await fetch('https://ffgjqlmulaqtfopgwenf.functions.supabase.co/survey-save-draft', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('supabase_token') || ''}`
                        },
                        body: JSON.stringify({
                            page: pageKey,
                            data: data,
                            page_number: currentPage
                        })
                    });
                    
                    if (!response.ok) {
                        throw new Error('Failed to save page data');
                    }
                    
                    // Update local state
                    setSurveyData(prev => ({ ...prev, [pageKey]: data }));
                } catch (error) {
                    console.error('Error saving page:', error);
                    throw error;
                } finally {
                    setIsLoading(false);
                }
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
                        return h('div', { className: 'survey-page' }, [
                            h('h2', null, 'Page 2: Closed Deals Data'),
                            h('p', null, 'This page will collect information about deals that closed in the first half of 2025.')
                        ]);
                    case 3:
                        return h('div', { className: 'survey-page' }, [
                            h('h2', null, 'Page 3: Current Active Deals'),
                            h('p', null, 'This page will collect information about your current active deals.')
                        ]);
                    case 4:
                        return h('div', { className: 'survey-page' }, [
                            h('h2', null, 'Page 4: Looking Ahead'),
                            h('p', null, 'This page will collect your predictions and market outlook.')
                        ]);
                    case 5:
                        return h('div', { className: 'survey-page' }, [
                            h('h2', null, 'Page 5: About You'),
                            h('p', null, 'This page will collect information about survey value and membership interest.')
                        ]);
                    default:
                        return h('div', null, 'Unknown page');
                }
            };

            if (isCompleted) {
                return h('div', { className: 'survey-completion' }, [
                    h('div', { className: 'completion-icon' }, '✓'),
                    h('h2', { className: 'completion-title' }, 'Survey Completed!'),
                    h('p', { className: 'completion-message' }, 
                        'Thank you for completing the AM&AA Market Survey. Your responses have been submitted successfully.'
                    ),
                    h('div', { style: { display: 'flex', gap: 'var(--space-16)', justifyContent: 'center' } }, [
                        h('a', {
                            href: '/dashboard',
                            className: 'btn btn-primary'
                        }, 'Go to Dashboard'),
                        h('a', {
                            href: '/insights',
                            className: 'btn btn-secondary'
                        }, 'View Insights')
                    ])
                ]);
            }

            return h('div', { className: 'multi-page-survey' }, [
                h('div', { className: 'survey-header' }, [
                    h('h1', { className: 'survey-title' }, 'AM&AA Market Survey - Summer 2025'),
                    h('p', { className: 'survey-description' }, 
                        'Help us understand the current state of the middle market by sharing your insights.'
                    )
                ]),
                
                h(ProgressBar, {
                    currentPage: currentPage,
                    totalPages: totalPages
                }),
                
                h('div', { className: 'survey-content' }, renderCurrentPage()),
                
                h('div', { className: 'survey-navigation' }, [
                    currentPage > 1 && h('button', {
                        className: 'btn btn-secondary',
                        onClick: handlePrevPage,
                        disabled: isLoading
                    }, 'Previous'),
                    
                    currentPage < totalPages && h('button', {
                        className: 'btn btn-primary',
                        onClick: handleNextPage,
                        disabled: isLoading
                    }, 'Next'),
                    
                    currentPage === totalPages && h('button', {
                        className: 'btn btn-primary btn-large',
                        onClick: () => setIsCompleted(true),
                        disabled: isLoading
                    }, 'Complete Survey')
                ])
            ]);
        }

        // Main App Component
        function SurveyApp() {
            return h(MultiPageSurvey);
        }

        // Mount the React app
        const container = document.getElementById('survey-root');
        if (container) {
            if (ReactDOM.createRoot) {
                ReactDOM.createRoot(container).render(h(SurveyApp));
            } else {
                ReactDOM.render(h(SurveyApp), container);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForDependencies);
    } else {
        waitForDependencies();
    }
})();