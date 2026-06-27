<?php
/**
 * Class Trail_Trivia_Settings
 *
 * @package Trail_Trivia
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Trail_Trivia_Settings {

    private const OPTION_KEY = 'trail_trivia_settings';
    private const DEFAULTS   = array( 'gamesPerPage' => 10 );

    public function register(): void {
        register_setting(
            'trail_trivia',
            self::OPTION_KEY,
            array(
                'type'    => 'array',
                'default' => self::DEFAULTS,
            )
        );
    }

    public function get_settings(): array {
        $saved = get_option( self::OPTION_KEY, self::DEFAULTS );
        return array(
            'gamesPerPage' => isset( $saved['gamesPerPage'] ) ? absint( $saved['gamesPerPage'] ) : 10,
        );
    }

    public function get_plugin_info(): array {
        return array(
            'version'    => TRAIL_TRIVIA_VERSION,
            'wpMinimum'  => '6.4',
            'phpMinimum' => '8.0',
        );
    }

    /**
     * @param array<string,mixed> $data
     * @return bool|WP_Error
     */
    public function update_settings( array $data ) {
        $allowed = array( 'gamesPerPage' );
        foreach ( array_keys( $data ) as $key ) {
            if ( ! in_array( $key, $allowed, true ) ) {
                return new WP_Error(
                    'invalid_settings_field',
                    sprintf( 'Unknown or read-only field: %s', esc_html( $key ) ),
                    array( 'status' => 400 )
                );
            }
        }
        $current              = $this->get_settings();
        $current['gamesPerPage'] = absint( $data['gamesPerPage'] ?? $current['gamesPerPage'] );
        return update_option( self::OPTION_KEY, $current );
    }
}
