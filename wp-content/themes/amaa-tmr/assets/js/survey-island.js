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

        // Main Survey Component
        function SurveyForm() {
            const [questions, setQuestions] = useState([]);
            const [currentQuestion, setCurrentQuestion] = useState(0);
            const [responses, setResponses] = useState({});
            const [errors, setErrors] = useState({});
            const [isLoading, setIsLoading] = useState(true);
            const [isSubmitting, setIsSubmitting] = useState(false);
            const [isSaving, setIsSaving] = useState(false);
            const [lastSaved, setLastSaved] = useState(null);
            const [isCompleted, setIsCompleted] = useState(false);

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

            const handleNext = () => {
                if (validateCurrentQuestion()) {
                    if (currentQuestion < questions.length - 1) {
                        setCurrentQuestion(prev => prev + 1);
                    } else {
                        handleSubmit();
                    }
                }
            };

            const handlePrevious = () => {
                if (currentQuestion > 0) {
                    setCurrentQuestion(prev => prev - 1);
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
                    h('a', {
                        href: '/dashboard',
                        className: 'btn btn-primary'
                    }, 'Go to Dashboard')
                ]);
            }

            const currentQ = questions[currentQuestion];

            return h('div', { className: 'survey-form' }, [
                h('div', { className: 'survey-header' }, [
                    h('h1', { className: 'survey-title' }, 'AM&AA Market Survey'),
                    h('p', { className: 'survey-description' }, 
                        'Help us understand the current state of the middle market by sharing your insights.'
                    )
                ]),
                
                h(ProgressBar, { 
                    current: currentQuestion + 1, 
                    total: questions.length 
                }),
                
                h(SurveyQuestion, {
                    key: currentQ.id,
                    question: currentQ,
                    value: responses[currentQ.id] || '',
                    onChange: (value) => handleResponseChange(currentQ.id, value),
                    error: errors[currentQ.id]
                }),
                
                h('div', { className: 'survey-navigation' }, [
                    h('button', {
                        className: 'survey-nav-button secondary',
                        onClick: handlePrevious,
                        disabled: currentQuestion === 0
                    }, 'Previous'),
                    
                    h('button', {
                        className: 'survey-nav-button primary',
                        onClick: handleNext,
                        disabled: isSubmitting
                    }, isSubmitting ? 'Submitting...' : 
                        currentQuestion === questions.length - 1 ? 'Submit Survey' : 'Next')
                ]),
                
                h(SaveDraft, {
                    onSave: saveDraft,
                    isSaving: isSaving,
                    lastSaved: lastSaved
                })
            ]);
        }

        // Mount the React app
        const container = document.getElementById('survey-root');
        if (container) {
            if (ReactDOM.createRoot) {
                ReactDOM.createRoot(container).render(h(SurveyForm));
            } else {
                ReactDOM.render(h(SurveyForm), container);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForDependencies);
    } else {
        waitForDependencies();
    }
})();
