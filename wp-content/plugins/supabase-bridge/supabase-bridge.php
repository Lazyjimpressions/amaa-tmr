<?php
/**
 * Plugin Name: TMR Supabase Bridge
 * Description: Supabase Auth + Edge Function bridge for The Market Report (TMR).
 * Version: 0.1.0
 * Author: AM&AA
 */

if (!defined('ABSPATH')) exit;

class TMR_Supabase_Bridge {
  const OPT_URL  = 'tmr_sb_url';
  const OPT_ANON = 'tmr_sb_anon';
  const OPT_EF   = 'tmr_sb_ef_base';
  const OPT_TEASER = 'tmr_sb_teaser_url';

  public function __construct() {
    add_action('admin_init', [$this, 'register_settings']);
    add_action('admin_menu', [$this, 'admin_menu']);
    add_action('wp_enqueue_scripts', [$this, 'enqueue']);
    add_filter('script_loader_tag', [$this, 'as_module'], 10, 3);
    add_shortcode('tmr_member_only', [$this, 'shortcode_member_only']);
    add_shortcode('tmr_login', [$this, 'shortcode_login']);
    add_shortcode('tmr_logout', [$this, 'shortcode_logout']);
  }

  public function register_settings() {
    register_setting('tmr_sb', self::OPT_URL);
    register_setting('tmr_sb', self::OPT_ANON);
    register_setting('tmr_sb', self::OPT_EF);
    register_setting('tmr_sb', self::OPT_TEASER);

    add_settings_section('tmr_sb_main', 'Supabase & Links', function(){ echo '<p>Configure Supabase and Download URLs.</p>'; }, 'tmr_sb');

    add_settings_field(self::OPT_URL, 'Supabase URL', function(){
      printf('<input type="text" name="%s" value="%s" class="regular-text" placeholder="https://xxxx.supabase.co" />',
        esc_attr(self::OPT_URL), esc_attr(get_option(self::OPT_URL, '')));
    }, 'tmr_sb', 'tmr_sb_main');

    add_settings_field(self::OPT_ANON, 'Supabase Anon Key', function(){
      printf('<input type="password" name="%s" value="%s" class="regular-text" />',
        esc_attr(self::OPT_ANON), esc_attr(get_option(self::OPT_ANON, '')));
    }, 'tmr_sb', 'tmr_sb_main');

    add_settings_field(self::OPT_EF, 'Edge Functions Base URL', function(){
      printf('<input type="text" name="%s" value="%s" class="regular-text" placeholder="https://<ref>.functions.supabase.co" />',
        esc_attr(self::OPT_EF), esc_attr(get_option(self::OPT_EF, '')));
    }, 'tmr_sb', 'tmr_sb_main');

    add_settings_field(self::OPT_TEASER, 'Teaser (HubSpot) URL', function(){
      printf('<input type="text" name="%s" value="%s" class="regular-text" placeholder="https://your-hubspot-domain/hubfs/.../teaser.pdf" />',
        esc_attr(self::OPT_TEASER), esc_attr(get_option(self::OPT_TEASER, '')));
    }, 'tmr_sb', 'tmr_sb_main');
  }

  public function admin_menu() {
    add_options_page('TMR Supabase Bridge', 'TMR Supabase Bridge', 'manage_options', 'tmr-supabase-bridge', function(){
      echo '<div class="wrap"><h1>TMR Supabase Bridge</h1><form method="post" action="options.php">';
      settings_fields('tmr_sb'); do_settings_sections('tmr_sb'); submit_button();
      echo '</form></div>';
    });
  }

  public function enqueue() {
    // Config object exposed to JS
    $cfg = [
      'siteOrigin' => home_url(),
      'supabaseUrl' => get_option(self::OPT_URL, ''),
      'supabaseAnonKey' => get_option(self::OPT_ANON, ''),
      'efBase' => rtrim(get_option(self::OPT_EF, ''), '/'),
      'teaserUrl' => get_option(self::OPT_TEASER, ''),
      // optional: cache TTL for membership (seconds)
      'cacheTtlSec' => 300,
    ];
    wp_register_script(
      'tmr-auth',
      plugins_url('assets/tmr-auth.js', __FILE__),
      [],
      '0.1.0',
      ['in_footer' => true]
    );
    wp_localize_script('tmr-auth', 'TMR_SB', $cfg);
    wp_enqueue_script('tmr-auth');

    // Load test script on test pages or when test parameter is present
    if (is_page('test-plugin') || (isset($_GET['test']) && $_GET['test'] === 'plugin') || strpos($_SERVER['REQUEST_URI'], 'page_id=15') !== false) {
      wp_enqueue_script(
        'tmr-test',
        plugins_url('assets/tmr-test.js', __FILE__),
        ['tmr-auth'],
        '0.1.0',
        ['in_footer' => true]
      );
    }

    // Load survey assets on public survey page
    if (is_page('public-survey') || strpos($_SERVER['REQUEST_URI'], 'public-survey') !== false) {
      wp_enqueue_style(
        'tmr-survey-styles',
        plugins_url('assets/tmr-survey-styles.css', __FILE__),
        [],
        '0.1.0'
      );
      
      wp_enqueue_script(
        'tmr-survey-contact',
        plugins_url('assets/tmr-survey-contact.js', __FILE__),
        [],
        '0.1.0',
        ['in_footer' => true]
      );
    }
  }

  // Mark our script as type="module"
  public function as_module($tag, $handle, $src) {
    if ($handle === 'tmr-auth' || $handle === 'tmr-test' || $handle === 'tmr-survey-contact') {
      $tag = '<script type="module" src="' . esc_url($src) . '"></script>';
    }
    return $tag;
  }

  public function shortcode_member_only($atts = [], $content = '') {
    $content = do_shortcode($content);
    $fallback = isset($atts['fallback']) ? wp_kses_post($atts['fallback']) : '<p>Please log in as a member to access this content.</p>';
    ob_start(); ?>
      <div data-tmr-guard="member-only" hidden>
        <?php echo $content; ?>
      </div>
      <div data-tmr-fallback="not-member" hidden>
        <?php echo $fallback; ?>
      </div>
    <?php
    return ob_get_clean();
  }

  public function shortcode_login() {
    ob_start(); ?>
      <form id="tmr-login-form" class="tmr-login">
        <label>Email <input type="email" name="email" required /></label>
        <button type="submit">Send Magic Link</button>
        <p class="tmr-login-status" aria-live="polite"></p>
      </form>
    <?php
    return ob_get_clean();
  }

  public function shortcode_logout() {
    return '<button id="tmr-logout-btn" type="button">Log out</button>';
  }
}
new TMR_Supabase_Bridge();