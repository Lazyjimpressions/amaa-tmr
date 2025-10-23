<?php
/**
 * WordPress Routes - Simple page-based routing
 */

// Add rewrite rule for auth confirmation
function amaa_tmr_add_auth_rewrite_rules() {
    add_rewrite_rule(
        '^auth/confirm/?$',
        'index.php?auth_confirm=1',
        'top'
    );
}
add_action('init', 'amaa_tmr_add_auth_rewrite_rules');

// Add query var for auth confirmation
function amaa_tmr_add_auth_query_vars($vars) {
    $vars[] = 'auth_confirm';
    return $vars;
}
add_filter('query_vars', 'amaa_tmr_add_auth_query_vars');

// Handle auth confirmation template
function amaa_tmr_handle_auth_confirm($template) {
    if (get_query_var('auth_confirm')) {
        $auth_template = get_template_directory() . '/auth-confirm.php';
        if (file_exists($auth_template)) {
            return $auth_template;
        }
    }
    return $template;
}
add_filter('template_include', 'amaa_tmr_handle_auth_confirm');

// Add body classes for template identification
function amaa_tmr_body_classes($classes) {
    // Add template-specific body classes based on page slug
    if (is_page('dashboard')) {
        $classes[] = 'app-template';
    } elseif (is_page('survey')) {
        $classes[] = 'survey-template';
    } else {
        $classes[] = 'marketing-template';
    }
    
    return $classes;
}
add_filter('body_class', 'amaa_tmr_body_classes');