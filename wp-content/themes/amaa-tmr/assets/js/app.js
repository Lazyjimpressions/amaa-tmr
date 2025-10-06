/**
 * AM&AA TMR App Shell JavaScript
 * Handles app initialization, routing, and React island mounting
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('AM&AA TMR App Shell Loaded');

    // Initialize app based on current route
    const isApp = window.amaaTmrApp?.isApp || false;
    
    if (isApp) {
        initializeAppShell();
    } else {
        initializeMarketingShell();
    }

    // Global notification system
    window.showNotification = (message, type = 'info') => {
        const notificationContainer = document.getElementById('notification-container') || document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(notificationContainer);

        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            padding: var(--space-12) var(--space-16);
            border-radius: var(--radius-8);
            color: white;
            font-family: var(--font-body);
            font-size: var(--text-body);
            box-shadow: var(--shadow-200);
            background-color: ${type === 'success' ? 'var(--success-600)' : type === 'error' ? 'var(--danger-600)' : 'var(--brand)'};
        `;
        notificationContainer.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    };
});

/**
 * Initialize App Shell (member portal)
 */
function initializeAppShell() {
    console.log('Initializing App Shell');
    
    // Handle app navigation
    const appNav = document.querySelector('.app-nav');
    if (appNav) {
        appNav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const href = e.target.getAttribute('href');
                navigateToAppRoute(href);
            }
        });
    }

    // Initialize progress bars
    initializeProgressBars();
    
    // Initialize forms
    initializeForms();
    
    // Mount React app
    mountReactApp();
}

/**
 * Initialize Marketing Shell (public pages)
 */
function initializeMarketingShell() {
    console.log('Initializing Marketing Shell');
    
    // Initialize scrollytelling
    initializeScrollytelling();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize forms
    initializeForms();
    
    // Mount React islands
    mountReactIslands();
}

/**
 * Handle app route navigation
 */
function navigateToAppRoute(route) {
    console.log('Navigating to:', route);
    
    // Update active nav item
    document.querySelectorAll('.app-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === route) {
            link.classList.add('active');
        }
    });
    
    // Update page content (this would be handled by React Router in a real app)
    // For now, just show a loading state
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
        appRoot.innerHTML = '<div class="skeleton" style="height: 200px; border-radius: var(--radius-16);"></div>';
    }
    
    // Simulate route change
    setTimeout(() => {
        if (appRoot) {
            appRoot.innerHTML = `
                <div style="text-align: center; padding: var(--space-48);">
                    <h2>Route: ${route}</h2>
                    <p>This will be handled by React Router in the full implementation.</p>
                </div>
            `;
        }
    }, 500);
}

/**
 * Initialize progress bars with animations
 */
function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}

/**
 * Initialize scrollytelling panels
 */
function initializeScrollytelling() {
    const scrollyPanel = document.querySelector('.scrollytelling-panel');
    if (!scrollyPanel) return;
    
    const headline = scrollyPanel.querySelector('.scrollytelling-headline');
    const content = scrollyPanel.querySelector('.scrollytelling-content');
    
    if (headline && content) {
        // Add intersection observer for scroll-based animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        content.querySelectorAll('.insight-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.5s ease-out ${index * 0.1}s, transform 0.5s ease-out ${index * 0.1}s`;
            observer.observe(card);
        });
    }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize forms with validation
 */
function initializeForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submitted:', form);
            
            // Basic validation
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('error');
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });
            
            if (isValid) {
                // Handle form submission
                console.log('Form is valid, submitting...');
                // This would typically make an API call
            } else {
                showNotification('Please fill in all required fields', 'error');
            }
        });
    });
}

/**
 * Mount React app for app shell
 */
function mountReactApp() {
    const appRoot = document.getElementById('app-root');
    if (appRoot) {
        console.log('React app root found. React will hydrate here.');
        // Placeholder for React app initialization
        // import('./react-app.js').then(module => module.initReactApp(appRoot));
    }
}

/**
 * Mount React islands for marketing pages
 */
function mountReactIslands() {
    // Mount scrollytelling island
    const insightsRoot = document.getElementById('insights-root');
    if (insightsRoot) {
        console.log('Scrollytelling island root found.');
        // import('./islands/ScrollyInsights.js').then(module => module.mount(insightsRoot));
    }
    
    // Mount pricing island
    const pricingRoot = document.getElementById('pricing-root');
    if (pricingRoot) {
        console.log('Pricing island root found.');
        // import('./islands/PricingTiles.js').then(module => module.mount(pricingRoot));
    }
}

// Export functions for use in other scripts
window.TMRApp = {
    showNotification,
    navigateToAppRoute,
    initializeAppShell,
    initializeMarketingShell
};