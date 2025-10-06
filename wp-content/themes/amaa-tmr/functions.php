<?php
/**
 * AMAA TMR Theme Functions - App Shell
 */

// Include required files
require_once get_template_directory() . '/inc/cleanup.php';
require_once get_template_directory() . '/inc/routes.php';

// Basic theme supports
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('editor-styles');
    add_theme_support('wp-block-styles');
    add_theme_support('responsive-embeds');
    add_theme_support('post-thumbnails');
});

// Enqueue theme styles and scripts
function amaa_tmr_enqueue_styles() {
    // Main theme style
    wp_enqueue_style('amaa-tmr-style', get_stylesheet_uri(), array(), '1.0.0');
    
    // Design tokens (always loaded first)
    wp_enqueue_style(
        'amaa-tmr-tokens',
        get_template_directory_uri() . '/assets/css/design-tokens.css',
        array(),
        '1.0.0'
    );
    
    // Template-specific styles
    if (strpos($_SERVER['REQUEST_URI'], '/app/') === 0) {
        // App shell styles
        wp_enqueue_style(
            'amaa-tmr-app',
            get_template_directory_uri() . '/assets/css/app.css',
            array('amaa-tmr-tokens'),
            '1.0.0'
        );
    } else {
        // Marketing styles
        wp_enqueue_style(
            'amaa-tmr-marketing',
            get_template_directory_uri() . '/assets/css/marketing.css',
            array('amaa-tmr-tokens'),
            '1.0.0'
        );
    }
}
add_action('wp_enqueue_scripts', 'amaa_tmr_enqueue_styles');

// Enqueue app scripts
function amaa_tmr_enqueue_scripts() {
    // Main app script
    wp_enqueue_script(
        'amaa-tmr-app',
        get_template_directory_uri() . '/assets/js/app.js',
        array(),
        '1.0.0',
        true
    );
    
    // Localize script for app routes
    wp_localize_script('amaa-tmr-app', 'amaaTmrApp', array(
        'apiUrl' => rest_url('wp/v2/'),
        'nonce' => wp_create_nonce('wp_rest'),
        'isApp' => strpos($_SERVER['REQUEST_URI'], '/app/') === 0
    ));
}
add_action('wp_enqueue_scripts', 'amaa_tmr_enqueue_scripts');

// Register navigation menus
function amaa_tmr_register_menus() {
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'amaa-tmr'),
        'footer' => __('Footer Menu', 'amaa-tmr'),
    ));
}
add_action('init', 'amaa_tmr_register_menus');

// Custom post types and fields (if needed)
function amaa_tmr_init() {
    // Add any custom post types or fields here
}
add_action('init', 'amaa_tmr_init');

// Optional: pattern category alias
add_action('init', function () {
    register_block_pattern_category('pages', ['label' => __('Pages', 'amaa-tmr')]);
});
