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

    public static function register(): void {
        // Grant manage_trail_trivia to any user who can manage_options (admins).
        // Editors/Authors get it via Settings > TriviaSmith Access.
        add_filter( 'user_has_cap', array( __CLASS__, 'grant_cap' ), 10, 3 );
    }

    public static function grant_cap( array $allcaps, array $caps, array $args ): array {
        if ( in_array( 'manage_trail_trivia', $caps, true ) && ! empty( $allcaps['manage_options'] ) ) {
            $allcaps['manage_trail_trivia'] = true;
        }
        return $allcaps;
    }

    public static function has_manage_cap(): bool {
        return current_user_can( 'manage_trail_trivia' );
    }
}
