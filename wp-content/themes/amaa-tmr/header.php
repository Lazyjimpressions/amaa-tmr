<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="page" class="site">
    <header id="masthead" class="site-header">
        <div class="header-container">
            <!-- Logo -->
            <div class="site-branding">
                <?php if (is_front_page() && is_home()) : ?>
                    <h1 class="site-title"><a href="<?php echo esc_url(home_url('/')); ?>" rel="home">AM&AA</a></h1>
                <?php else : ?>
                    <p class="site-title"><a href="<?php echo esc_url(home_url('/')); ?>" rel="home">AM&AA</a></p>
                <?php endif; ?>
            </div>
            
            <!-- Desktop Navigation -->
            <nav id="site-navigation" class="main-navigation desktop-nav">
                <ul class="nav-menu">
                    <li><a href="<?php echo esc_url(home_url('/')); ?>">Home</a></li>
                    <li><a href="<?php echo esc_url(home_url('/insights')); ?>">Insights</a></li>
                        <li><a href="<?php echo esc_url(home_url('/dashboard')); ?>">Dashboard</a></li>
                    <li><a href="<?php echo esc_url(home_url('/membership')); ?>">Membership</a></li>
                </ul>
            </nav>
            
            <!-- User State & Survey CTA -->
            <div class="header-actions">
                <!-- Survey CTA Button -->
                <a href="<?php echo esc_url(home_url('/survey')); ?>" class="btn btn-primary survey-cta">Take the Survey</a>
                
                <!-- User State (Supabase Authentication Only) -->
                <div class="user-state" id="user-state">
                    <!-- Supabase Authentication State - Managed by React -->
                    <div id="supabase-auth-state">
                        <!-- React will populate this with either login button or user avatar -->
                    </div>
                </div>
            </div>
            
            <!-- Mobile Menu Toggle -->
            <button class="mobile-menu-toggle" id="mobile-menu-toggle" aria-label="Toggle mobile menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
        
        <!-- Mobile Navigation -->
        <nav class="mobile-navigation" id="mobile-navigation">
            <ul class="mobile-nav-menu">
                <li><a href="<?php echo esc_url(home_url('/')); ?>">Home</a></li>
                <li><a href="<?php echo esc_url(home_url('/insights')); ?>">Insights</a></li>
                        <li><a href="<?php echo esc_url(home_url('/dashboard')); ?>">Dashboard</a></li>
                <li><a href="<?php echo esc_url(home_url('/membership')); ?>">Membership</a></li>
                <li class="mobile-survey-cta">
                    <a href="<?php echo esc_url(home_url('/survey')); ?>" class="btn btn-primary">Take the Survey</a>
                </li>
                <li id="mobile-login-container">
                    <!-- Supabase authentication state for mobile - managed by React -->
                </li>
            </ul>
        </nav>
    </header>

    <!-- Login Modal Portal (mounted by React) -->
    <div id="login-modal-root"></div>

    <!-- Supabase Auth State Script -->
    <script>
    // Update header login state based on localStorage tokens
    function updateHeaderLoginState() {
        const token = localStorage.getItem('supabase_token');
        const userData = localStorage.getItem('supabase_user_data');
        
        if (token && userData) {
            try {
                const user = JSON.parse(userData);
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

    // Update header on page load
    document.addEventListener('DOMContentLoaded', updateHeaderLoginState);
    </script>
