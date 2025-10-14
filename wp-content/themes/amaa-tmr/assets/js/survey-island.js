// AMAA TMR Survey React App - Multi-Page Survey
(function() {
    'use strict';

        console.log('NEW MULTI-PAGE SURVEY LOADING - VERSION 1.1.6');

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
            const [isSaving, setIsSaving] = useState(false);
            const [isAuthenticated, setIsAuthenticated] = useState(false);

            // Check auth status on mount
            useEffect(() => {
                const token = localStorage.getItem('supabase_token');
                const isAuth = !!token;
                setIsAuthenticated(isAuth);
                console.log('Auth status check:', { token: !!token, isAuth });
            }, []);

    // Use the working Edge Function - no JWT issues!
    const validateEmail = async (email) => {
        if (!email || !email.includes('@')) return;
        
        console.log('Email validation triggered for:', email);
        setIsValidatingEmail(true);
        
        try {
            // Use the working check-membership function
            const response = await fetch('https://ffgjqlmulaqtfopgwenf.functions.supabase.co/check-membership', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.toLowerCase() })
            });
            
            const data = await response.json();
            console.log('HubSpot lookup result:', data);
            
            if (data.found) {
                // Prepopulate from HubSpot
                const newFormData = {
                    ...formData,
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    profession: data.profession || '',
                    us_zip_code: data.us_zip_code || '',
                    country: data.country || ''
                };
                console.log('Prepopulating form with:', newFormData);
                setFormData(newFormData);
                
                // Store HubSpot data for later use
                localStorage.setItem('hubspot_contact_data', JSON.stringify({
                    hubspot_contact_id: data.hubspot_contact_id,
                    is_member: data.is_member
                }));
            }
            // If not found, no action - user fills form manually
            
        } catch (error) {
            console.error('Email validation error:', error);
            // Silent fail - user can still proceed
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
                
                // Allow US zip code with US country (auto-populated case)
                if (formData.us_zip_code && formData.country && formData.country !== 'United States') {
                    newErrors.location = 'Please provide either US zip code OR country, not both';
                }
                
                // US zip code format validation
                if (formData.us_zip_code && !/^\d{5}(-\d{4})?$/.test(formData.us_zip_code)) {
                    newErrors.us_zip_code = 'Please enter a valid US zip code (12345 or 12345-6789)';
                }
                
                setErrors(newErrors);
                return Object.keys(newErrors).length === 0;
            };

            const handleButtonClick = async () => {
                if (!validateForm()) return;
                
                const token = localStorage.getItem('supabase_token');
                
                if (token) {
                    // Already authenticated - save and proceed to next page
                    setIsSaving(true);
                    try {
                        await onSave('user_profile', formData);
                        onNext();
                    } catch (error) {
                        alert('Error saving your information. Please try again.');
                    } finally {
                        setIsSaving(false);
                    }
                } else {
                    // Not authenticated - send magic link
                    setIsSaving(true);
                    const success = await sendMagicLink(formData.email, {
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        profession: formData.profession,
                        us_zip_code: formData.us_zip_code,
                        country: formData.country
                    });
                    setIsSaving(false);
                }
            };

            return h('div', { className: 'survey-page user-profile-page' }, [
                h('div', { className: 'page-header' }, [
                    h('h2', { className: 'page-title' }, 'About You'),
                    h('p', { className: 'page-description' }, 
                        'Welcome! Please complete your profile to continue.'
                    )
                ]),
                
                h('div', { className: 'form-section' }, [
                    h('div', { className: 'form-group' }, [
                        h('label', { 
                            htmlFor: 'email',
                            className: 'form-label required'
                        }, 'Email Address'),
                        h('input', {
                            type: 'email',
                            id: 'email',
                            className: `form-input ${errors.email ? 'error' : ''}`,
                            value: formData.email,
                            onChange: (e) => handleInputChange('email', e.target.value),
                            placeholder: 'Enter your email address',
                            required: true
                        }),
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
                                            // Auto-populate country to US when zip code is entered
                                            handleInputChange('country', 'United States');
                                        } else {
                                            // Clear country when zip code is cleared
                                            handleInputChange('country', '');
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
                
                // Page-specific navigation removed - handled by global survey navigation
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
                            deal_index: i + 1,
                            total_consideration_ev_usd_m: '',
                            industry: '',
                            sub_industry: '',
                            buyer_type: '',
                            sell_side_success_fee_pct: '',
                            sell_side_retainer_fee_usd_m: '',
                            deal_period: 'closed_first_half_2025',
                            deal_status: 'closed',
                            annual_revenue_usd_m: '',
                            adjusted_ebitda_usd_m: '',
                            revenue_growth_rate_pct: '',
                            number_employees: '',
                            tariff_impact: '',
                            month_close: ''
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
                        if (!deal.total_consideration_ev_usd_m) {
                            newErrors[`deal_${index}_size`] = 'Deal size is required';
                        }
                        if (!deal.industry) {
                            newErrors[`deal_${index}_industry`] = 'Industry is required';
                        }
                        if (!deal.buyer_type) {
                            newErrors[`deal_${index}_buyer_type`] = 'Buyer type is required';
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
                    await onSave('closed_deals', formData);
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
                                    h('div', { className: 'table-cell' }, 'Buyer Type'),
                                    h('div', { className: 'table-cell' }, 'Success Fee (%)'),
                                    h('div', { className: 'table-cell' }, 'Retainer Fee ($M)')
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
                                                value: deal.total_consideration_ev_usd_m,
                                                onChange: (e) => handleDealChange(index, 'total_consideration_ev_usd_m', e.target.value),
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
                                                className: `form-select ${errors[`deal_${index}_buyer_type`] ? 'error' : ''}`,
                                                value: deal.buyer_type,
                                                onChange: (e) => handleDealChange(index, 'buyer_type', e.target.value)
                                            }, [
                                                h('option', { value: '' }, 'Select buyer type'),
                                                h('option', { value: 'Corporate - Strategic, Competitor, Synergistic' }, 'Corporate - Strategic'),
                                                h('option', { value: 'Private Equity - Platform' }, 'PE - Platform'),
                                                h('option', { value: 'Private Equity - Add-on' }, 'PE - Add-on'),
                                                h('option', { value: 'Independent (Fundless) - Sponsor' }, 'Independent Sponsor'),
                                                h('option', { value: 'Family Office' }, 'Family Office'),
                                                h('option', { value: 'Internal - Co-Owner(s)' }, 'Internal - Co-Owner'),
                                                h('option', { value: 'Internal-Management Group' }, 'Internal - Management'),
                                                h('option', { value: 'Individual' }, 'Individual'),
                                                h('option', { value: 'None/ Not applicable' }, 'None/Not applicable')
                                            ])
                                        ),
                                        h('div', { className: 'table-cell' }, 
                                            h('input', {
                                                type: 'number',
                                                className: `form-input ${errors[`deal_${index}_success_fee`] ? 'error' : ''}`,
                                                value: deal.sell_side_success_fee_pct,
                                                onChange: (e) => handleDealChange(index, 'sell_side_success_fee_pct', e.target.value),
                                                placeholder: 'e.g., 2.5',
                                                step: '0.1',
                                                max: '10'
                                            })
                                        ),
                                        h('div', { className: 'table-cell' }, 
                                            h('input', {
                                                type: 'number',
                                                className: `form-input ${errors[`deal_${index}_retainer_fee`] ? 'error' : ''}`,
                                                value: deal.sell_side_retainer_fee_usd_m,
                                                onChange: (e) => handleDealChange(index, 'sell_side_retainer_fee_usd_m', e.target.value),
                                                placeholder: 'e.g., 0.05',
                                                step: '0.01',
                                                max: '100'
                                            })
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

        // Page 3: Current Active Deals Component
        function ActiveDealsPage({ onNext, onSave }) {
            const [formData, setFormData] = useState({
                active_deals_count: '',
                prospective_deals_count: '',
                active_deals: [],
                deal_factors: {
                    market_conditions: '',
                    financing_availability: '',
                    buyer_sentiment: '',
                    seller_motivation: '',
                    regulatory_environment: ''
                },
                seller_motivations: [],
                seller_expectations: {
                    valuation: '',
                    timeline: '',
                    structure: '',
                    control: ''
                }
            });
            const [errors, setErrors] = useState({});
            const [isSaving, setIsSaving] = useState(false);

            // Handle active deals count change
            const handleActiveDealsCountChange = (count) => {
                const numDeals = parseInt(count) || 0;
                const currentDeals = formData.active_deals || [];
                
                // Adjust deals array to match count
                let newDeals = [...currentDeals];
                if (numDeals > currentDeals.length) {
                    // Add new empty deals
                    for (let i = currentDeals.length; i < numDeals; i++) {
                        newDeals.push({
                            id: `active_deal_${i + 1}`,
                            deal_size: '',
                            industry: '',
                            transaction_type: '',
                            status: 'active',
                            expected_close_date: ''
                        });
                    }
                } else if (numDeals < currentDeals.length) {
                    // Remove excess deals
                    newDeals = newDeals.slice(0, numDeals);
                }

                setFormData(prev => ({
                    ...prev,
                    active_deals_count: count,
                    active_deals: newDeals
                }));
            };

            // Handle individual active deal change
            const handleActiveDealChange = (index, field, value) => {
                const newDeals = [...formData.active_deals];
                newDeals[index] = { ...newDeals[index], [field]: value };
                setFormData(prev => ({ ...prev, active_deals: newDeals }));
            };

            // Add new active deal
            const handleAddActiveDeal = () => {
                const currentCount = parseInt(formData.active_deals_count) || 0;
                const newCount = currentCount + 1;
                
                // Show confirmation if adding more than originally stated
                if (currentCount > 0) {
                    const confirmed = confirm(
                        `You originally stated ${currentCount} active deals. Are you sure you want to add another deal? This will update your total to ${newCount} deals.`
                    );
                    if (!confirmed) return;
                }
                
                handleActiveDealsCountChange(newCount.toString());
            };

            // Handle seller motivations (multiple selection)
            const handleSellerMotivationChange = (motivation, checked) => {
                let newMotivations = [...formData.seller_motivations];
                if (checked) {
                    if (!newMotivations.includes(motivation)) {
                        newMotivations.push(motivation);
                    }
                } else {
                    newMotivations = newMotivations.filter(m => m !== motivation);
                }
                setFormData(prev => ({ ...prev, seller_motivations: newMotivations }));
            };

            // Form validation
            const validateForm = () => {
                const newErrors = {};
                
                if (!formData.active_deals_count || formData.active_deals_count === '0') {
                    newErrors.active_deals_count = 'Please enter the number of active deals';
                }
                
                if (!formData.prospective_deals_count || formData.prospective_deals_count === '0') {
                    newErrors.prospective_deals_count = 'Please enter the number of prospective deals';
                }
                
                // Validate individual active deals if count > 0
                if (parseInt(formData.active_deals_count) > 0) {
                    formData.active_deals.forEach((deal, index) => {
                        if (!deal.deal_size) {
                            newErrors[`active_deal_${index}_size`] = 'Deal size is required';
                        }
                        if (!deal.industry) {
                            newErrors[`active_deal_${index}_industry`] = 'Industry is required';
                        }
                        if (!deal.transaction_type) {
                            newErrors[`active_deal_${index}_transaction_type`] = 'Transaction type is required';
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
                    await onSave('active_deals', formData);
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
                    h('h2', { className: 'page-title' }, 'Current Active Deals'),
                    h('p', { className: 'page-description' }, 
                        'Tell us about your current active deals and market outlook'
                    )
                ]),
                
                h('form', { 
                    className: 'survey-form',
                    onSubmit: handleSubmit
                }, [
                    // Active Deals Count Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Active Deals Count'),
                        h('div', { className: 'form-group' }, [
                            h('label', { 
                                className: 'form-label',
                                htmlFor: 'active_deals_count'
                            }, 'How many ACTIVE deals is your firm currently working on?'),
                            h('input', {
                                type: 'number',
                                id: 'active_deals_count',
                                className: `form-input ${errors.active_deals_count ? 'error' : ''}`,
                                value: formData.active_deals_count,
                                onChange: (e) => handleActiveDealsCountChange(e.target.value),
                                min: '0',
                                placeholder: 'Enter number of active deals'
                            }),
                            errors.active_deals_count && h('div', { 
                                className: 'form-error' 
                            }, errors.active_deals_count)
                        ]),
                        
                        h('div', { className: 'form-group' }, [
                            h('label', { 
                                className: 'form-label',
                                htmlFor: 'prospective_deals_count'
                            }, 'How many tangible prospective, but not yet retained, deal/client opportunities do you currently have?'),
                            h('input', {
                                type: 'number',
                                id: 'prospective_deals_count',
                                className: `form-input ${errors.prospective_deals_count ? 'error' : ''}`,
                                value: formData.prospective_deals_count,
                                onChange: (e) => setFormData(prev => ({
                                    ...prev,
                                    prospective_deals_count: e.target.value
                                })),
                                min: '0',
                                placeholder: 'Enter number of prospective deals'
                            }),
                            errors.prospective_deals_count && h('div', { 
                                className: 'form-error' 
                            }, errors.prospective_deals_count)
                        ])
                    ]),

                    // Active Deals Details Section (only show if count > 0)
                    parseInt(formData.active_deals_count) > 0 && h('div', { className: 'form-section' }, [
                        h('div', { className: 'section-header' }, [
                            h('h3', { className: 'section-title' }, 'Active Deals Details'),
                            h('button', {
                                type: 'button',
                                className: 'btn btn-secondary btn-sm',
                                onClick: handleAddActiveDeal
                            }, '+ Add Deal')
                        ]),
                        
                        h('div', { className: 'deals-table-container' }, [
                            h('div', { className: 'deals-table' }, [
                                // Table Header
                                h('div', { className: 'table-header' }, [
                                    h('div', { className: 'table-cell' }, 'Deal #'),
                                    h('div', { className: 'table-cell' }, 'Deal Size (Millions)'),
                                    h('div', { className: 'table-cell' }, 'Industry'),
                                    h('div', { className: 'table-cell' }, 'Transaction Type'),
                                    h('div', { className: 'table-cell' }, 'Expected Close')
                                ]),
                                
                                // Table Rows
                                formData.active_deals.map((deal, index) => 
                                    h('div', { 
                                        key: deal.id,
                                        className: 'table-row'
                                    }, [
                                        h('div', { className: 'table-cell' }, `Deal ${index + 1}`),
                                        h('div', { className: 'table-cell' }, 
                                            h('input', {
                                                type: 'number',
                                                className: `form-input ${errors[`active_deal_${index}_size`] ? 'error' : ''}`,
                                                value: deal.deal_size,
                                                onChange: (e) => handleActiveDealChange(index, 'deal_size', e.target.value),
                                                placeholder: 'e.g., 10.5',
                                                step: '0.1'
                                            })
                                        ),
                                        h('div', { className: 'table-cell' }, 
                                            h('select', {
                                                className: `form-select ${errors[`active_deal_${index}_industry`] ? 'error' : ''}`,
                                                value: deal.industry,
                                                onChange: (e) => handleActiveDealChange(index, 'industry', e.target.value)
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
                                                className: `form-select ${errors[`active_deal_${index}_transaction_type`] ? 'error' : ''}`,
                                                value: deal.transaction_type,
                                                onChange: (e) => handleActiveDealChange(index, 'transaction_type', e.target.value)
                                            }, [
                                                h('option', { value: '' }, 'Select type'),
                                                h('option', { value: 'sell_side' }, 'Sell-Side'),
                                                h('option', { value: 'buy_side' }, 'Buy-Side'),
                                                h('option', { value: 'recapitalization' }, 'Recapitalization'),
                                                h('option', { value: 'merger' }, 'Merger'),
                                                h('option', { value: 'other' }, 'Other')
                                            ])
                                        ),
                                        h('div', { className: 'table-cell' }, 
                                            h('select', {
                                                className: 'form-select',
                                                value: deal.expected_close_date,
                                                onChange: (e) => handleActiveDealChange(index, 'expected_close_date', e.target.value)
                                            }, [
                                                h('option', { value: '' }, 'Select timeframe'),
                                                h('option', { value: 'q3_2025' }, 'Q3 2025'),
                                                h('option', { value: 'q4_2025' }, 'Q4 2025'),
                                                h('option', { value: 'q1_2026' }, 'Q1 2026'),
                                                h('option', { value: 'q2_2026' }, 'Q2 2026'),
                                                h('option', { value: 'later' }, 'Later than Q2 2026')
                                            ])
                                        )
                                    ])
                                )
                            ])
                        ])
                    ]),

                    // Market Factors Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Market Factors'),
                        h('p', { className: 'section-description' }, 
                            'How are your active deal clients impacted by the following factors?'
                        ),
                        
                        h('div', { className: 'factors-grid' }, [
                            h('div', { className: 'factor-item' }, [
                                h('label', { className: 'factor-label' }, 'Market Conditions'),
                                h('select', {
                                    className: 'form-select',
                                    value: formData.deal_factors.market_conditions,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        deal_factors: { ...prev.deal_factors, market_conditions: e.target.value }
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select impact'),
                                    h('option', { value: 'very_positive' }, 'Very Positive'),
                                    h('option', { value: 'positive' }, 'Positive'),
                                    h('option', { value: 'neutral' }, 'Neutral'),
                                    h('option', { value: 'negative' }, 'Negative'),
                                    h('option', { value: 'very_negative' }, 'Very Negative')
                                ])
                            ]),
                            
                            h('div', { className: 'factor-item' }, [
                                h('label', { className: 'factor-label' }, 'Financing Availability'),
                                h('select', {
                                    className: 'form-select',
                                    value: formData.deal_factors.financing_availability,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        deal_factors: { ...prev.deal_factors, financing_availability: e.target.value }
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select impact'),
                                    h('option', { value: 'very_positive' }, 'Very Positive'),
                                    h('option', { value: 'positive' }, 'Positive'),
                                    h('option', { value: 'neutral' }, 'Neutral'),
                                    h('option', { value: 'negative' }, 'Negative'),
                                    h('option', { value: 'very_negative' }, 'Very Negative')
                                ])
                            ]),
                            
                            h('div', { className: 'factor-item' }, [
                                h('label', { className: 'factor-label' }, 'Buyer Sentiment'),
                                h('select', {
                                    className: 'form-select',
                                    value: formData.deal_factors.buyer_sentiment,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        deal_factors: { ...prev.deal_factors, buyer_sentiment: e.target.value }
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select impact'),
                                    h('option', { value: 'very_positive' }, 'Very Positive'),
                                    h('option', { value: 'positive' }, 'Positive'),
                                    h('option', { value: 'neutral' }, 'Neutral'),
                                    h('option', { value: 'negative' }, 'Negative'),
                                    h('option', { value: 'very_negative' }, 'Very Negative')
                                ])
                            ]),
                            
                            h('div', { className: 'factor-item' }, [
                                h('label', { className: 'factor-label' }, 'Seller Motivation'),
                                h('select', {
                                    className: 'form-select',
                                    value: formData.deal_factors.seller_motivation,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        deal_factors: { ...prev.deal_factors, seller_motivation: e.target.value }
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select impact'),
                                    h('option', { value: 'very_positive' }, 'Very Positive'),
                                    h('option', { value: 'positive' }, 'Positive'),
                                    h('option', { value: 'neutral' }, 'Neutral'),
                                    h('option', { value: 'negative' }, 'Negative'),
                                    h('option', { value: 'very_negative' }, 'Very Negative')
                                ])
                            ]),
                            
                            h('div', { className: 'factor-item' }, [
                                h('label', { className: 'factor-label' }, 'Regulatory Environment'),
                                h('select', {
                                    className: 'form-select',
                                    value: formData.deal_factors.regulatory_environment,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        deal_factors: { ...prev.deal_factors, regulatory_environment: e.target.value }
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select impact'),
                                    h('option', { value: 'very_positive' }, 'Very Positive'),
                                    h('option', { value: 'positive' }, 'Positive'),
                                    h('option', { value: 'neutral' }, 'Neutral'),
                                    h('option', { value: 'negative' }, 'Negative'),
                                    h('option', { value: 'very_negative' }, 'Very Negative')
                                ])
                            ])
                        ])
                    ]),

                    // Seller Motivations Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Seller Motivations'),
                        h('p', { className: 'section-description' }, 
                            'What is motivating current Sellers to pursue a transaction? (Select all that apply)'
                        ),
                        
                        h('div', { className: 'checkbox-group' }, [
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.seller_motivations.includes('retirement'),
                                    onChange: (e) => handleSellerMotivationChange('retirement', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Retirement')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.seller_motivations.includes('market_timing'),
                                    onChange: (e) => handleSellerMotivationChange('market_timing', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Market Timing')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.seller_motivations.includes('growth_capital'),
                                    onChange: (e) => handleSellerMotivationChange('growth_capital', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Need for Growth Capital')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.seller_motivations.includes('succession'),
                                    onChange: (e) => handleSellerMotivationChange('succession', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Succession Planning')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.seller_motivations.includes('debt_refinancing'),
                                    onChange: (e) => handleSellerMotivationChange('debt_refinancing', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Debt Refinancing')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.seller_motivations.includes('other'),
                                    onChange: (e) => handleSellerMotivationChange('other', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Other')
                            ])
                        ])
                    ]),

                    // Form Actions
                    h('div', { className: 'form-actions' }, [
                        h('button', {
                            type: 'submit',
                            className: 'btn btn-primary btn-large',
                            disabled: isSaving
                        }, isSaving ? 'Saving...' : 'Continue to Looking Ahead')
                    ])
                ])
            ]);
        }

        // Page 4: Looking Ahead Component
        function LookingAheadPage({ onNext, onSave }) {
            const [formData, setFormData] = useState({
                total_deals_2025: '',
                dealflow_factors: {
                    market_conditions: '',
                    interest_rates: '',
                    regulatory_changes: '',
                    economic_uncertainty: '',
                    buyer_sentiment: '',
                    seller_motivation: ''
                },
                economic_environment: '',
                ebitda_multiples_prediction: '',
                deal_activity_prediction: '',
                challenges: [],
                tariff_impact_performance: [],
                tariff_impact_deals: [],
                tariff_results: [],
                government_layoffs_results: []
            });
            const [errors, setErrors] = useState({});
            const [isSaving, setIsSaving] = useState(false);

            // Handle multiple selection for challenges
            const handleChallengeChange = (challenge, checked) => {
                let newChallenges = [...formData.challenges];
                if (checked) {
                    if (!newChallenges.includes(challenge)) {
                        newChallenges.push(challenge);
                    }
                } else {
                    newChallenges = newChallenges.filter(c => c !== challenge);
                }
                setFormData(prev => ({ ...prev, challenges: newChallenges }));
            };

            // Handle multiple selection for tariff impacts
            const handleTariffImpactChange = (impact, checked, type) => {
                let newImpacts = [...formData[type]];
                if (checked) {
                    if (!newImpacts.includes(impact)) {
                        newImpacts.push(impact);
                    }
                } else {
                    newImpacts = newImpacts.filter(i => i !== impact);
                }
                setFormData(prev => ({ ...prev, [type]: newImpacts }));
            };

            // Form validation
            const validateForm = () => {
                const newErrors = {};
                
                if (!formData.total_deals_2025 || formData.total_deals_2025 === '0') {
                    newErrors.total_deals_2025 = 'Please enter the number of total deals expected for 2025';
                }
                
                if (!formData.economic_environment) {
                    newErrors.economic_environment = 'Please select the economic environment prediction';
                }
                
                if (!formData.ebitda_multiples_prediction) {
                    newErrors.ebitda_multiples_prediction = 'Please select EBITDA multiples prediction';
                }
                
                if (!formData.deal_activity_prediction) {
                    newErrors.deal_activity_prediction = 'Please select deal activity prediction';
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
                    await onSave('looking_ahead', formData);
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
                    h('h2', { className: 'page-title' }, 'Looking Ahead'),
                    h('p', { className: 'page-description' }, 
                        'Share your predictions for the second half of 2025'
                    )
                ]),
                
                h('form', { 
                    className: 'survey-form',
                    onSubmit: handleSubmit
                }, [
                    // Total Deals Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Deal Volume Predictions'),
                        h('div', { className: 'form-group' }, [
                            h('label', { 
                                className: 'form-label',
                                htmlFor: 'total_deals_2025'
                            }, 'How many total deals do you expect your firm to close for ALL of 2025?'),
                            h('input', {
                                type: 'number',
                                id: 'total_deals_2025',
                                className: `form-input ${errors.total_deals_2025 ? 'error' : ''}`,
                                value: formData.total_deals_2025,
                                onChange: (e) => setFormData(prev => ({
                                    ...prev,
                                    total_deals_2025: e.target.value
                                })),
                                min: '0',
                                placeholder: 'Enter total number of deals'
                            }),
                            errors.total_deals_2025 && h('div', { 
                                className: 'form-error' 
                            }, errors.total_deals_2025)
                        ])
                    ]),

                    // Dealflow Factors Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Dealflow Impact Factors'),
                        h('p', { className: 'section-description' }, 
                            'How much do you think the following factors will impact dealflow in the second-half of 2025?'
                        ),
                        
                        h('div', { className: 'factors-grid' }, [
                            h('div', { className: 'factor-item' }, [
                                h('label', { className: 'factor-label' }, 'Market Conditions'),
                                h('select', {
                                    className: 'form-select',
                                    value: formData.dealflow_factors.market_conditions,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        dealflow_factors: { ...prev.dealflow_factors, market_conditions: e.target.value }
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select impact'),
                                    h('option', { value: 'very_positive' }, 'Very Positive'),
                                    h('option', { value: 'positive' }, 'Positive'),
                                    h('option', { value: 'neutral' }, 'Neutral'),
                                    h('option', { value: 'negative' }, 'Negative'),
                                    h('option', { value: 'very_negative' }, 'Very Negative')
                                ])
                            ]),
                            
                            h('div', { className: 'factor-item' }, [
                                h('label', { className: 'factor-label' }, 'Interest Rates'),
                                h('select', {
                                    className: 'form-select',
                                    value: formData.dealflow_factors.interest_rates,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        dealflow_factors: { ...prev.dealflow_factors, interest_rates: e.target.value }
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select impact'),
                                    h('option', { value: 'very_positive' }, 'Very Positive'),
                                    h('option', { value: 'positive' }, 'Positive'),
                                    h('option', { value: 'neutral' }, 'Neutral'),
                                    h('option', { value: 'negative' }, 'Negative'),
                                    h('option', { value: 'very_negative' }, 'Very Negative')
                                ])
                            ]),
                            
                            h('div', { className: 'factor-item' }, [
                                h('label', { className: 'factor-label' }, 'Regulatory Changes'),
                                h('select', {
                                    className: 'form-select',
                                    value: formData.dealflow_factors.regulatory_changes,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        dealflow_factors: { ...prev.dealflow_factors, regulatory_changes: e.target.value }
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select impact'),
                                    h('option', { value: 'very_positive' }, 'Very Positive'),
                                    h('option', { value: 'positive' }, 'Positive'),
                                    h('option', { value: 'neutral' }, 'Neutral'),
                                    h('option', { value: 'negative' }, 'Negative'),
                                    h('option', { value: 'very_negative' }, 'Very Negative')
                                ])
                            ]),
                            
                            h('div', { className: 'factor-item' }, [
                                h('label', { className: 'factor-label' }, 'Economic Uncertainty'),
                                h('select', {
                                    className: 'form-select',
                                    value: formData.dealflow_factors.economic_uncertainty,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        dealflow_factors: { ...prev.dealflow_factors, economic_uncertainty: e.target.value }
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select impact'),
                                    h('option', { value: 'very_positive' }, 'Very Positive'),
                                    h('option', { value: 'positive' }, 'Positive'),
                                    h('option', { value: 'neutral' }, 'Neutral'),
                                    h('option', { value: 'negative' }, 'Negative'),
                                    h('option', { value: 'very_negative' }, 'Very Negative')
                                ])
                            ]),
                            
                            h('div', { className: 'factor-item' }, [
                                h('label', { className: 'factor-label' }, 'Buyer Sentiment'),
                                h('select', {
                                    className: 'form-select',
                                    value: formData.dealflow_factors.buyer_sentiment,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        dealflow_factors: { ...prev.dealflow_factors, buyer_sentiment: e.target.value }
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select impact'),
                                    h('option', { value: 'very_positive' }, 'Very Positive'),
                                    h('option', { value: 'positive' }, 'Positive'),
                                    h('option', { value: 'neutral' }, 'Neutral'),
                                    h('option', { value: 'negative' }, 'Negative'),
                                    h('option', { value: 'very_negative' }, 'Very Negative')
                                ])
                            ]),
                            
                            h('div', { className: 'factor-item' }, [
                                h('label', { className: 'factor-label' }, 'Seller Motivation'),
                                h('select', {
                                    className: 'form-select',
                                    value: formData.dealflow_factors.seller_motivation,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        dealflow_factors: { ...prev.dealflow_factors, seller_motivation: e.target.value }
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select impact'),
                                    h('option', { value: 'very_positive' }, 'Very Positive'),
                                    h('option', { value: 'positive' }, 'Positive'),
                                    h('option', { value: 'neutral' }, 'Neutral'),
                                    h('option', { value: 'negative' }, 'Negative'),
                                    h('option', { value: 'very_negative' }, 'Very Negative')
                                ])
                            ])
                        ])
                    ]),

                    // Economic Environment Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Economic Environment'),
                        h('div', { className: 'form-group' }, [
                            h('label', { 
                                className: 'form-label',
                                htmlFor: 'economic_environment'
                            }, 'What will be the upcoming economic environment (impacting the businesses for sale in your deals) for the second half of 2025?'),
                            h('select', {
                                id: 'economic_environment',
                                className: `form-select ${errors.economic_environment ? 'error' : ''}`,
                                value: formData.economic_environment,
                                onChange: (e) => setFormData(prev => ({
                                    ...prev,
                                    economic_environment: e.target.value
                                }))
                            }, [
                                h('option', { value: '' }, 'Select economic environment'),
                                h('option', { value: 'very_strong' }, 'Very Strong Growth'),
                                h('option', { value: 'strong' }, 'Strong Growth'),
                                h('option', { value: 'moderate' }, 'Moderate Growth'),
                                h('option', { value: 'slow' }, 'Slow Growth'),
                                h('option', { value: 'recession' }, 'Recession/Decline')
                            ]),
                            errors.economic_environment && h('div', { 
                                className: 'form-error' 
                            }, errors.economic_environment)
                        ])
                    ]),

                    // Market Predictions Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Market Predictions'),
                        h('div', { className: 'form-row' }, [
                            h('div', { className: 'form-group' }, [
                                h('label', { 
                                    className: 'form-label',
                                    htmlFor: 'ebitda_multiples_prediction'
                                }, 'Where do you think Average EBITDA MULTIPLES will be at the end of 2025 relative to now?'),
                                h('select', {
                                    id: 'ebitda_multiples_prediction',
                                    className: `form-select ${errors.ebitda_multiples_prediction ? 'error' : ''}`,
                                    value: formData.ebitda_multiples_prediction,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        ebitda_multiples_prediction: e.target.value
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select prediction'),
                                    h('option', { value: 'significantly_higher' }, 'Significantly Higher (10%+)'),
                                    h('option', { value: 'moderately_higher' }, 'Moderately Higher (5-10%)'),
                                    h('option', { value: 'slightly_higher' }, 'Slightly Higher (0-5%)'),
                                    h('option', { value: 'about_same' }, 'About the Same'),
                                    h('option', { value: 'slightly_lower' }, 'Slightly Lower (0-5%)'),
                                    h('option', { value: 'moderately_lower' }, 'Moderately Lower (5-10%)'),
                                    h('option', { value: 'significantly_lower' }, 'Significantly Lower (10%+)')
                                ]),
                                errors.ebitda_multiples_prediction && h('div', { 
                                    className: 'form-error' 
                                }, errors.ebitda_multiples_prediction)
                            ]),
                            
                            h('div', { className: 'form-group' }, [
                                h('label', { 
                                    className: 'form-label',
                                    htmlFor: 'deal_activity_prediction'
                                }, 'Where do you think Deal Activity Volume will be at the end of 2025 relative to now?'),
                                h('select', {
                                    id: 'deal_activity_prediction',
                                    className: `form-select ${errors.deal_activity_prediction ? 'error' : ''}`,
                                    value: formData.deal_activity_prediction,
                                    onChange: (e) => setFormData(prev => ({
                                        ...prev,
                                        deal_activity_prediction: e.target.value
                                    }))
                                }, [
                                    h('option', { value: '' }, 'Select prediction'),
                                    h('option', { value: 'significantly_higher' }, 'Significantly Higher (25%+)'),
                                    h('option', { value: 'moderately_higher' }, 'Moderately Higher (10-25%)'),
                                    h('option', { value: 'slightly_higher' }, 'Slightly Higher (0-10%)'),
                                    h('option', { value: 'about_same' }, 'About the Same'),
                                    h('option', { value: 'slightly_lower' }, 'Slightly Lower (0-10%)'),
                                    h('option', { value: 'moderately_lower' }, 'Moderately Lower (10-25%)'),
                                    h('option', { value: 'significantly_lower' }, 'Significantly Lower (25%+)')
                                ]),
                                errors.deal_activity_prediction && h('div', { 
                                    className: 'form-error' 
                                }, errors.deal_activity_prediction)
                            ])
                        ])
                    ]),

                    // Challenges Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Challenges'),
                        h('p', { className: 'section-description' }, 
                            'What challenges will your firm face in the second-half of 2025? (Select all that apply)'
                        ),
                        
                        h('div', { className: 'checkbox-group' }, [
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.challenges.includes('finding_quality_deals'),
                                    onChange: (e) => handleChallengeChange('finding_quality_deals', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Finding Quality Deals')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.challenges.includes('financing_availability'),
                                    onChange: (e) => handleChallengeChange('financing_availability', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Financing Availability')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.challenges.includes('valuation_gaps'),
                                    onChange: (e) => handleChallengeChange('valuation_gaps', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Valuation Gaps')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.challenges.includes('regulatory_changes'),
                                    onChange: (e) => handleChallengeChange('regulatory_changes', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Regulatory Changes')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.challenges.includes('economic_uncertainty'),
                                    onChange: (e) => handleChallengeChange('economic_uncertainty', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Economic Uncertainty')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.challenges.includes('competition'),
                                    onChange: (e) => handleChallengeChange('competition', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Increased Competition')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.challenges.includes('talent_retention'),
                                    onChange: (e) => handleChallengeChange('talent_retention', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Talent Retention')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.challenges.includes('technology_integration'),
                                    onChange: (e) => handleChallengeChange('technology_integration', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Technology Integration')
                            ])
                        ])
                    ]),

                    // Form Actions
                    h('div', { className: 'form-actions' }, [
                        h('button', {
                            type: 'submit',
                            className: 'btn btn-primary btn-large',
                            disabled: isSaving
                        }, isSaving ? 'Saving...' : 'Continue to About You')
                    ])
                ])
            ]);
        }

        // Page 5: About You Component
        function AboutYouPage({ onNext, onSave }) {
            const [formData, setFormData] = useState({
                survey_value: [],
                survey_rating: '',
                membership_interest: ''
            });
            const [errors, setErrors] = useState({});
            const [isSaving, setIsSaving] = useState(false);

            // Handle multiple selection for survey value
            const handleSurveyValueChange = (value, checked) => {
                let newValues = [...formData.survey_value];
                if (checked) {
                    if (!newValues.includes(value)) {
                        newValues.push(value);
                    }
                } else {
                    newValues = newValues.filter(v => v !== value);
                }
                setFormData(prev => ({ ...prev, survey_value: newValues }));
            };

            // Form validation
            const validateForm = () => {
                const newErrors = {};
                
                if (!formData.survey_rating) {
                    newErrors.survey_rating = 'Please rate the value of the survey';
                }
                
                if (!formData.membership_interest) {
                    newErrors.membership_interest = 'Please indicate your membership interest';
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
                    await onSave('about_you', formData);
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
                    h('h2', { className: 'page-title' }, 'About You'),
                    h('p', { className: 'page-description' }, 
                        'Help us understand how valuable this survey is to you'
                    )
                ]),
                
                h('form', { 
                    className: 'survey-form',
                    onSubmit: handleSubmit
                }, [
                    // Survey Value Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Survey Value'),
                        h('p', { className: 'section-description' }, 
                            'Has the report and survey data provided value to you, and if so, how? (Select all that apply)'
                        ),
                        
                        h('div', { className: 'checkbox-group' }, [
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.survey_value.includes('benchmarking'),
                                    onChange: (e) => handleSurveyValueChange('benchmarking', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Benchmarking against peers')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.survey_value.includes('market_insights'),
                                    onChange: (e) => handleSurveyValueChange('market_insights', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Market insights and trends')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.survey_value.includes('client_presentations'),
                                    onChange: (e) => handleSurveyValueChange('client_presentations', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Client presentations and proposals')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.survey_value.includes('strategic_planning'),
                                    onChange: (e) => handleSurveyValueChange('strategic_planning', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Strategic planning')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.survey_value.includes('fee_guidance'),
                                    onChange: (e) => handleSurveyValueChange('fee_guidance', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Fee guidance and pricing')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.survey_value.includes('industry_networking'),
                                    onChange: (e) => handleSurveyValueChange('industry_networking', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'Industry networking and connections')
                            ]),
                            h('label', { className: 'checkbox-item' }, [
                                h('input', {
                                    type: 'checkbox',
                                    checked: formData.survey_value.includes('no_value'),
                                    onChange: (e) => handleSurveyValueChange('no_value', e.target.checked)
                                }),
                                h('span', { className: 'checkbox-label' }, 'No value provided')
                            ])
                        ])
                    ]),

                    // Survey Rating Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Survey Rating'),
                        h('div', { className: 'form-group' }, [
                            h('label', { 
                                className: 'form-label',
                                htmlFor: 'survey_rating'
                            }, 'Overall, please rate the value you derive from our semi-annual Market Survey'),
                            h('div', { className: 'rating-group' }, [
                                h('label', { className: 'rating-option' }, [
                                    h('input', {
                                        type: 'radio',
                                        name: 'survey_rating',
                                        value: 'excellent',
                                        checked: formData.survey_rating === 'excellent',
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            survey_rating: e.target.value
                                        }))
                                    }),
                                    h('span', { className: 'rating-label' }, 'Excellent')
                                ]),
                                h('label', { className: 'rating-option' }, [
                                    h('input', {
                                        type: 'radio',
                                        name: 'survey_rating',
                                        value: 'very_good',
                                        checked: formData.survey_rating === 'very_good',
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            survey_rating: e.target.value
                                        }))
                                    }),
                                    h('span', { className: 'rating-label' }, 'Very Good')
                                ]),
                                h('label', { className: 'rating-option' }, [
                                    h('input', {
                                        type: 'radio',
                                        name: 'survey_rating',
                                        value: 'good',
                                        checked: formData.survey_rating === 'good',
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            survey_rating: e.target.value
                                        }))
                                    }),
                                    h('span', { className: 'rating-label' }, 'Good')
                                ]),
                                h('label', { className: 'rating-option' }, [
                                    h('input', {
                                        type: 'radio',
                                        name: 'survey_rating',
                                        value: 'fair',
                                        checked: formData.survey_rating === 'fair',
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            survey_rating: e.target.value
                                        }))
                                    }),
                                    h('span', { className: 'rating-label' }, 'Fair')
                                ]),
                                h('label', { className: 'rating-option' }, [
                                    h('input', {
                                        type: 'radio',
                                        name: 'survey_rating',
                                        value: 'poor',
                                        checked: formData.survey_rating === 'poor',
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            survey_rating: e.target.value
                                        }))
                                    }),
                                    h('span', { className: 'rating-label' }, 'Poor')
                                ])
                            ]),
                            errors.survey_rating && h('div', { 
                                className: 'form-error' 
                            }, errors.survey_rating)
                        ])
                    ]),

                    // Membership Interest Section
                    h('div', { className: 'form-section' }, [
                        h('h3', { className: 'section-title' }, 'Membership Interest'),
                        h('div', { className: 'form-group' }, [
                            h('label', { 
                                className: 'form-label',
                                htmlFor: 'membership_interest'
                            }, 'Are you interested in learning more about AM&AA membership?'),
                            h('div', { className: 'yes-no-group' }, [
                                h('label', { className: 'yes-no-option' }, [
                                    h('input', {
                                        type: 'radio',
                                        name: 'membership_interest',
                                        value: 'yes',
                                        checked: formData.membership_interest === 'yes',
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            membership_interest: e.target.value
                                        }))
                                    }),
                                    h('span', { className: 'yes-no-label' }, 'Yes')
                                ]),
                                h('label', { className: 'yes-no-option' }, [
                                    h('input', {
                                        type: 'radio',
                                        name: 'membership_interest',
                                        value: 'no',
                                        checked: formData.membership_interest === 'no',
                                        onChange: (e) => setFormData(prev => ({
                                            ...prev,
                                            membership_interest: e.target.value
                                        }))
                                    }),
                                    h('span', { className: 'yes-no-label' }, 'No')
                                ])
                            ]),
                            errors.membership_interest && h('div', { 
                                className: 'form-error' 
                            }, errors.membership_interest)
                        ])
                    ]),

                    // Form Actions
                    h('div', { className: 'form-actions' }, [
                        h('button', {
                            type: 'submit',
                            className: 'btn btn-primary btn-large',
                            disabled: isSaving
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

            const totalPages = 5;

        // Check authentication status on component mount
        useEffect(() => {
            const checkAuthStatus = async () => {
                try {
                    // Check for Supabase auth callback (magic link)
                    const hashParams = new URLSearchParams(window.location.hash.substring(1));
                    const accessToken = hashParams.get('access_token');
                    const refreshToken = hashParams.get('refresh_token');
                    
                    if (accessToken) {
                        // Store tokens
                        localStorage.setItem('supabase_token', accessToken);
                        if (refreshToken) {
                            localStorage.setItem('supabase_refresh_token', refreshToken);
                        }
                        
                        // Fetch user data from Supabase
                        const response = await fetch('https://ffgjqlmulaqtfopgwenf.functions.supabase.co/me', {
                            headers: { 'Authorization': `Bearer ${accessToken}` }
                        });
                        
                        if (response.ok) {
                            const userData = await response.json();
                            localStorage.setItem('supabase_user_data', JSON.stringify(userData));
                            
                            // Update header to show logged in state
                            updateHeaderLoginState(userData);
                            
                            // If user came from magic link with form data, save it
                            if (userData.user_metadata) {
                                await handlePageSave('user_profile', {
                                    email: userData.email,
                                    first_name: userData.user_metadata.first_name || '',
                                    last_name: userData.user_metadata.last_name || '',
                                    profession: userData.user_metadata.profession || '',
                                    us_zip_code: userData.user_metadata.us_zip_code || '',
                                    country: userData.user_metadata.country || ''
                                });
                            }
                            
                            // Auto-advance to page 2
                            setTimeout(() => {
                                setCurrentPage(2);
                                // Clean up URL
                                window.history.replaceState({}, document.title, window.location.pathname);
                            }, 500);
                        }
                    } else {
                        // Check for existing stored token
                        const storedToken = localStorage.getItem('supabase_token');
                        
                        if (storedToken) {
                            // Verify token is still valid
                            const response = await fetch('https://ffgjqlmulaqtfopgwenf.functions.supabase.co/me', {
                                headers: { 'Authorization': `Bearer ${storedToken}` }
                            });
                            
                            if (response.ok) {
                                const userData = await response.json();
                                localStorage.setItem('supabase_user_data', JSON.stringify(userData));
                                updateHeaderLoginState(userData);
                                setIsAuthenticated(true);
                            } else {
                                // Token expired, clear it
                                localStorage.removeItem('supabase_token');
                                localStorage.removeItem('supabase_user_data');
                            }
                        }
                    }
                } catch (error) {
                    console.error('Auth check error:', error);
                }
            };
            
            checkAuthStatus();
        }, []);

            const handlePageSave = async (pageKey, data) => {
                setIsLoading(true);
                try {
                    const token = localStorage.getItem('supabase_token');
                    
                    if (!token) {
                        throw new Error('Not authenticated. Please log in first.');
                    }

                    // Get HubSpot contact data if available
                    const hubspotData = localStorage.getItem('hubspot_contact_data');
                    const hubspotContactId = hubspotData ? JSON.parse(hubspotData).hubspot_contact_id : null;

                    // Prepare survey data
                    const surveyData = {
                        survey_id: '4ef0a17b-0309-4e95-ba37-abd71a3bbe87',
                        answers: Object.entries(data).map(([key, value]) => ({
                            question_id: key,
                            value_text: typeof value === 'string' ? value : null,
                            value_num: typeof value === 'number' ? value : null,
                            value_options: Array.isArray(value) ? value : null
                        }))
                    };

                    // Use authenticated save function
                    const response = await fetch('https://ffgjqlmulaqtfopgwenf.functions.supabase.co/survey-save-draft', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(surveyData)
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to save survey data');
                    }

                    const result = await response.json();
                    console.log('Survey saved:', result);

                    // Update survey data state
                    setSurveyData(prev => ({
                        ...prev,
                        [pageKey]: data
                    }));

                } catch (error) {
                    console.error('Error saving page:', error);
                    throw error;
                } finally {
                    setIsLoading(false);
                }
            };

            const handleNextPage = async () => {
                if (currentPage === 1) {
                    // Special handling for Page 1 - check authentication
                    const token = localStorage.getItem('supabase_token');
                    
                    if (!token) {
                        // Not authenticated - send magic link
                try {
                    // Get form data from Page 1
                    const email = document.querySelector('#email')?.value;
                    const firstName = document.querySelector('#first_name')?.value;
                    const lastName = document.querySelector('#last_name')?.value;
                    const profession = document.querySelector('#profession')?.value;
                    const usZipCode = document.querySelector('#us_zip_code')?.value;
                    const country = document.querySelector('#country')?.value;
                    
                    if (!email) {
                        alert('Please enter your email address.');
                        return;
                    }
                    
                    setIsLoading(true);
                    
                    const success = await sendMagicLink(email, {
                        first_name: firstName,
                        last_name: lastName,
                        profession: profession,
                        us_zip_code: usZipCode,
                        country: country
                    });
                    
                } catch (error) {
                    alert('Error sending magic link. Please try again.');
                } finally {
                    setIsLoading(false);
                }
                        return;
                    } else {
                        // Already authenticated - save and proceed
                        try {
                            // Get form data and save it
                            const formData = {
                                email: document.querySelector('#email')?.value,
                                first_name: document.querySelector('#first_name')?.value,
                                last_name: document.querySelector('#last_name')?.value,
                                profession: document.querySelector('#profession')?.value,
                                us_zip_code: document.querySelector('#us_zip_code')?.value,
                                country: document.querySelector('#country')?.value
                            };
                            
                            await handlePageSave('user_profile', formData);
                        } catch (error) {
                            alert('Error saving your information. Please try again.');
                            return;
                        }
                    }
                }
                
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
                        return h(ActiveDealsPage, {
                            onNext: handleNextPage,
                            onSave: handlePageSave
                        });
                    case 4:
                        return h(LookingAheadPage, {
                            onNext: handleNextPage,
                            onSave: handlePageSave
                        });
                    case 5:
                        return h(AboutYouPage, {
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
                    }, (() => {
                        if (currentPage === 1) {
                            const token = localStorage.getItem('supabase_token');
                            return token ? 'Next' : 'Send Magic Link';
                        }
                        return 'Next';
                    })()),
                    
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

        // Update header login state
        function updateHeaderLoginState(userData) {
            const supabaseAuthState = document.querySelector('#supabase-auth-state');
            if (!supabaseAuthState) return;
            
            const email = userData.email || '';
            const firstName = userData.user_metadata?.first_name || userData.first_name || '';
            const lastName = userData.user_metadata?.last_name || userData.last_name || '';
            
            let initials = 'U';
            if (firstName && lastName) {
                initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
            } else if (email) {
                initials = email.substring(0, 2).toUpperCase();
            }
            
            supabaseAuthState.innerHTML = `
                <div class="user-avatar" id="user-avatar">
                    <div class="avatar-circle">${initials}</div>
                    <div class="user-dropdown" id="user-dropdown" style="display: none;">
                        <a href="/survey">Survey</a>
                        <a href="#" onclick="localStorage.clear(); window.location.reload();">Logout</a>
                    </div>
                </div>
            `;
            
            // Add click handler for dropdown
            const avatar = document.querySelector('#user-avatar');
            const dropdown = document.querySelector('#user-dropdown');
            if (avatar && dropdown) {
                avatar.addEventListener('click', () => {
                    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                });
            }
        }

    // Single magic link function - no duplication!
    async function sendMagicLink(email, userData = {}) {
        try {
            const response = await fetch('https://ffgjqlmulaqtfopgwenf.supabase.co/auth/v1/magiclink', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pxbG11bGFxdGZvcGd3ZW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTU2ODEsImV4cCI6MjA3NTE3MTY4MX0.dR0jytzP7h07DkaYdFwkrqyCAZOfVWUfzJwfiJy_O5g'
                },
                body: JSON.stringify({
                    email: email.toLowerCase(),
                    options: {
                        redirectTo: 'https://marketrepstg.wpengine.com/survey',
                        data: userData
                    }
                })
            });
            
            if (response.ok) {
                alert('Magic link sent! Check your email and click the link to continue.');
                return true;
            } else {
                const errorData = await response.json();
                alert(`Failed to send magic link: ${errorData.msg || 'Please try again.'}`);
                return false;
            }
        } catch (error) {
            alert('Error sending magic link. Please try again.');
            return false;
        }
    }

    // Initialize header magic link login
    function initializeHeaderAuth() {
        const magicLinkButton = document.querySelector('#magic-link-login');
        if (magicLinkButton) {
            magicLinkButton.addEventListener('click', async () => {
                const email = prompt('Enter your email address:');
                if (!email || !email.includes('@')) {
                    alert('Please enter a valid email address.');
                    return;
                }
                
                await sendMagicLink(email);
            });
        }
    }

    // Handle magic link callback
    function handleMagicLinkCallback() {
        console.log('=== CHECKING FOR MAGIC LINK CALLBACK ===');
        
        // Check if we have tokens in the URL hash
        const hash = window.location.hash.substring(1);
        if (!hash) {
            console.log('No hash found in URL');
            return false;
        }
        
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const tokenType = params.get('token_type');
        const type = params.get('type');
        
        console.log('Magic link callback detected:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            tokenType: tokenType,
            type: type
        });
        
        if (accessToken && type === 'magiclink') {
            console.log('Processing magic link authentication...');
            
            // Store the tokens
            localStorage.setItem('supabase_token', accessToken);
            localStorage.setItem('supabase_refresh_token', refreshToken);
            
            // Clear the URL hash to clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Update authentication state
            const authState = {
                token: accessToken,
                refreshToken: refreshToken,
                type: 'magiclink'
            };
            
            console.log('Authentication successful:', authState);
            
            // Trigger a page reload to update the UI
            window.location.reload();
            
            return true;
        }
        
        return false;
    }

    // Initialize header authentication
    initializeHeaderAuth();
    
    // Check for magic link callback on page load
    handleMagicLinkCallback();
        
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