<?php
/**
 * WordPress Routes - Ensure /app/* resolves to app.php
 */

// Custom template hierarchy for app routes
function amaa_tmr_template_hierarchy($templates) {
    global $wp_query;
    
    // Route /app/* to app.php template
    if (strpos($_SERVER['REQUEST_URI'], '/app/') === 0) {
        return array('templates/app.php');
    }
    
    // Route marketing pages to marketing.php template
    $marketing_pages = array('pricing', 'about', 'insights', 'contact');
    if (is_page($marketing_pages) || is_front_page()) {
        return array('templates/marketing.php');
    }
    
    return $templates;
}
add_filter('page_template_hierarchy', 'amaa_tmr_template_hierarchy');

// Override template loading for our custom templates
function amaa_tmr_template_include($template) {
    global $wp_query;
    
    // Route /app/* to app.php template
    if (strpos($_SERVER['REQUEST_URI'], '/app/') === 0) {
        $app_template = get_template_directory() . '/templates/app.php';
        if (file_exists($app_template)) {
            return $app_template;
        }
    }
    
    // Route front page to marketing.php template
    if (is_front_page()) {
        $marketing_template = get_template_directory() . '/templates/marketing.php';
        if (file_exists($marketing_template)) {
            return $marketing_template;
        }
    }
    
    // Route marketing pages to marketing.php template
    $marketing_pages = array('pricing', 'about', 'insights', 'contact');
    if (is_page($marketing_pages)) {
        $marketing_template = get_template_directory() . '/templates/marketing.php';
        if (file_exists($marketing_template)) {
            return $marketing_template;
        }
    }
    
    return $template;
}
add_filter('template_include', 'amaa_tmr_template_include', 99); // High priority

// Force template hierarchy for our custom templates
function amaa_tmr_force_template_hierarchy($templates) {
    // Route /app/* to app.php template
    if (strpos($_SERVER['REQUEST_URI'], '/app/') === 0) {
        return array('templates/app.php');
    }
    
    // Route front page to marketing.php template
    if (is_front_page()) {
        return array('templates/marketing.php');
    }
    
    // Route marketing pages to marketing.php template
    $marketing_pages = array('pricing', 'about', 'insights', 'contact');
    if (is_page($marketing_pages)) {
        return array('templates/marketing.php');
    }
    
    return $templates;
}
add_filter('page_template_hierarchy', 'amaa_tmr_force_template_hierarchy', 99);
add_filter('frontpage_template_hierarchy', 'amaa_tmr_force_template_hierarchy', 99);

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
