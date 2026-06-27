<?php
/**
 * Class Trail_Trivia_Capabilities
 *
 * @package Trail_Trivia
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Trail_Trivia_Capabilities {

    /**
     * Returns true when the current user has manage_trail_trivia capability.
     * Administrators always pass due to WordPress wildcard capability handling.
     */
    public static function has_manage_cap(): bool {
        return current_user_can( 'manage_trail_trivia' );
    }
}
