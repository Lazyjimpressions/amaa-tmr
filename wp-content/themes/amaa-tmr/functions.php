<?php
/**
 * AMAA TMR Theme Functions
 */

// Basic supports
add_action('after_setup_theme', function () {
  add_theme_support('title-tag');
  add_theme_support('editor-styles');
  add_theme_support('wp-block-styles');
  add_theme_support('responsive-embeds');
});

// Enqueue theme styles and scripts
function amaa_tmr_enqueue_styles() {
    // Main theme style
    wp_enqueue_style('amaa-tmr-style', get_stylesheet_uri(), array(), '1.0.0');
    
    // Design system CSS
    wp_enqueue_style(
        'amaa-tmr-design-tokens',
        get_template_directory_uri() . '/assets/css/design-tokens.css',
        array(),
        '1.0.0'
    );
    
    wp_enqueue_style(
        'amaa-tmr-components',
        get_template_directory_uri() . '/assets/css/components.css',
        array('amaa-tmr-design-tokens'),
        '1.0.0'
    );
}
add_action('wp_enqueue_scripts', 'amaa_tmr_enqueue_styles');

// Enqueue app scripts
add_action('wp_enqueue_scripts', function () {
  wp_register_script('tmr-app', get_template_directory_uri() . '/assets/js/app.js', [], null, true);
  wp_enqueue_script('tmr-app');
});

// Disable WordPress admin bar for non-admins
function amaa_tmr_disable_admin_bar() {
    if (!current_user_can('administrator') && !is_admin()) {
        show_admin_bar(false);
    }
}
add_action('after_setup_theme', 'amaa_tmr_disable_admin_bar');

// Remove WordPress default styles and scripts
function amaa_tmr_cleanup() {
    // Remove emoji scripts
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');
    
    // Remove oEmbed scripts
    remove_action('wp_head', 'wp_oembed_add_discovery_links');
    remove_action('wp_head', 'wp_oembed_add_host_js');
    
    // Remove WordPress generator meta
    remove_action('wp_head', 'wp_generator');
    
    // Remove RSD link
    remove_action('wp_head', 'rsd_link');
    
    // Remove wlwmanifest link
    remove_action('wp_head', 'wlwmanifest_link');
}
add_action('init', 'amaa_tmr_cleanup');

// Custom template hierarchy
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

// Optional: pattern category alias
add_action('init', function () {
  register_block_pattern_category('pages', ['label' => __('Pages', 'amaa-tmr')]);
});
