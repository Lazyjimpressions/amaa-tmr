<?php
// Basic supports
add_action('after_setup_theme', function () {
  add_theme_support('title-tag');
  add_theme_support('editor-styles');
  add_theme_support('wp-block-styles');
  add_theme_support('responsive-embeds');
});

// Enqueue a tiny app shell if needed later
add_action('wp_enqueue_scripts', function () {
  wp_register_script('tmr-app', get_template_directory_uri() . '/assets/js/app.js', [], null, true);
  wp_enqueue_script('tmr-app');
});

// Optional: pattern category alias
add_action('init', function () {
  register_block_pattern_category('pages', ['label' => __('Pages', 'amaa-tmr')]);
});
