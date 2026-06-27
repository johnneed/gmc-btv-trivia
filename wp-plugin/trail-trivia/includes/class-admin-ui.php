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

    /** Hook admin_menu and admin_enqueue_scripts — single instantiation in trail-trivia.php. */
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
        $allowed = array( 'toplevel_page_trail-trivia', 'trail-trivia_page_trail-trivia-settings' );
        if ( ! in_array( $hook_suffix, $allowed, true ) ) {
            return;
        }

        $js_url  = TRAIL_TRIVIA_PLUGIN_URL . 'assets/admin/index.js';
        $css_url = TRAIL_TRIVIA_PLUGIN_URL . 'assets/admin/index.css';
        $version = TRAIL_TRIVIA_VERSION;

        wp_enqueue_script( 'trail-trivia-admin', $js_url, array(), $version, true );
        wp_script_add_data( 'trail-trivia-admin', 'type', 'module' );

        $config = array(
            'apiBase'     => rest_url( 'trail-trivia/v1' ),
            'nonce'       => wp_create_nonce( 'wp_rest' ),
            'currentUser' => array(
                'id'          => get_current_user_id(),
                'displayName' => wp_get_current_user()->display_name,
                'isAdmin'     => current_user_can( 'manage_options' ),
            ),
        );

        wp_add_inline_script(
            'trail-trivia-admin',
            'window.trailTriviaAdminConfig=' . wp_json_encode( $config ) . ';',
            'before'
        );

        if ( file_exists( TRAIL_TRIVIA_PLUGIN_DIR . 'assets/admin/index.css' ) ) {
            wp_enqueue_style( 'trail-trivia-admin', $css_url, array(), $version );
        }
    }
}
