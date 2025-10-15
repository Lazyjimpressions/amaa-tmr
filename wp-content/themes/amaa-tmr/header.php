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
                
                <!-- User State -->
                <div class="user-state">
                    <!-- Supabase Authentication State (managed by JavaScript) -->
                    <div id="supabase-auth-state">
                        <!-- Logged Out: Magic Link Login -->
                        <button id="magic-link-login" class="btn btn-secondary">Log In</button>
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
                <?php if (!is_user_logged_in()) : ?>
                    <li><a href="<?php echo esc_url(home_url('/login')); ?>" class="btn btn-secondary">Log In</a></li>
                <?php endif; ?>
            </ul>
        </nav>
    </header>
    <script>
    (function(){
        'use strict';
        var authStateEl = document.getElementById('supabase-auth-state');
        if (!authStateEl) return;
        var token = localStorage.getItem('supabase_token');
        if (token) {
            var userRaw = localStorage.getItem('supabase_user_data');
            var initials = 'U';
            if (userRaw) {
                try {
                    var user = JSON.parse(userRaw);
                    var fn = (user.first_name||'');
                    var ln = (user.last_name||'');
                    var em = (user.email||'');
                    if (fn && ln) initials = (fn.charAt(0)+ln.charAt(0)).toUpperCase();
                    else if (em) initials = em.substring(0,2).toUpperCase();
                } catch(e) {}
            }
            authStateEl.innerHTML = '<div class="user-avatar" onclick="toggleUserDropdown()">\
                <div class="avatar-circle">'+initials+'</div>\
                <div class="user-dropdown" id="user-dropdown" style="display: none;">\
                    <a href="/survey">Survey</a>\
                    <a href="/dashboard">Dashboard</a>\
                    <a href="/insights">Insights</a>\
                    <hr style="margin: 0.5rem 0; border: none; border-top: 1px solid #e5e7eb;">\
                    <a href="#" onclick="handleLogout(); return false;">Logout</a>\
                </div>\
            </div>';
        }
        window.toggleUserDropdown = function(){
            var d = document.getElementById('user-dropdown');
            if (d) d.style.display = (d.style.display === 'none' ? 'block' : 'none');
        };
        window.handleLogout = function(){
            if (confirm('Are you sure you want to log out?')) {
                localStorage.clear();
                window.location.href = '/';
            }
        };
        document.addEventListener('click', function(evt){
            var a = document.querySelector('.user-avatar');
            var d = document.getElementById('user-dropdown');
            if (a && d && !a.contains(evt.target)) d.style.display = 'none';
        });
    })();
    </script>
