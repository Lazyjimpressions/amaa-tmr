<?php
/**
 * WordPress Cleanup - Remove WP Chrome
 * Makes the site feel like a bespoke product, not a CMS
 */

// Remove WordPress admin bar for non-admins
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
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('admin_print_styles', 'print_emoji_styles');
    remove_filter('the_content_feed', 'wp_staticize_emoji');
    remove_filter('comment_text_rss', 'wp_staticize_emoji');
    remove_filter('wp_mail', 'wp_staticize_emoji_for_email');
    
    // Remove oEmbed scripts
    remove_action('wp_head', 'wp_oembed_add_discovery_links');
    remove_action('wp_head', 'wp_oembed_add_host_js');
    
    // Remove WordPress generator meta
    remove_action('wp_head', 'wp_generator');
    
    // Remove RSD link
    remove_action('wp_head', 'rsd_link');
    
    // Remove wlwmanifest link
    remove_action('wp_head', 'wlwmanifest_link');
    
    // Remove shortlink
    remove_action('wp_head', 'wp_shortlink_wp_head');
    
    // Remove feed links
    remove_action('wp_head', 'feed_links', 2);
    remove_action('wp_head', 'feed_links_extra', 3);
    
    // Remove WordPress block styles
    wp_dequeue_style('wp-block-library');
    wp_dequeue_style('wp-block-library-theme');
    wp_dequeue_style('wc-block-style');
    
    // Remove default gallery CSS
    wp_dequeue_style('gallery');
    
    // Remove default WordPress CSS
    wp_dequeue_style('global-styles');
    wp_dequeue_style('classic-theme-styles');
}
add_action('init', 'amaa_tmr_cleanup');

// Remove WordPress version from head
function amaa_tmr_remove_version() {
    return '';
}
add_filter('the_generator', 'amaa_tmr_remove_version');

// Remove WordPress version from scripts and styles
function amaa_tmr_remove_version_scripts_styles($src) {
    if (strpos($src, 'ver=')) {
        $src = remove_query_arg('ver', $src);
    }
    return $src;
}
add_filter('script_loader_src', 'amaa_tmr_remove_version_scripts_styles', 15, 1);
add_filter('style_loader_src', 'amaa_tmr_remove_version_scripts_styles', 15, 1);

// Remove WordPress default navigation classes
function amaa_tmr_remove_nav_classes($classes, $item) {
    $classes = array_diff($classes, array(
        'menu-item',
        'menu-item-type-post_type',
        'menu-item-object-page',
        'menu-item-has-children',
        'menu-item-parent'
    ));
    return $classes;
}
add_filter('nav_menu_css_class', 'amaa_tmr_remove_nav_classes', 10, 2);

// Remove WordPress default body classes
function amaa_tmr_remove_body_classes($classes) {
    $classes = array_diff($classes, array(
        'page-template-default',
        'page-template',
        'page-id-' . get_the_ID(),
        'single-paged',
        'paged-' . get_query_var('paged')
    ));
    return $classes;
}
add_filter('body_class', 'amaa_tmr_remove_body_classes');

// Remove WordPress default post classes
function amaa_tmr_remove_post_classes($classes) {
    $classes = array_diff($classes, array(
        'post',
        'type-post',
        'status-publish',
        'format-standard',
        'hentry'
    ));
    return $classes;
}
add_filter('post_class', 'amaa_tmr_remove_post_classes');
