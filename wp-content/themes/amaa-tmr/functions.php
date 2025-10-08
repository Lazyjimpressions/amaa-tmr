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
    // Disable block templates so PHP page templates are honored
    remove_theme_support('block-templates');
    remove_theme_support('block-template-parts');
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
    // Lightweight React UMD for homepage island (load on frontend; script no-ops without #homepage-root)
    if (!is_admin()) {
        wp_enqueue_script('react', 'https://unpkg.com/react@18/umd/react.production.min.js', array(), '18.0.0', true);
        wp_enqueue_script('react-dom', 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', array('react'), '18.0.0', true);
        wp_enqueue_script(
            'amaa-tmr-home-island',
            get_template_directory_uri() . '/assets/js/homepage-island.js',
            array('react', 'react-dom'),
            '1.0.1',
            true
        );
    }

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

// Debug: expose which template file WP resolved
add_filter('template_include', function ($template) {
    $GLOBALS['amaa_tmr_current_template'] = $template;
    return $template;
}, 1000);
add_action('wp_head', function () {
    if (!empty($GLOBALS['amaa_tmr_current_template'])) {
        echo "\n<!-- template: " . basename($GLOBALS['amaa_tmr_current_template']) . " -->\n";
    }
});

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

