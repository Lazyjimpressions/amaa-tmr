<?php
/**
 * WordPress Routes - Ensure /app/* resolves to app.php
 */

// NOTE: We rely on explicit page templates (page-app.php, page-marketing.php)
// and do not override the page template hierarchy for normal pages/front page.

// Optional: route /app/* to the App Shell when using pretty URLs
function amaa_tmr_template_include($template) {
    // If using /app/* routes, load the App Shell page template at theme root
    if (strpos($_SERVER['REQUEST_URI'], '/app/') === 0) {
        $app_template = get_template_directory() . '/page-app.php';
        if (file_exists($app_template)) {
            return $app_template;
        }
    }
    return $template;
}
add_filter('template_include', 'amaa_tmr_template_include', 20);

// Do not force template hierarchy; page templates selected in WP admin will apply

// Add body classes for template identification
function amaa_tmr_body_classes($classes) {
    if (strpos($_SERVER['REQUEST_URI'], '/app/') === 0) {
        $classes[] = 'app-template';
    } else {
        $classes[] = 'marketing-template';
    }
    
    return $classes;
}
add_filter('body_class', 'amaa_tmr_body_classes');

// Custom rewrite rules for app routes
function amaa_tmr_add_rewrite_rules() {
    add_rewrite_rule(
        '^app/(.*)/?$',
        'index.php?pagename=app&app_route=$matches[1]',
        'top'
    );
}
add_action('init', 'amaa_tmr_add_rewrite_rules');

// Add query vars for app routes
function amaa_tmr_add_query_vars($vars) {
    $vars[] = 'app_route';
    return $vars;
}
add_filter('query_vars', 'amaa_tmr_add_query_vars');

// Handle app route requests
function amaa_tmr_handle_app_routes($template) {
    global $wp_query;
    
    if (isset($wp_query->query_vars['app_route'])) {
        $app_route = $wp_query->query_vars['app_route'];
        
        // Set the app route for JavaScript to use
        wp_localize_script('amaa-tmr-app', 'amaaTmrApp', array(
            'appRoute' => $app_route,
            'apiUrl' => rest_url('wp/v2/'),
            'nonce' => wp_create_nonce('wp_rest')
        ));
    }
    
    return $template;
}
add_filter('template_include', 'amaa_tmr_handle_app_routes');

// Flush rewrite rules on theme activation
function amaa_tmr_flush_rewrite_rules() {
    amaa_tmr_add_rewrite_rules();
    flush_rewrite_rules();
}
add_action('after_switch_theme', 'amaa_tmr_flush_rewrite_rules');
