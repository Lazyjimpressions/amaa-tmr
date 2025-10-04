<?php
/**
 * Plugin Name: AMAA TMR – Supabase Bridge
 * Description: Minimal helpers for Supabase session + member gating.
 * Version: 0.1.0
 */

if (!defined('ABSPATH')) exit;

// Placeholder: later we'll call a Supabase EF to check current session.
// For now, return false so you can wire UI conditions without hard data.
function tmr_is_member() {
  return false;
}

// Example shortcode: [tmr_member_only]Secret[/tmr_member_only]
add_shortcode('tmr_member_only', function($atts, $content = '') {
  return tmr_is_member() ? do_shortcode($content) : '<em>Members only. Please sign in.</em>';
});
