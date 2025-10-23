<?php
/**
 * AMAA TMR Theme Functions - App Shell
 */

// Include required files
require_once get_template_directory() . '/inc/cleanup.php';
require_once get_template_directory() . '/inc/routes.php';
require_once get_template_directory() . '/inc/survey.php';

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
    wp_enqueue_style('amaa-tmr-style', get_stylesheet_uri(), array(), filemtime(get_stylesheet_directory() . '/style.css'));

    // Design tokens (always loaded first)
    wp_enqueue_style(
        'amaa-tmr-tokens',
        get_template_directory_uri() . '/assets/css/design-tokens.css',
        array(),
        filemtime(get_template_directory() . '/assets/css/design-tokens.css')
    );

    // Components (always loaded for header/footer)
    wp_enqueue_style(
        'amaa-tmr-components',
        get_template_directory_uri() . '/assets/css/components.css',
        array('amaa-tmr-tokens'),
        filemtime(get_template_directory() . '/assets/css/components.css')
    );

    // Template-specific styles
    if (strpos($_SERVER['REQUEST_URI'], '/app/') === 0) {
        // App shell styles
        wp_enqueue_style(
            'amaa-tmr-app',
            get_template_directory_uri() . '/assets/css/app.css',
            array('amaa-tmr-components'),
            filemtime(get_template_directory() . '/assets/css/app.css')
        );
    } else {
        // Marketing styles
        wp_enqueue_style(
            'amaa-tmr-marketing',
            get_template_directory_uri() . '/assets/css/marketing.css',
            array('amaa-tmr-components'),
            filemtime(get_template_directory() . '/assets/css/marketing.css')
        );

        // Homepage / Marketing Shell specific styles
        if (is_front_page() || is_page_template('page-marketing.php')) {
            wp_enqueue_style(
                'amaa-tmr-home',
                get_template_directory_uri() . '/assets/css/home.css',
                array('amaa-tmr-marketing'),
                filemtime(get_template_directory() . '/assets/css/home.css')
            );
        }

        // Survey page specific styles
        if (is_page_template('page-survey.php')) {
            wp_enqueue_style(
                'amaa-tmr-survey',
                get_template_directory_uri() . '/assets/css/survey.css',
                array('amaa-tmr-components'),
                filemtime(get_template_directory() . '/assets/css/survey.css')
            );
        }
    }
}
add_action('wp_enqueue_scripts', 'amaa_tmr_enqueue_styles');

// Enqueue app scripts
function amaa_tmr_enqueue_scripts() {
    // Lightweight React UMD for homepage island (load on frontend; script no-ops without #homepage-root)
    if (!is_admin() && (is_front_page() || is_page_template('page-marketing.php'))) {
        wp_enqueue_script('react', 'https://unpkg.com/react@18/umd/react.production.min.js', array(), '18.0.0', true);
        wp_enqueue_script('react-dom', 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', array('react'), '18.0.0', true);

        // Cache-bust homepage island using filemtime
        $island_path = get_template_directory() . '/assets/js/homepage-island.js';
        wp_enqueue_script(
            'amaa-tmr-home-island',
            get_template_directory_uri() . '/assets/js/homepage-island.js',
            array('react', 'react-dom'),
            file_exists($island_path) ? filemtime($island_path) : false,
            true
        );
    }
    
    // Survey page scripts - use global $post to detect survey page
    global $post;
    $is_survey_page = false;
    
    if (is_object($post)) {
        $page_template = get_post_meta($post->ID, '_wp_page_template', true);
        $page_slug = $post->post_name;
        $is_survey_page = ($page_template === 'page-survey.php') || ($page_slug === 'survey');
    }
    
    if ($is_survey_page) {
        wp_enqueue_script('react', 'https://unpkg.com/react@18/umd/react.production.min.js', array(), '18.0.0', true);
        wp_enqueue_script('react-dom', 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', array('react'), '18.0.0', true);
        wp_enqueue_script('supabase-js', 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', array(), '2.0.0', true);
        
        // Supabase client (load before survey components)
        wp_enqueue_script(
            'amaa-tmr-supabase-client',
            get_template_directory_uri() . '/assets/js/supabaseClient.js',
            array('supabase-js'),
            file_exists(get_template_directory() . '/assets/js/supabaseClient.js') ? filemtime(get_template_directory() . '/assets/js/supabaseClient.js') : '1.0.0',
            true
        );

        // Survey React components - AGGRESSIVE cache busting
        $survey_path = get_template_directory() . '/assets/js/survey-island.js';
        $survey_base_url = get_template_directory_uri() . '/assets/js/survey-island.js';
        
            // Create a unique version string using timestamp
            $cache_bust_version = '3.2.0_' . time();
        
        // Build URL with version parameter
        $survey_url = add_query_arg('v', $cache_bust_version, $survey_base_url);
        
        wp_enqueue_script(
            'amaa-tmr-survey-island',
            $survey_url,
            array('react', 'react-dom', 'supabase-js', 'amaa-tmr-supabase-client'),
            null,  // Don't use WordPress version - we're handling it in URL
            true
        );

        // Localize Supabase configuration (avoid hardcoding in JS)
        $supabase_url = defined('WP_SUPABASE_URL') ? WP_SUPABASE_URL : 'https://ffgjqlmulaqtfopgwenf.supabase.co';
        $supabase_anon = defined('WP_SUPABASE_ANON_KEY') ? WP_SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pxbG11bGFxdGZvcGd3ZW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTU2ODEsImV4cCI6MjA3NTE3MTY4MX0.dR0jytzP7h07DkaYdFwkrqyCAZOfVWUfzJwfiJy_O5g';
        wp_localize_script('amaa-tmr-survey-island', 'supabaseConfig', array(
            'url' => $supabase_url,
            'anonKey' => $supabase_anon,
        ));
    }

    // Header login script (load on all pages for global login modal)
    wp_enqueue_script('react', 'https://unpkg.com/react@18/umd/react.production.min.js', array(), '18.0.0', true);
    wp_enqueue_script('react-dom', 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', array('react'), '18.0.0', true);
    wp_enqueue_script('supabase-js', 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', array(), '2.0.0', true);
    
    // Supabase client (load before header login)
    wp_enqueue_script(
        'amaa-tmr-supabase-client',
        get_template_directory_uri() . '/assets/js/supabaseClient.js',
        array('supabase-js'),
        file_exists(get_template_directory() . '/assets/js/supabaseClient.js') ? filemtime(get_template_directory() . '/assets/js/supabaseClient.js') : '1.0.0',
        true
    );
    
    $header_login_path = get_template_directory() . '/assets/js/header-login.js';
    wp_enqueue_script(
        'amaa-tmr-header-login',
        get_template_directory_uri() . '/assets/js/header-login.js',
        array('react', 'react-dom', 'supabase-js', 'amaa-tmr-supabase-client'),
        file_exists($header_login_path) ? filemtime($header_login_path) : '1.0.0',
        true
    );

    // Main app script (temporarily disabled to prevent JS conflicts)
    // if (!is_page_template('page-survey.php') && !is_page('survey')) {
    //     $app_path = get_template_directory() . '/assets/js/app.js';
    //     $app_url = get_template_directory_uri() . '/assets/js/app.js';
    //     $app_ver = file_exists($app_path) ? filemtime($app_path) : '1.0.3';
    //     $app_url = add_query_arg('v', $app_ver, $app_url);
    //     
    //     wp_enqueue_script(
    //         'amaa-tmr-app',
    //         $app_url,
    //         array(),
    //         $app_ver,
    //         true
    //     );
    // }
    
    // Localize script for app routes (only when app script is enqueued)
    if (!is_page_template('page-survey.php') && !is_page('survey')) {
        wp_localize_script('amaa-tmr-app', 'amaaTmrApp', array(
            'apiUrl' => rest_url('wp/v2/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'isApp' => strpos($_SERVER['REQUEST_URI'], '/app/') === 0
        ));
    }
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

