// AMAA TMR Homepage React App
(function() {
    'use strict';

    // Define no-op notifier to avoid ReferenceError if called before init
    if (typeof window.showNotification !== 'function') {
        window.showNotification = function(){ /* no-op */ };
    }

    // Wait for React and Framer Motion to load
    function waitForDependencies() {
        if (typeof React === 'undefined' || typeof ReactDOM === 'undefined' || typeof motion === 'undefined') {
            setTimeout(waitForDependencies, 100);
            return;
        }

        // Create React components using vanilla JS (since we can't compile TSX in browser)
        const { createElement: h, useState, useEffect, useRef } = React;
        const { motion } = window.motion;

        // Hero Section Component
        function HeroSection() {
            const [advisorsCount, setAdvisorsCount] = useState(0);
            const [yearsCount, setYearsCount] = useState(0);
            const [dealSizeCount, setDealSizeCount] = useState(0);
            const ref = useRef(null);

            useEffect(() => {
                const observer = new IntersectionObserver(
                    ([entry]) => {
                        if (entry.isIntersecting) {
                            // Animate counters
                            animateCounter(setAdvisorsCount, 2000, 2000);
                            animateCounter(setYearsCount, 5, 1000);
                            animateCounter(setDealSizeCount, 50, 1500);
                        }
                    },
                    { threshold: 0.5 }
                );

                if (ref.current) {
                    observer.observe(ref.current);
                }

                return () => observer.disconnect();
            }, []);

            function animateCounter(setter, target, duration) {
                const start = performance.now();
                const startValue = 0;

                function updateCounter(currentTime) {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    const current = Math.round(startValue + (target - startValue) * progress);
                    setter(current);

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    }
                }

                requestAnimationFrame(updateCounter);
            }

            return h('section', {
                ref: ref,
                className: 'hero-section',
                style: {
                    background: 'linear-gradient(135deg, var(--brand-600) 0%, #062C47 100%)',
                    color: 'white',
                    padding: 'var(--space-96) 0',
                    position: 'relative',
                    overflow: 'hidden'
                }
            }, [
                h('div', {
                    className: 'container',
                    style: {
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 var(--space-24)'
                    }
                }, [
                    h('div', {
                        className: 'hero-grid',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: 'var(--space-48)',
                            alignItems: 'center'
                        }
                    }, [
                        // Left Column - Content
                        h('div', {
                            style: {
                                animation: 'fadeInLeft 0.8s ease-out'
                            }
                        }, [
                            h('h1', {
                                style: {
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: 'var(--text-5xl)',
                                    fontWeight: 'var(--font-semibold)',
                                    lineHeight: 'var(--leading-tight)',
                                    marginBottom: 'var(--space-16)',
                                    color: 'white'
                                }
                            }, 'Your Window Into the Middle Market'),
                            
                            h('p', {
                                style: {
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 'var(--text-lg)',
                                    lineHeight: 'var(--leading-relaxed)',
                                    marginBottom: 'var(--space-32)',
                                    color: 'rgba(255, 255, 255, 0.9)'
                                }
                            }, 'Explore exclusive insights, deal data, and valuation trends from the AM&AA Market Survey — the definitive benchmark for middle-market M&A.'),
                            
                            h('div', {
                                style: {
                                    display: 'flex',
                                    gap: 'var(--space-16)'
                                }
                            }, [
                                h('button', {
                                    className: 'btn btn-primary',
                                    style: {
                                        backgroundColor: 'var(--accent-600)',
                                        color: 'white',
                                        border: 'none',
                                        padding: 'var(--space-12) var(--space-24)',
                                        borderRadius: 'var(--radius-16)',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: 'var(--text-base)',
                                        fontWeight: 'var(--font-medium)',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)'
                                    },
                                    onClick: () => window.location.href = '/insights'
                                }, 'Access Insights'),
                                
                                h('button', {
                                    className: 'btn btn-secondary',
                                    style: {
                                        backgroundColor: 'transparent',
                                        color: 'white',
                                        border: '2px solid white',
                                        padding: 'var(--space-12) var(--space-24)',
                                        borderRadius: 'var(--radius-16)',
                                        fontFamily: 'var(--font-body)',
                                        fontSize: 'var(--text-base)',
                                        fontWeight: 'var(--font-medium)',
                                        cursor: 'pointer',
                                        transition: 'all var(--transition-fast)'
                                    },
                                    onClick: () => window.location.href = '/app/survey'
                                }, 'Take the Survey')
                            ])
                        ]),

                        // Right Column - Animated Stats
                        h('div', {
                            style: {
                                animation: 'fadeInRight 0.8s ease-out 0.2s both'
                            }
                        }, [
                            h('div', {
                                className: 'stat-card',
                                style: {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 'var(--radius-24)',
                                    padding: 'var(--space-24)',
                                    textAlign: 'center',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    marginBottom: 'var(--space-16)',
                                    animation: 'fadeInUp 0.6s ease-out 0.4s both'
                                }
                            }, [
                                h('div', {
                                    style: {
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: 'var(--text-4xl)',
                                        fontWeight: 'var(--font-bold)',
                                        color: 'var(--accent-600)',
                                        marginBottom: 'var(--space-8)'
                                    }
                                }, `${advisorsCount}+`),
                                h('div', {
                                    style: {
                                        fontFamily: 'var(--font-body)',
                                        fontSize: 'var(--text-base)',
                                        color: 'rgba(255, 255, 255, 0.9)'
                                    }
                                }, 'Advisors Participating')
                            ]),

                            h('div', {
                                className: 'stat-card',
                                style: {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 'var(--radius-24)',
                                    padding: 'var(--space-24)',
                                    textAlign: 'center',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    marginBottom: 'var(--space-16)',
                                    animation: 'fadeInUp 0.6s ease-out 0.6s both'
                                }
                            }, [
                                h('div', {
                                    style: {
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: 'var(--text-4xl)',
                                        fontWeight: 'var(--font-bold)',
                                        color: 'var(--accent-600)',
                                        marginBottom: 'var(--space-8)'
                                    }
                                }, `${yearsCount}+`),
                                h('div', {
                                    style: {
                                        fontFamily: 'var(--font-body)',
                                        fontSize: 'var(--text-base)',
                                        color: 'rgba(255, 255, 255, 0.9)'
                                    }
                                }, 'Years of Data')
                            ]),

                            h('div', {
                                className: 'stat-card',
                                style: {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: 'var(--radius-24)',
                                    padding: 'var(--space-24)',
                                    textAlign: 'center',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    animation: 'fadeInUp 0.6s ease-out 0.8s both'
                                }
                            }, [
                                h('div', {
                                    style: {
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: 'var(--text-4xl)',
                                        fontWeight: 'var(--font-bold)',
                                        color: 'var(--accent-600)',
                                        marginBottom: 'var(--space-8)'
                                    }
                                }, `$${dealSizeCount}M`),
                                h('div', {
                                    style: {
                                        fontFamily: 'var(--font-body)',
                                        fontSize: 'var(--text-base)',
                                        color: 'rgba(255, 255, 255, 0.9)'
                                    }
                                }, 'Avg. Deal Size')
                            ])
                        ])
                    ])
                ])
            ]);
        }

        // Insights Scroller Component
        function InsightsScroller() {
            const insights = [
                {
                    id: 1,
                    title: "Valuations Remain Resilient",
                    description: "Median EBITDA multiple rose to 7.2×, marking continued confidence despite rate pressure.",
                    metric: "7.2×",
                    metricLabel: "Median EBITDA Multiple"
                },
                {
                    id: 2,
                    title: "Private Equity Dominance Continues",
                    description: "62% of transactions under $100M involved private equity buyers.",
                    metric: "62%",
                    metricLabel: "PE Involvement"
                },
                {
                    id: 3,
                    title: "Confidence Index Reaches Two-Year High",
                    description: "Advisors rated deal confidence at 8.1 out of 10 — a return to pre-2022 optimism.",
                    metric: "8.1",
                    metricLabel: "Confidence Score"
                },
                {
                    id: 4,
                    title: "Sector Spotlight",
                    description: "Business Services, Healthcare, and Industrials lead 2024 deal volume.",
                    metric: "Top 3",
                    metricLabel: "Leading Sectors"
                },
                {
                    id: 5,
                    title: "Looking Ahead",
                    description: "75% of advisors expect deal activity to grow in the next six months.",
                    metric: "75%",
                    metricLabel: "Growth Expectation"
                }
            ];

            return h('section', {
                className: 'insights-section',
                style: {
                    backgroundColor: 'var(--gray-50)',
                    padding: 'var(--space-96) 0',
                    position: 'relative'
                }
            }, [
                h('div', {
                    className: 'container',
                    style: {
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 var(--space-24)'
                    }
                }, [
                    h('div', {
                        className: 'scrollytelling-grid',
                        style: {
                            display: 'grid',
                            gridTemplateColumns: '1fr 2fr',
                            gap: 'var(--space-48)',
                            alignItems: 'start'
                        }
                    }, [
                        // Left Column - Sticky Headline
                        h('div', {
                            style: {
                                position: 'sticky',
                                top: 'var(--space-96)',
                                paddingRight: 'var(--space-24)',
                                animation: 'fadeInLeft 0.8s ease-out'
                            }
                        }, [
                            h('h2', {
                                style: {
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: 'var(--text-3xl)',
                                    fontWeight: 'var(--font-semibold)',
                                    color: 'var(--brand-600)',
                                    marginBottom: 'var(--space-24)',
                                    lineHeight: 'var(--leading-tight)'
                                }
                            }, 'Key Market Insights'),
                            
                            h('p', {
                                style: {
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 'var(--text-base)',
                                    color: 'var(--gray-600)',
                                    lineHeight: 'var(--leading-relaxed)'
                                }
                            }, 'Highlights from the most recent AM&AA Market Survey.')
                        ]),

                        // Right Column - Scrolling Cards
                        h('div', {
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-32)'
                            }
                        }, insights.map((insight, index) =>
                            h('div', {
                                key: insight.id,
                                className: 'insight-card',
                                style: {
                                    backgroundColor: 'white',
                                    borderRadius: 'var(--radius-24)',
                                    padding: 'var(--space-32)',
                                    boxShadow: 'var(--shadow-base)',
                                    border: '1px solid var(--gray-200)',
                                    transition: 'all var(--transition-base)',
                                    animation: `fadeInUp 0.6s ease-out ${0.1 * index}s both`
                                },
                                onMouseEnter: (e) => {
                                    e.target.style.transform = 'translateY(-8px)';
                                    e.target.style.boxShadow = 'var(--shadow-lg)';
                                },
                                onMouseLeave: (e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'var(--shadow-base)';
                                }
                            }, [
                                h('div', {
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: 'var(--space-16)'
                                    }
                                }, [
                                    h('div', { style: { flex: 1 } }, [
                                        h('h3', {
                                            style: {
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: 'var(--text-xl)',
                                                fontWeight: 'var(--font-semibold)',
                                                color: 'var(--gray-900)',
                                                marginBottom: 'var(--space-8)',
                                                lineHeight: 'var(--leading-tight)'
                                            }
                                        }, insight.title),
                                        
                                        h('p', {
                                            style: {
                                                fontFamily: 'var(--font-body)',
                                                fontSize: 'var(--text-base)',
                                                color: 'var(--gray-700)',
                                                lineHeight: 'var(--leading-relaxed)'
                                            }
                                        }, insight.description)
                                    ]),
                                    
                                    h('div', {
                                        style: {
                                            textAlign: 'center',
                                            marginLeft: 'var(--space-24)',
                                            minWidth: '120px'
                                        }
                                    }, [
                                        h('div', {
                                            style: {
                                                fontFamily: 'var(--font-heading)',
                                                fontSize: 'var(--text-3xl)',
                                                fontWeight: 'var(--font-bold)',
                                                color: 'var(--brand-600)',
                                                marginBottom: 'var(--space-4)'
                                            }
                                        }, insight.metric),
                                        h('div', {
                                            style: {
                                                fontFamily: 'var(--font-body)',
                                                fontSize: 'var(--text-sm)',
                                                color: 'var(--gray-600)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }
                                        }, insight.metricLabel)
                                    ])
                                ])
                            ])
                        ))
                    ])
                ])
            ]);
        }

        // CTA Section Component
        function CTASection() {
            return h('section', {
                className: 'cta-section',
                style: {
                    backgroundColor: 'var(--brand-600)',
                    padding: 'var(--space-96) 0',
                    position: 'relative',
                    overflow: 'hidden'
                }
            }, [
                // Background Pattern
                h('div', {
                    style: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `
                            linear-gradient(45deg, transparent 25%, rgba(242, 159, 5, 0.1) 25%),
                            linear-gradient(-45deg, transparent 25%, rgba(242, 159, 5, 0.1) 25%),
                            linear-gradient(45deg, rgba(242, 159, 5, 0.1) 75%, transparent 75%),
                            linear-gradient(-45deg, rgba(242, 159, 5, 0.1) 75%, transparent 75%)
                        `,
                        backgroundSize: '60px 60px',
                        backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px',
                        opacity: 0.3
                    }
                }),

                h('div', {
                    className: 'container',
                    style: {
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 var(--space-24)',
                        position: 'relative',
                        zIndex: 1
                    }
                }, [
                    h('div', {
                        style: {
                            textAlign: 'center',
                            animation: 'fadeInUp 0.8s ease-out'
                        }
                    }, [
                        h('h3', {
                            style: {
                                fontFamily: 'var(--font-heading)',
                                fontSize: 'var(--text-3xl)',
                                fontWeight: 'var(--font-semibold)',
                                color: 'white',
                                marginBottom: 'var(--space-16)',
                                lineHeight: 'var(--leading-tight)'
                            }
                        }, 'Unlock Full Access to the AM&AA Market Report'),
                        
                        h('p', {
                            style: {
                                fontFamily: 'var(--font-body)',
                                fontSize: 'var(--text-lg)',
                                color: 'rgba(255, 255, 255, 0.9)',
                                lineHeight: 'var(--leading-relaxed)',
                                marginBottom: 'var(--space-32)',
                                maxWidth: '600px',
                                margin: '0 auto var(--space-32) auto'
                            }
                        }, 'Members receive exclusive access to the complete Market Survey, in-depth analytics dashboard, and private dealmaking community.'),

                        // CTA Buttons
                        h('div', {
                            style: {
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 'var(--space-16)',
                                flexWrap: 'wrap',
                                animation: 'fadeInUp 0.8s ease-out 0.2s both'
                            }
                        }, [
                            h('button', {
                                className: 'btn btn-primary',
                                style: {
                                    backgroundColor: 'var(--accent-600)',
                                    color: 'white',
                                    border: 'none',
                                    padding: 'var(--space-16) var(--space-32)',
                                    borderRadius: 'var(--radius-16)',
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 'var(--text-lg)',
                                    fontWeight: 'var(--font-semibold)',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)',
                                    minWidth: '200px'
                                },
                                onClick: () => window.location.href = '/membership'
                            }, 'Join AM&AA'),
                            
                            h('button', {
                                className: 'btn btn-secondary',
                                style: {
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: '2px solid white',
                                    padding: 'var(--space-16) var(--space-32)',
                                    borderRadius: 'var(--radius-16)',
                                    fontFamily: 'var(--font-body)',
                                    fontSize: 'var(--text-lg)',
                                    fontWeight: 'var(--font-semibold)',
                                    cursor: 'pointer',
                                    transition: 'all var(--transition-fast)',
                                    minWidth: '200px'
                                },
                                onClick: () => window.location.href = '/membership'
                            }, 'Learn About Membership')
                        ])
                    ])
                ])
            ]);
        }

        // Main HomePage Component
        function HomePage() {
            return h('div', { className: 'homepage' }, [
                h(HeroSection),
                h(InsightsScroller),
                h(CTASection)
            ]);
        }

        // Add CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInLeft {
                from { opacity: 0; transform: translateX(-50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            @keyframes fadeInRight {
                from { opacity: 0; transform: translateX(50px); }
                to { opacity: 1; transform: translateX(0); }
            }
            
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @media (max-width: 768px) {
                .hero-grid {
                    grid-template-columns: 1fr !important;
                    gap: var(--space-32) !important;
                    text-align: center;
                }
                
                .hero-section {
                    padding: var(--space-64) 0 !important;
                }
                
                .scrollytelling-grid {
                    grid-template-columns: 1fr !important;
                    gap: var(--space-32) !important;
                }
                
                .insights-section {
                    padding: var(--space-64) 0 !important;
                }
                
                .cta-section {
                    padding: var(--space-64) 0 !important;
                }
            }
        `;
        document.head.appendChild(style);

        // Mount the React app
        const container = document.getElementById('homepage-root');
        if (container) {
            ReactDOM.render(h(HomePage), container);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForDependencies);
    } else {
        waitForDependencies();
    }
})();

// Navigation functionality
(function() {
    'use strict';

    // Mobile menu functionality
    function initMobileMenu() {
        const mobileToggle = document.getElementById('mobile-menu-toggle');
        const mobileNav = document.getElementById('mobile-navigation');
        
        if (mobileToggle && mobileNav) {
            mobileToggle.addEventListener('click', function() {
                mobileNav.classList.toggle('show');
                mobileToggle.classList.toggle('active');
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!mobileToggle.contains(e.target) && !mobileNav.contains(e.target)) {
                    mobileNav.classList.remove('show');
                    mobileToggle.classList.remove('active');
                }
            });
        }
    }

    // User dropdown functionality
    function initUserDropdown() {
        const userAvatar = document.getElementById('user-avatar');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userAvatar && userDropdown) {
            userAvatar.addEventListener('click', function(e) {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!userAvatar.contains(e.target)) {
                    userDropdown.classList.remove('show');
                }
            });
        }
    }

    // Initialize navigation
    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initUserDropdown();
    });

})();