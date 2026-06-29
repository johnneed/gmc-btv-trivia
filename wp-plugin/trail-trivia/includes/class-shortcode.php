<?php
/**
 * Class Trail_Trivia_Shortcode
 *
 * @package Trail_Trivia
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Trail_Trivia_Shortcode {

    public function register(): void {
        add_shortcode( 'trail_trivia', array( $this, 'render' ) );
        add_shortcode( 'trail-trivia', array( $this, 'render' ) );
    }

    public function render(): string {
        $this->enqueue_assets();
        return '<div id="root"></div>';
    }

    private function enqueue_assets(): void {
        $url     = TRAIL_TRIVIA_PLUGIN_URL . 'assets/player/index.js';
        $version = TRAIL_TRIVIA_VERSION;

        wp_enqueue_script( 'trail-trivia-player', $url, array(), $version, true );

        wp_add_inline_script(
            'trail-trivia-player',
            'window.trailTriviaConfig=' . wp_json_encode(
                array(
                    'apiBase' => rest_url( 'trail-trivia/v1' ),
                    'nonce'   => wp_create_nonce( 'wp_rest' ),
                )
            ) . ';',
            'before'
        );
        // ponytail: CSS is bundled into index.js via IIFE runtime injection — no separate wp_enqueue_style needed
    }
}
