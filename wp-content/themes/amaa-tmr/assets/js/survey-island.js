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

    // Deal Table Component
    function DealTable({ question, dealData, onDealChange, formData }) {
        const [deals, setDeals] = useState(dealData || Array(5).fill({}));
        const [errors, setErrors] = useState({});
        
        // Initialize deals with empty objects if not provided
        useEffect(() => {
            if (!dealData || dealData.length === 0) {
                const emptyDeals = Array(5).fill({});
                setDeals(emptyDeals);
                onDealChange(emptyDeals);
            }
        }, [dealData, onDealChange]);
        
        // Handle individual deal field updates
        const handleDealUpdate = (index, field, value) => {
            const updatedDeals = [...deals];
            updatedDeals[index] = { ...updatedDeals[index], [field]: value };
            setDeals(updatedDeals);
            onDealChange(updatedDeals);
            
            // Clear field error when user starts typing
            if (errors[`${index}_${field}`]) {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[`${index}_${field}`];
                    return newErrors;
                });
            }
        };
        
        // Validate deal field
        const validateField = (field, value, index) => {
            if (!value && field !== 'escrow_held_close_usd_m' && field !== 'note_amount_close_usd_m' && 
                field !== 'rolled_equity_close_usd_m' && field !== 'earnout_after_close_usd_m' &&
                field !== 'revenue_growth_rate_pct' && field !== 'number_employees' &&
                field !== 'sell_side_success_fee_pct' && field !== 'sell_side_retainer_fee_usd_m') {
                return null; // Allow empty for optional fields
            }
            
            switch (field) {
                case 'total_consideration_ev_usd_m':
                    const dealValue = parseFloat(value);
                    if (dealValue < 1 || dealValue > 500) {
                        return 'Deal value must be between $1M and $500M';
                    }
                    break;
                case 'cash_paid_close_usd_m':
                    const cashValue = parseFloat(value);
                    if (cashValue < 0 || cashValue > 500) {
                        return 'Cash paid must be between $0M and $500M';
                    }
                    break;
                case 'annual_revenue_usd_m':
                    const revenueValue = parseFloat(value);
                    if (revenueValue < 0 || revenueValue > 999.99) {
                        return 'Revenue must be between $0M and $999.99M';
                    }
                    break;
                case 'adjusted_ebitda_usd_m':
                    const ebitdaValue = parseFloat(value);
                    if (ebitdaValue < 0 || ebitdaValue > 999.99) {
                        return 'EBITDA must be between $0M and $999.99M';
                    }
                    break;
                case 'sell_side_success_fee_pct':
                    const feeValue = parseFloat(value);
                    if (feeValue < 0 || feeValue > 12) {
                        return 'Success fee must be between 0% and 12%';
                    }
                    break;
                case 'sell_side_retainer_fee_usd_m':
                    const retainerValue = parseFloat(value);
                    if (retainerValue < 0 || retainerValue > 0.2) {
                        return 'Retainer fee must be between $0M and $0.2M';
                    }
                    break;
            }
            return null;
        };
        
        // Handle field blur for validation
        const handleFieldBlur = (index, field, value) => {
            const error = validateField(field, value, index);
            if (error) {
                setErrors(prev => ({ ...prev, [`${index}_${field}`]: error }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[`${index}_${field}`];
                    return newErrors;
                });
            }
        };
        
        // Get industry options
        const industryOptions = [
            'Technology', 'Healthcare', 'Financial Services', 'Manufacturing',
            'Business Services-B2B', 'Business Services-B2C', 'Consumer Products',
            'Energy', 'Real Estate', 'Transportation', 'Other'
        ];
        
        // Get buyer type options
        const buyerTypeOptions = [
            'Corporate - Strategic, Competitor, Synergistic',
            'Corporate - Financial, Non-Strategic',
            'Private Equity - Platform',
            'Private Equity - Add-on',
            'Private Equity - Roll-up',
            'Family Office',
            'Individual',
            'Other'
        ];
        
        // Get month options
        const monthOptions = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        return h('div', { className: 'deal-table-container' }, [
            h('div', { className: 'deal-table-header' }, [
                h('h4', { className: 'deal-table-title' }, question.text),
                h('p', { className: 'deal-table-description' }, 
                    'Enter details for up to 5 deals. Leave rows blank if you have fewer deals.'
                )
            ]),
            
            h('div', { className: 'deals-table-container' }, [
                h('table', { className: 'deals-table' }, [
                    // Table Header
                    h('thead', { className: 'table-header' }, [
                        h('tr', { className: 'table-row' }, [
                            h('th', { className: 'table-cell' }, 'Industry'),
                            h('th', { className: 'table-cell' }, 'Deal Value ($M)'),
                            h('th', { className: 'table-cell' }, 'Cash at Close ($M)'),
                            h('th', { className: 'table-cell' }, 'Revenue ($M)'),
                            h('th', { className: 'table-cell' }, 'EBITDA ($M)'),
                            h('th', { className: 'table-cell' }, 'Buyer Type'),
                            h('th', { className: 'table-cell' }, 'Month Close'),
                            h('th', { className: 'table-cell' }, 'Success Fee (%)'),
                            h('th', { className: 'table-cell' }, 'Retainer Fee ($M)')
                        ])
                    ]),
                    
                    // Table Body - 5 static rows
                    h('tbody', null, deals.map((deal, index) => 
                        h('tr', { key: index, className: 'table-row' }, [
                            // Industry
                            h('td', { className: 'table-cell' }, [
                                h('select', {
                                    value: deal.industry || '',
                                    onChange: (e) => handleDealUpdate(index, 'industry', e.target.value),
                                    onBlur: (e) => handleFieldBlur(index, 'industry', e.target.value),
                                    className: errors[`${index}_industry`] ? 'form-select error' : 'form-select'
                                }, [
                                    h('option', { value: '' }, 'Select Industry...'),
                                    ...industryOptions.map(option => 
                                        h('option', { key: option, value: option }, option)
                                    )
                                ]),
                                errors[`${index}_industry`] && h('div', { className: 'field-error' }, errors[`${index}_industry`])
                            ]),
                            
                            // Deal Value
                            h('td', { className: 'table-cell' }, [
                                h('input', {
                                    type: 'number',
                                    value: deal.total_consideration_ev_usd_m || '',
                                    onChange: (e) => handleDealUpdate(index, 'total_consideration_ev_usd_m', e.target.value),
                                    onBlur: (e) => handleFieldBlur(index, 'total_consideration_ev_usd_m', e.target.value),
                                    placeholder: '10.5',
                                    step: '0.1',
                                    min: '1',
                                    max: '500',
                                    className: errors[`${index}_total_consideration_ev_usd_m`] ? 'form-input error' : 'form-input'
                                }),
                                errors[`${index}_total_consideration_ev_usd_m`] && h('div', { className: 'field-error' }, errors[`${index}_total_consideration_ev_usd_m`])
                            ]),
                            
                            // Cash at Close
                            h('td', { className: 'table-cell' }, [
                                h('input', {
                                    type: 'number',
                                    value: deal.cash_paid_close_usd_m || '',
                                    onChange: (e) => handleDealUpdate(index, 'cash_paid_close_usd_m', e.target.value),
                                    onBlur: (e) => handleFieldBlur(index, 'cash_paid_close_usd_m', e.target.value),
                                    placeholder: '8.0',
                                    step: '0.1',
                                    min: '0',
                                    max: '500',
                                    className: errors[`${index}_cash_paid_close_usd_m`] ? 'form-input error' : 'form-input'
                                }),
                                errors[`${index}_cash_paid_close_usd_m`] && h('div', { className: 'field-error' }, errors[`${index}_cash_paid_close_usd_m`])
                            ]),
                            
                            // Revenue
                            h('td', { className: 'table-cell' }, [
                                h('input', {
                                    type: 'number',
                                    value: deal.annual_revenue_usd_m || '',
                                    onChange: (e) => handleDealUpdate(index, 'annual_revenue_usd_m', e.target.value),
                                    onBlur: (e) => handleFieldBlur(index, 'annual_revenue_usd_m', e.target.value),
                                    placeholder: '15.2',
                                    step: '0.01',
                                    min: '0',
                                    max: '999.99',
                                    className: errors[`${index}_annual_revenue_usd_m`] ? 'form-input error' : 'form-input'
                                }),
                                errors[`${index}_annual_revenue_usd_m`] && h('div', { className: 'field-error' }, errors[`${index}_annual_revenue_usd_m`])
                            ]),
                            
                            // EBITDA
                            h('td', { className: 'table-cell' }, [
                                h('input', {
                                    type: 'number',
                                    value: deal.adjusted_ebitda_usd_m || '',
                                    onChange: (e) => handleDealUpdate(index, 'adjusted_ebitda_usd_m', e.target.value),
                                    onBlur: (e) => handleFieldBlur(index, 'adjusted_ebitda_usd_m', e.target.value),
                                    placeholder: '3.8',
                                    step: '0.01',
                                    min: '0',
                                    max: '999.99',
                                    className: errors[`${index}_adjusted_ebitda_usd_m`] ? 'form-input error' : 'form-input'
                                }),
                                errors[`${index}_adjusted_ebitda_usd_m`] && h('div', { className: 'field-error' }, errors[`${index}_adjusted_ebitda_usd_m`])
                            ]),
                            
                            // Buyer Type
                            h('td', { className: 'table-cell' }, [
                                h('select', {
                                    value: deal.buyer_type || '',
                                    onChange: (e) => handleDealUpdate(index, 'buyer_type', e.target.value),
                                    onBlur: (e) => handleFieldBlur(index, 'buyer_type', e.target.value),
                                    className: errors[`${index}_buyer_type`] ? 'form-select error' : 'form-select'
                                }, [
                                    h('option', { value: '' }, 'Select Buyer Type...'),
                                    ...buyerTypeOptions.map(option => 
                                        h('option', { key: option, value: option }, option)
                                    )
                                ]),
                                errors[`${index}_buyer_type`] && h('div', { className: 'field-error' }, errors[`${index}_buyer_type`])
                            ]),
                            
                            // Month Close
                            h('td', { className: 'table-cell' }, [
                                h('select', {
                                    value: deal.month_close || '',
                                    onChange: (e) => handleDealUpdate(index, 'month_close', e.target.value),
                                    onBlur: (e) => handleFieldBlur(index, 'month_close', e.target.value),
                                    className: errors[`${index}_month_close`] ? 'form-select error' : 'form-select'
                                }, [
                                    h('option', { value: '' }, 'Select Month...'),
                                    ...monthOptions.map(option => 
                                        h('option', { key: option, value: option }, option)
                                    )
                                ]),
                                errors[`${index}_month_close`] && h('div', { className: 'field-error' }, errors[`${index}_month_close`])
                            ]),
                            
                            // Success Fee
                            h('td', { className: 'table-cell' }, [
                                h('input', {
                                    type: 'number',
                                    value: deal.sell_side_success_fee_pct || '',
                                    onChange: (e) => handleDealUpdate(index, 'sell_side_success_fee_pct', e.target.value),
                                    onBlur: (e) => handleFieldBlur(index, 'sell_side_success_fee_pct', e.target.value),
                                    placeholder: '2.5',
                                    step: '0.1',
                                    min: '0',
                                    max: '12',
                                    className: errors[`${index}_sell_side_success_fee_pct`] ? 'form-input error' : 'form-input'
                                }),
                                errors[`${index}_sell_side_success_fee_pct`] && h('div', { className: 'field-error' }, errors[`${index}_sell_side_success_fee_pct`])
                            ]),
                            
                            // Retainer Fee
                            h('td', { className: 'table-cell' }, [
                                h('input', {
                                    type: 'number',
                                    value: deal.sell_side_retainer_fee_usd_m || '',
                                    onChange: (e) => handleDealUpdate(index, 'sell_side_retainer_fee_usd_m', e.target.value),
                                    onBlur: (e) => handleFieldBlur(index, 'sell_side_retainer_fee_usd_m', e.target.value),
                                    placeholder: '0.05',
                                    step: '0.01',
                                    min: '0',
                                    max: '0.2',
                                    className: errors[`${index}_sell_side_retainer_fee_usd_m`] ? 'form-input error' : 'form-input'
                                }),
                                errors[`${index}_sell_side_retainer_fee_usd_m`] && h('div', { className: 'field-error' }, errors[`${index}_sell_side_retainer_fee_usd_m`])
                            ])
                        ])
                    ))
                ])
            ])
        ]);
    }

    // Matrix Question Component (for success/retainer fee matrices)
    function MatrixQuestion({ question, matrixData, onMatrixChange, formData }) {
        const [matrix, setMatrix] = useState(matrixData || {});
        
        // Deal size ranges for the matrix
        const dealSizeRanges = [
            'Under $1M', '$1M - $1.9M', '$2M - $3.9M', '$4M - $6.9M', '$7M - $9.9M',
            '$10M - $14.9M', '$15M - $19.9M', '$20M - $29.9M', '$30M - $49.9M',
            '$50M - $79.9M', '$80M - $99.9M', '$100M - $199M', '$200M+'
        ];
        
        const handleMatrixChange = (dealSize, value) => {
            const updatedMatrix = { ...matrix, [dealSize]: value };
            setMatrix(updatedMatrix);
            onMatrixChange(updatedMatrix);
        };
        
        return h('div', { className: 'matrix-question-container' }, [
            h('div', { className: 'matrix-table-container' }, [
                h('table', { className: 'matrix-table' }, [
                    h('thead', { className: 'table-header' }, [
                        h('tr', { className: 'table-row' }, [
                            h('th', { className: 'table-cell' }, 'Deal Size'),
                            h('th', { className: 'table-cell' }, 'Response')
                        ])
                    ]),
                    h('tbody', null, dealSizeRanges.map(dealSize => 
                        h('tr', { key: dealSize, className: 'table-row' }, [
                            h('td', { className: 'table-cell' }, dealSize),
                            h('td', { className: 'table-cell' }, [
                                h('select', {
                                    value: matrix[dealSize] || '',
                                    onChange: (e) => handleMatrixChange(dealSize, e.target.value),
                                    className: 'form-select'
                                }, [
                                    h('option', { value: '' }, 'Select...'),
                                    ...(question.options?.choices || []).map(choice => 
                                        h('option', { key: choice.value, value: choice.value }, choice.label)
                                    )
                                ])
                            ])
                        ])
                    ))
                ])
            ])
        ]);
    }

    // Radio Array Component (for sentiment arrays)
    function RadioArray({ question, arrayData, onArrayChange, formData }) {
        const [array, setArray] = useState(arrayData || {});
        
        // Impact factors for the radio array
        const impactFactors = [
            'Interest rate changes',
            'Impact of lending environment', 
            'Supply chain issues',
            'Labor shortages',
            'Worker motivation / commitment',
            'Labor / benefits costs',
            'Cost of goods / raw materials',
            'Global trade / economic climate',
            'Election/Political cycle',
            'Tariffs'
        ];
        
        const handleArrayChange = (factor, value) => {
            const updatedArray = { ...array, [factor]: value };
            setArray(updatedArray);
            onArrayChange(updatedArray);
        };
        
        return h('div', { className: 'radio-array-container' }, [
            h('div', { className: 'radio-array-table-container' }, [
                h('table', { className: 'radio-array-table' }, [
                    h('thead', { className: 'table-header' }, [
                        h('tr', { className: 'table-row' }, [
                            h('th', { className: 'table-cell' }, 'Factor'),
                            h('th', { className: 'table-cell' }, 'Impact Level')
                        ])
                    ]),
                    h('tbody', null, impactFactors.map(factor => 
                        h('tr', { key: factor, className: 'table-row' }, [
                            h('td', { className: 'table-cell' }, factor),
                            h('td', { className: 'table-cell' }, [
                                h('div', { className: 'radio-group' }, 
                                    (question.options?.choices || []).map(choice => 
                                        h('label', { key: choice.value, className: 'radio-item' }, [
                                            h('input', {
                                                type: 'radio',
                                                name: `question_${question.code}_${factor}`,
                                                value: choice.value,
                                                checked: array[factor] === choice.value,
                                                onChange: (e) => handleArrayChange(factor, e.target.value)
                                            }),
                                            h('span', { className: 'radio-label' }, choice.label)
                                        ])
                                    )
                                )
                            ])
                        ])
                    ))
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
                    }, [
                        h('span', { className: 'question-number' }, `${question.order}. `),
                        question.text
                    ]),
                    
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
                    }),
                    
                    // Deal Table Component
                    question.type === 'deal_table' && h(DealTable, {
                        question: question,
                        dealData: currentValue || [],
                        onDealChange: (deals) => setFormData(prev => ({ ...prev, [question.code]: deals })),
                        formData: formData
                    }),
                    
                    // Matrix Component (for success/retainer fee matrices)
                    question.type === 'matrix' && h(MatrixQuestion, {
                        question: question,
                        matrixData: currentValue || {},
                        onMatrixChange: (data) => setFormData(prev => ({ ...prev, [question.code]: data })),
                        formData: formData
                    }),
                    
                    // Radio Array Component (for sentiment arrays)
                    question.type === 'radio_array' && h(RadioArray, {
                        question: question,
                        arrayData: currentValue || {},
                        onArrayChange: (data) => setFormData(prev => ({ ...prev, [question.code]: data })),
                        formData: formData
                    }),
                    
                    // Multi Select Component
                    question.type === 'multi_select' && h('div', { className: 'checkbox-group' }, 
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
                    )
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