<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package Trail_Trivia
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

delete_option( 'trail_trivia_settings' );

$users = get_users( array( 'fields' => 'all' ) );
foreach ( $users as $user ) {
    if ( $user->has_cap( 'manage_trail_trivia' ) ) {
        $user->remove_cap( 'manage_trail_trivia' );
    }
}
