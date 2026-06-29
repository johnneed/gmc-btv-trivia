<?php
/**
 * Class Trail_Trivia_Admin_UI
 *
 * @package Trail_Trivia
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Trail_Trivia_Admin_UI {

    public function register(): void {
        add_action( 'admin_menu', array( $this, 'register_menus' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
    }

    public function register_menus(): void {
        add_menu_page(
            'Trail Trivia',
            'Trail Trivia',
            'manage_trail_trivia',
            'trail-trivia',
            array( $this, 'render_page' ),
            'dashicons-games',
            30
        );

        add_submenu_page(
            'trail-trivia',
            'All Games',
            'All Games',
            'manage_trail_trivia',
            'trail-trivia',
            array( $this, 'render_page' )
        );

        add_submenu_page(
            'trail-trivia',
            'Settings',
            'Settings',
            'manage_options',
            'trail-trivia-settings',
            array( $this, 'render_page' )
        );
    }

    public function render_page(): void {
        include TRAIL_TRIVIA_PLUGIN_DIR . 'templates/admin-page.php';
    }

    public function enqueue_scripts( string $hook_suffix ): void {
        $allowed = array(
            'toplevel_page_trail-trivia',
            'trail-trivia_page_trail-trivia-settings',
        );
        if ( ! in_array( $hook_suffix, $allowed, true ) ) {
            return;
        }

        wp_enqueue_style(
            'trail-trivia-admin-fonts',
            'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&family=Henny+Penny&family=Tilt+Neon&display=swap',
            array(),
            null
        );

        $css_url = TRAIL_TRIVIA_PLUGIN_URL . 'assets/admin/index.css';
        $js_url  = TRAIL_TRIVIA_PLUGIN_URL . 'assets/admin/index.js';
        $version = TRAIL_TRIVIA_VERSION;

        wp_enqueue_style( 'trail-trivia-admin', $css_url, array(), $version );
        wp_enqueue_script( 'trail-trivia-admin', $js_url, array(), $version, true );
    }
}
