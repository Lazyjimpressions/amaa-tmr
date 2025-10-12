// AMAA TMR Survey React App - Multi-Page Survey
(function() {
    'use strict';

    console.log('NEW MULTI-PAGE SURVEY LOADING - VERSION 1.0.5');

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

        // Page 2: Closed Deals Data Component
        function ClosedDealsPage({ onNext, onSave }) {
            const [formData, setFormData] = useState({
                closed_deals_count: '',
                deals: [],
                success_fees: {
                    under_10m: '',
                    '10m_50m': '',
                    '50m_100m': '',
                    over_100m: ''
                },
                retainer_fees: {
                    under_10m: '',
                    '10m_50m': '',
                    '50m_100m': '',
                    over_100m: ''
                },
                post_close_compensation: ''
            });
            const [errors, setErrors] = useState({});
            const [isSaving, setIsSaving] = useState(false);

            // Handle deal count change
            const handleDealCountChange = (count) => {
                const numDeals = parseInt(count) || 0;
                const currentDeals = formData.deals || [];
                
                // Adjust deals array to match count
                let newDeals = [...currentDeals];
                if (numDeals > currentDeals.length) {
                    // Add new empty deals
                    for (let i = currentDeals.length; i < numDeals; i++) {
                        newDeals.push({
                            id: `deal_${i + 1}`,
                            deal_size: '',
                            industry: '',
                            transaction_type: '',
                            status: 'closed'
                        });
                    }
                } else if (numDeals < currentDeals.length) {
                    // Remove excess deals
                    newDeals = newDeals.slice(0, numDeals);
                }

                setFormData(prev => ({
                    ...prev,
                    closed_deals_count: count,
                    deals: newDeals
                }));
            };

            // Handle individual deal change
            const handleDealChange = (index, field, value) => {
                const newDeals = [...formData.deals];
                newDeals[index] = { ...newDeals[index], [field]: value };
                setFormData(prev => ({ ...prev, deals: newDeals }));
            };

            // Add new deal
            const handleAddDeal = () => {
                const currentCount = parseInt(formData.closed_deals_count) || 0;
                const newCount = currentCount + 1;
                
                // Show confirmation if adding more than originally stated
                if (currentCount > 0) {
                    const confirmed = confirm(
                        `You originally stated ${currentCount} closed deals. Are you sure you want to add another deal? This will update your total to ${newCount} deals.`
                    );
                    if (!confirmed) return;
                }
                
                handleDealCountChange(newCount.toString());
            };

            // Form validation
            const validateForm = () => {
                const newErrors = {};
                
                if (!formData.closed_deals_count || formData.closed_deals_count === '0') {
                    newErrors.closed_deals_count = 'Please enter the number of closed deals';
                }
                
                // Validate individual deals if count > 0
                if (parseInt(formData.closed_deals_count) > 0) {
                    formData.deals.forEach((deal, index) => {
                        if (!deal.deal_size) {
                            newErrors[`deal_${index}_size`] = 'Deal size is required';
                        }
                        if (!deal.industry) {
                            newErrors[`deal_${index}_industry`] = 'Industry is required';
                        }
                        if (!deal.transaction_type) {
                            newErrors[`deal_${index}_transaction_type`] = 'Transaction type is required';
                        }
                    });
                }
                
                setErrors(newErrors);
                return Object.keys(newErrors).length === 0;
            };

            // Handle form submission
            const handleSubmit = async (e) => {
                e.preventDefault();
                
                if (!validateForm()) {
                    return;
                }
                
                setIsSaving(true);
                try {
                    await onSave(formData);
                    onNext();
                } catch (error) {
                    console.error('Save error:', error);
                    alert('Failed to save progress. Please try again.');
                } finally {
                    setIsSaving(false);
                }
            };

            return h('div', { className: 'survey-page' }, [
                h('div', { className: 'page-header' }, [
                    h('h2', { className: 'page-title' }, 'Closed Deals Data'),
                    h('p', { className: 'page-description' }, 
                        'Tell us about the deals you closed in the first half of 2025'
                    )
                ]),
                
                h('form', { 
                    className: 'survey-form',
                    onSubmit: handleSubmit
                }, [
                    // Deal Count Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Deal Count'),
                        h('div', { className: 'form-group' }, [
                            h('label', { 
                                className: 'form-label',
                                htmlFor: 'closed_deals_count'
                            }, 'How many deals did you work on that CLOSED or will close by the end of June 2025?'),
                            h('input', {
                                type: 'number',
                                id: 'closed_deals_count',
                                className: `form-input ${errors.closed_deals_count ? 'error' : ''}`,
                                value: formData.closed_deals_count,
                                onChange: (e) => handleDealCountChange(e.target.value),
                                min: '0',
                                placeholder: 'Enter number of deals'
                            }),
                            errors.closed_deals_count && h('div', { 
                                className: 'form-error' 
                            }, errors.closed_deals_count)
                        ])
                    ]),

                    // Deal Details Section (only show if count > 0)
                    parseInt(formData.closed_deals_count) > 0 && h('div', { className: 'form-section' }, [
                        h('div', { className: 'section-header' }, [
                            h('h3', { className: 'section-title' }, 'Deal Details'),
                            h('button', {
                                type: 'button',
                                className: 'btn btn-secondary btn-sm',
                                onClick: handleAddDeal
                            }, '+ Add Deal')
                        ]),
                        
                        h('div', { className: 'deals-table-container' }, [
                            h('div', { className: 'deals-table' }, [
                                // Table Header
                                h('div', { className: 'table-header' }, [
                                    h('div', { className: 'table-cell' }, 'Deal #'),
                                    h('div', { className: 'table-cell' }, 'Deal Size (Millions)'),
                                    h('div', { className: 'table-cell' }, 'Industry'),
                                    h('div', { className: 'table-cell' }, 'Transaction Type')
                                ]),
                                
                                // Table Rows
                                formData.deals.map((deal, index) => 
                                    h('div', { 
                                        key: deal.id,
                                        className: 'table-row'
                                    }, [
                                        h('div', { className: 'table-cell' }, `Deal ${index + 1}`),
                                        h('div', { className: 'table-cell' }, 
                                            h('input', {
                                                type: 'number',
                                                className: `form-input ${errors[`deal_${index}_size`] ? 'error' : ''}`,
                                                value: deal.deal_size,
                                                onChange: (e) => handleDealChange(index, 'deal_size', e.target.value),
                                                placeholder: 'e.g., 10.5',
                                                step: '0.1'
                                            })
                                        ),
                                        h('div', { className: 'table-cell' }, 
                                            h('select', {
                                                className: `form-select ${errors[`deal_${index}_industry`] ? 'error' : ''}`,
                                                value: deal.industry,
                                                onChange: (e) => handleDealChange(index, 'industry', e.target.value)
                                            }, [
                                                h('option', { value: '' }, 'Select industry'),
                                                h('option', { value: 'technology' }, 'Technology'),
                                                h('option', { value: 'healthcare' }, 'Healthcare'),
                                                h('option', { value: 'manufacturing' }, 'Manufacturing'),
                                                h('option', { value: 'retail' }, 'Retail'),
                                                h('option', { value: 'services' }, 'Services'),
                                                h('option', { value: 'real_estate' }, 'Real Estate'),
                                                h('option', { value: 'financial_services' }, 'Financial Services'),
                                                h('option', { value: 'other' }, 'Other')
                                            ])
                                        ),
                                        h('div', { className: 'table-cell' }, 
                                            h('select', {
                                                className: `form-select ${errors[`deal_${index}_transaction_type`] ? 'error' : ''}`,
                                                value: deal.transaction_type,
                                                onChange: (e) => handleDealChange(index, 'transaction_type', e.target.value)
                                            }, [
                                                h('option', { value: '' }, 'Select type'),
                                                h('option', { value: 'sell_side' }, 'Sell-Side'),
                                                h('option', { value: 'buy_side' }, 'Buy-Side'),
                                                h('option', { value: 'recapitalization' }, 'Recapitalization'),
                                                h('option', { value: 'merger' }, 'Merger'),
                                                h('option', { value: 'other' }, 'Other')
                                            ])
                                        )
                                    ])
                                )
                            ])
                        ])
                    ]),

                    // Financial Metrics Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Financial Metrics'),
                        h('p', { className: 'section-description' }, 
                            'Please provide average fees for deals closed in the first half of 2025'
                        ),
                        
                        // Success Fees
                        h('div', { className: 'form-group' }, [
                            h('label', { className: 'form-label' }, 'Average Success Fee/Commission (%)'),
                            h('div', { className: 'fees-grid' }, [
                                h('div', { className: 'fee-item' }, [
                                    h('label', { className: 'fee-label' }, 'Under $10M'),
                                    h('input', {
                                        type: 'number',
                                        className: 'form-input',
                                        value: formData.success_fees.under_10m,
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            success_fees: { ...prev.success_fees, under_10m: e.target.value }
                                        })),
                                        placeholder: 'e.g., 3.5',
                                        step: '0.1'
                                    })
                                ]),
                                h('div', { className: 'fee-item' }, [
                                    h('label', { className: 'fee-label' }, '$10M - $50M'),
                                    h('input', {
                                        type: 'number',
                                        className: 'form-input',
                                        value: formData.success_fees['10m_50m'],
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            success_fees: { ...prev.success_fees, '10m_50m': e.target.value }
                                        })),
                                        placeholder: 'e.g., 2.8',
                                        step: '0.1'
                                    })
                                ]),
                                h('div', { className: 'fee-item' }, [
                                    h('label', { className: 'fee-label' }, '$50M - $100M'),
                                    h('input', {
                                        type: 'number',
                                        className: 'form-input',
                                        value: formData.success_fees['50m_100m'],
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            success_fees: { ...prev.success_fees, '50m_100m': e.target.value }
                                        })),
                                        placeholder: 'e.g., 2.2',
                                        step: '0.1'
                                    })
                                ]),
                                h('div', { className: 'fee-item' }, [
                                    h('label', { className: 'fee-label' }, 'Over $100M'),
                                    h('input', {
                                        type: 'number',
                                        className: 'form-input',
                                        value: formData.success_fees.over_100m,
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            success_fees: { ...prev.success_fees, over_100m: e.target.value }
                                        })),
                                        placeholder: 'e.g., 1.8',
                                        step: '0.1'
                                    })
                                ])
                            ])
                        ]),

                        // Retainer Fees
                        h('div', { className: 'form-group' }, [
                            h('label', { className: 'form-label' }, 'Average Retainer Fee ($)'),
                            h('div', { className: 'fees-grid' }, [
                                h('div', { className: 'fee-item' }, [
                                    h('label', { className: 'fee-label' }, 'Under $10M'),
                                    h('input', {
                                        type: 'number',
                                        className: 'form-input',
                                        value: formData.retainer_fees.under_10m,
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            retainer_fees: { ...prev.retainer_fees, under_10m: e.target.value }
                                        })),
                                        placeholder: 'e.g., 25000',
                                        step: '1000'
                                    })
                                ]),
                                h('div', { className: 'fee-item' }, [
                                    h('label', { className: 'fee-label' }, '$10M - $50M'),
                                    h('input', {
                                        type: 'number',
                                        className: 'form-input',
                                        value: formData.retainer_fees['10m_50m'],
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            retainer_fees: { ...prev.retainer_fees, '10m_50m': e.target.value }
                                        })),
                                        placeholder: 'e.g., 50000',
                                        step: '1000'
                                    })
                                ]),
                                h('div', { className: 'fee-item' }, [
                                    h('label', { className: 'fee-label' }, '$50M - $100M'),
                                    h('input', {
                                        type: 'number',
                                        className: 'form-input',
                                        value: formData.retainer_fees['50m_100m'],
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            retainer_fees: { ...prev.retainer_fees, '50m_100m': e.target.value }
                                        })),
                                        placeholder: 'e.g., 75000',
                                        step: '1000'
                                    })
                                ]),
                                h('div', { className: 'fee-item' }, [
                                    h('label', { className: 'fee-label' }, 'Over $100M'),
                                    h('input', {
                                        type: 'number',
                                        className: 'form-input',
                                        value: formData.retainer_fees.over_100m,
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            retainer_fees: { ...prev.retainer_fees, over_100m: e.target.value }
                                        })),
                                        placeholder: 'e.g., 100000',
                                        step: '1000'
                                    })
                                ])
                            ])
                        ]),

                        // Post-Close Compensation
                        h('div', { className: 'form-group' }, [
                            h('label', { className: 'form-label' }, 'How often was Post-Close Salary/Compensation included?'),
                            h('select', {
                                className: 'form-select',
                                value: formData.post_close_compensation,
                                onChange: (e) => setFormData(prev => ({
                                    ...prev,
                                    post_close_compensation: e.target.value
                                }))
                            }, [
                                h('option', { value: '' }, 'Select frequency'),
                                h('option', { value: 'always' }, 'Always (100%)'),
                                h('option', { value: 'often' }, 'Often (75-99%)'),
                                h('option', { value: 'sometimes' }, 'Sometimes (50-74%)'),
                                h('option', { value: 'rarely' }, 'Rarely (25-49%)'),
                                h('option', { value: 'never' }, 'Never (0-24%)')
                            ])
                        ])
                    ]),

                    // Form Actions
                    h('div', { className: 'form-actions' }, [
                        h('button', {
                            type: 'submit',
                            className: 'btn btn-primary btn-large',
                            disabled: isSaving
                        }, isSaving ? 'Saving...' : 'Continue to Active Deals')
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
                        return h(ClosedDealsPage, {
                            onNext: handleNextPage,
                            onSave: handlePageSave
                        });
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