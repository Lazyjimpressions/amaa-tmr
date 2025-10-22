<?php
/**
 * WordPress Routes - Simple page-based routing
 */

// No custom routing needed - using standard WordPress page templates
// Pages are created in WordPress admin with appropriate templates assigned

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