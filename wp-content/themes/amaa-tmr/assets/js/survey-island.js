// AMAA TMR Survey React App
(function() {
    'use strict';

    // Global no-op for showNotification to prevent errors
    window.showNotification = window.showNotification || function() {};

    function waitForDependencies() {
        if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
            setTimeout(waitForDependencies, 100);
            return;
        }

        const { createElement: h, useState, useEffect, useRef } = React;

        // Survey Question Component
        function SurveyQuestion({ question, value, onChange, error }) {
            const renderInput = () => {
                switch (question.type) {
                    case 'multiple_choice':
                        return h('div', { className: 'survey-options' }, 
                            question.options.map((option, index) => 
                                h('label', { 
                                    key: index,
                                    className: `survey-option ${value === option ? 'selected' : ''}`,
                                    onClick: () => onChange(option)
                                }, [
                                    h('input', {
                                        type: 'radio',
                                        name: `question_${question.id}`,
                                        value: option,
                                        checked: value === option,
                                        onChange: () => onChange(option)
                                    }),
                                    h('span', null, option)
                                ])
                            )
                        );
                    
                    case 'text':
                        return h('textarea', {
                            className: 'survey-input survey-textarea',
                            value: value || '',
                            onChange: (e) => onChange(e.target.value),
                            placeholder: 'Enter your response...'
                        });
                    
                    case 'rating':
                        return h('div', { className: 'survey-rating' },
                            question.options.map((option, index) => 
                                h('label', {
                                    key: index,
                                    className: `rating-option ${value === option ? 'selected' : ''}`,
                                    onClick: () => onChange(option)
                                }, [
                                    h('input', {
                                        type: 'radio',
                                        name: `question_${question.id}`,
                                        value: option,
                                        checked: value === option,
                                        onChange: () => onChange(option)
                                    }),
                                    h('span', { className: 'rating-label' }, option)
                                ])
                            )
                        );
                    
                    case 'yes_no':
                        return h('div', { className: 'survey-yes-no' }, [
                            h('label', {
                                className: `yes-no-option ${value === 'Yes' ? 'selected' : ''}`,
                                onClick: () => onChange('Yes')
                            }, [
                                h('input', {
                                    type: 'radio',
                                    name: `question_${question.id}`,
                                    value: 'Yes',
                                    checked: value === 'Yes',
                                    onChange: () => onChange('Yes')
                                }),
                                h('span', null, 'Yes')
                            ]),
                            h('label', {
                                className: `yes-no-option ${value === 'No' ? 'selected' : ''}`,
                                onClick: () => onChange('No')
                            }, [
                                h('input', {
                                    type: 'radio',
                                    name: `question_${question.id}`,
                                    value: 'No',
                                    checked: value === 'No',
                                    onChange: () => onChange('No')
                                }),
                                h('span', null, 'No')
                            ])
                        ]);
                    
                    case 'number':
                        return h('input', {
                            type: 'number',
                            className: 'survey-input',
                            value: value || '',
                            onChange: (e) => onChange(e.target.value),
                            placeholder: 'Enter a number...'
                        });
                    
                    default:
                        return h('input', {
                            type: 'text',
                            className: 'survey-input',
                            value: value || '',
                            onChange: (e) => onChange(e.target.value),
                            placeholder: 'Enter your response...'
                        });
                }
            };

            return h('div', { className: 'survey-question' }, [
                h('h3', { className: 'question-title' }, [
                    question.title,
                    question.required && h('span', { className: 'question-required' }, ' *')
                ]),
                question.content && h('p', { className: 'question-content' }, question.content),
                renderInput(),
                error && h('div', { className: 'survey-error' }, error)
            ]);
        }

        // Progress Bar Component
        function ProgressBar({ current, total }) {
            const percentage = (current / total) * 100;
            
            return h('div', { className: 'survey-progress' }, [
                h('div', { className: 'progress-bar' }, 
                    h('div', { 
                        className: 'progress-fill',
                        style: { width: `${percentage}%` }
                    })
                ),
                h('div', { className: 'progress-text' }, 
                    `Question ${current} of ${total}`
                )
            ]);
        }

        // Save Draft Component
        function SaveDraft({ onSave, isSaving, lastSaved }) {
            return h('div', { className: 'survey-save-draft' }, [
                h('button', {
                    className: 'save-draft-button',
                    onClick: onSave,
                    disabled: isSaving
                }, isSaving ? 'Saving...' : 'Save Draft'),
                lastSaved && h('div', { className: 'save-draft-status' }, 
                    `Last saved: ${lastSaved}`
                )
            ]);
        }

        // Authentication Check Component
        function AuthCheck({ onAuthSuccess, onAuthRequired }) {
            const [isChecking, setIsChecking] = useState(true);
            const [user, setUser] = useState(null);

            useEffect(() => {
                checkAuthStatus();
            }, []);

            const checkAuthStatus = async () => {
                try {
                    // Check if user is authenticated
                    const response = await fetch('/wp-json/amaa/v1/auth/status', {
                        credentials: 'include' // Include cookies for session persistence
                    });
                    const data = await response.json();
                    
                    if (data.authenticated) {
                        setUser(data.user);
                        onAuthSuccess(data.user);
                    } else {
                        onAuthRequired();
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    onAuthRequired();
                } finally {
                    setIsChecking(false);
                }
            };

            if (isChecking) {
                return h('div', { className: 'survey-form' }, 
                    h('div', { style: { textAlign: 'center', padding: 'var(--space-48)' } }, 
                        'Checking authentication...'
                    )
                );
            }

            return null;
        }

        // Login Modal Component
        function LoginModal({ isOpen, onClose, onLoginSuccess }) {
            const [email, setEmail] = useState('');
            const [password, setPassword] = useState('');
            const [isLoading, setIsLoading] = useState(false);
            const [error, setError] = useState('');

            const handleLogin = async (e) => {
                e.preventDefault();
                setIsLoading(true);
                setError('');

                try {
                    const response = await fetch('/wp-json/amaa/v1/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include', // Include cookies for session persistence
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();
                    
                    if (data.success) {
                        onLoginSuccess(data.user);
                    } else {
                        setError(data.message || 'Login failed');
                    }
                } catch (error) {
                    setError('Network error. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            };

            if (!isOpen) return null;

            return h('div', { 
                className: 'login-modal-overlay',
                style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }
            }, 
                h('div', {
                    className: 'login-modal',
                    style: {
                        backgroundColor: 'white',
                        padding: 'var(--space-32)',
                        borderRadius: 'var(--radius-16)',
                        maxWidth: '400px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }
                }, [
                    h('h2', { style: { marginBottom: 'var(--space-24)' } }, 'Sign In to Continue'),
                    h('form', { onSubmit: handleLogin }, [
                        h('div', { style: { marginBottom: 'var(--space-16)' } }, [
                            h('label', { 
                                htmlFor: 'email',
                                style: { display: 'block', marginBottom: 'var(--space-8)' }
                            }, 'Email'),
                            h('input', {
                                type: 'email',
                                id: 'email',
                                value: email,
                                onChange: (e) => setEmail(e.target.value),
                                required: true,
                                style: {
                                    width: '100%',
                                    padding: 'var(--space-12)',
                                    border: '1px solid var(--border-300)',
                                    borderRadius: 'var(--radius-8)'
                                }
                            })
                        ]),
                        h('div', { style: { marginBottom: 'var(--space-24)' } }, [
                            h('label', { 
                                htmlFor: 'password',
                                style: { display: 'block', marginBottom: 'var(--space-8)' }
                            }, 'Password'),
                            h('input', {
                                type: 'password',
                                id: 'password',
                                value: password,
                                onChange: (e) => setPassword(e.target.value),
                                required: true,
                                style: {
                                    width: '100%',
                                    padding: 'var(--space-12)',
                                    border: '1px solid var(--border-300)',
                                    borderRadius: 'var(--radius-8)'
                                }
                            })
                        ]),
                        error && h('div', { 
                            style: { color: 'var(--red-600)', marginBottom: 'var(--space-16)' }
                        }, error),
                        h('div', { style: { display: 'flex', gap: 'var(--space-12)' } }, [
                            h('button', {
                                type: 'submit',
                                disabled: isLoading,
                                style: {
                                    flex: 1,
                                    padding: 'var(--space-12) var(--space-24)',
                                    backgroundColor: 'var(--brand-600)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-8)',
                                    cursor: 'pointer'
                                }
                            }, isLoading ? 'Signing In...' : 'Sign In'),
                            h('button', {
                                type: 'button',
                                onClick: onClose,
                                style: {
                                    padding: 'var(--space-12) var(--space-24)',
                                    backgroundColor: 'transparent',
                                    color: 'var(--gray-600)',
                                    border: '1px solid var(--border-300)',
                                    borderRadius: 'var(--radius-8)',
                                    cursor: 'pointer'
                                }
                            }, 'Cancel')
                        ])
                    ])
                ])
            );
        }

        // Main Survey Component (Single Page)
        function SurveyForm() {
            const [questions, setQuestions] = useState([]);
            const [responses, setResponses] = useState({});
            const [errors, setErrors] = useState({});
            const [isLoading, setIsLoading] = useState(true);
            const [isSubmitting, setIsSubmitting] = useState(false);
            const [isSaving, setIsSaving] = useState(false);
            const [lastSaved, setLastSaved] = useState(null);
            const [isCompleted, setIsCompleted] = useState(false);
            const [showLoginModal, setShowLoginModal] = useState(false);
            const [user, setUser] = useState(null);

            // Load questions from WordPress REST API
            useEffect(() => {
                fetch('/wp-json/amaa/v1/survey/questions')
                    .then(response => response.json())
                    .then(data => {
                        setQuestions(data);
                        setIsLoading(false);
                    })
                    .catch(error => {
                        console.error('Error loading questions:', error);
                        setIsLoading(false);
                    });
            }, []);

            // Auto-save draft every 30 seconds
            useEffect(() => {
                const interval = setInterval(() => {
                    if (Object.keys(responses).length > 0) {
                        saveDraft();
                    }
                }, 30000);

                return () => clearInterval(interval);
            }, [responses]);

            const saveDraft = async () => {
                setIsSaving(true);
                try {
                    const response = await fetch('/wp-json/amaa/v1/survey/draft', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            responses: responses,
                            current_question: currentQuestion
                        })
                    });
                    
                    if (response.ok) {
                        setLastSaved(new Date().toLocaleTimeString());
                    }
                } catch (error) {
                    console.error('Error saving draft:', error);
                } finally {
                    setIsSaving(false);
                }
            };

            const handleResponseChange = (questionId, value) => {
                setResponses(prev => ({
                    ...prev,
                    [questionId]: value
                }));
                
                // Clear error for this question
                if (errors[questionId]) {
                    setErrors(prev => ({
                        ...prev,
                        [questionId]: null
                    }));
                }
            };

            const validateCurrentQuestion = () => {
                const question = questions[currentQuestion];
                if (question.required && !responses[question.id]) {
                    setErrors(prev => ({
                        ...prev,
                        [question.id]: 'This question is required'
                    }));
                    return false;
                }
                return true;
            };

            const handleAuthSuccess = (userData) => {
                setUser(userData);
                setShowLoginModal(false);
                loadQuestions();
            };

            const handleAuthRequired = () => {
                setShowLoginModal(true);
            };

            const loadQuestions = async () => {
                try {
                    const response = await fetch('/wp-json/amaa/v1/survey/questions');
                    const data = await response.json();
                    setQuestions(data);
                    setIsLoading(false);
                } catch (error) {
                    console.error('Error loading questions:', error);
                    setIsLoading(false);
                }
            };

            const handleSubmit = async () => {
                setIsSubmitting(true);
                try {
                    const response = await fetch('/wp-json/amaa/v1/survey/submit', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            responses: responses,
                            user_id: 'current_user' // This would come from Supabase auth
                        })
                    });
                    
                    if (response.ok) {
                        setIsCompleted(true);
                    } else {
                        throw new Error('Submission failed');
                    }
                } catch (error) {
                    console.error('Error submitting survey:', error);
                    alert('There was an error submitting your survey. Please try again.');
                } finally {
                    setIsSubmitting(false);
                }
            };

            if (isLoading) {
                return h('div', { className: 'survey-form' }, 
                    h('div', { style: { textAlign: 'center', padding: 'var(--space-48)' } }, 
                        'Loading survey...'
                    )
                );
            }

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

            return h('div', { className: 'survey-form' }, [
                h('div', { className: 'survey-header' }, [
                    h('h1', { className: 'survey-title' }, 'AM&AA Market Survey'),
                    h('p', { className: 'survey-description' }, 
                        'Help us understand the current state of the middle market by sharing your insights.'
                    )
                ]),
                
                h('div', { className: 'survey-questions' }, 
                    questions.map(question => 
                        h(SurveyQuestion, {
                            key: question.id,
                            question: question,
                            value: responses[question.id] || '',
                            onChange: (value) => handleResponseChange(question.id, value),
                            error: errors[question.id]
                        })
                    )
                ),
                
                h('div', { className: 'survey-navigation' }, [
                    h('button', {
                        className: 'survey-nav-button primary',
                        onClick: handleSubmit,
                        disabled: isSubmitting,
                        style: { width: '100%' }
                    }, isSubmitting ? 'Submitting...' : 'Submit Survey')
                ]),
                
                h(SaveDraft, {
                    onSave: saveDraft,
                    isSaving: isSaving,
                    lastSaved: lastSaved
                })
            ]);
        }

        // Main App Component with Authentication
        function SurveyApp() {
            const [showLoginModal, setShowLoginModal] = useState(false);
            const [user, setUser] = useState(null);
            const [isAuthChecking, setIsAuthChecking] = useState(true);

            const handleAuthSuccess = (userData) => {
                setUser(userData);
                setShowLoginModal(false);
            };

            const handleAuthRequired = () => {
                setShowLoginModal(true);
                setIsAuthChecking(false);
            };

            const handleLoginSuccess = (userData) => {
                setUser(userData);
                setShowLoginModal(false);
            };

            if (isAuthChecking) {
                return h(AuthCheck, {
                    onAuthSuccess: handleAuthSuccess,
                    onAuthRequired: handleAuthRequired
                });
            }

            return h('div', null, [
                h(SurveyForm, { key: 'survey', user: user }),
                h(LoginModal, {
                    key: 'login-modal',
                    isOpen: showLoginModal,
                    onClose: () => setShowLoginModal(false),
                    onLoginSuccess: handleLoginSuccess
                })
            ]);
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
