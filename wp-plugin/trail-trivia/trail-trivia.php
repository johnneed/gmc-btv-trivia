<?php
/**
 * Plugin Name:       Trail Trivia
 * Description:       Trail Trivia game plugin for GMC Burlington. Embeds the player and provides a TriviaSmith admin interface for creating and managing trail trivia games.
 * Version:           1.0.0
 * Requires at least: 6.4
 * Requires PHP:      8.0
 * Author:            GMC Burlington
 * License:           GPL-2.0-or-later
 * Text Domain:       trail-trivia
 *
 * @package Trail_Trivia
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'TRAIL_TRIVIA_VERSION', '1.0.0' );
define( 'TRAIL_TRIVIA_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'TRAIL_TRIVIA_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once TRAIL_TRIVIA_PLUGIN_DIR . 'includes/class-post-type.php';
require_once TRAIL_TRIVIA_PLUGIN_DIR . 'includes/class-rest-api.php';
require_once TRAIL_TRIVIA_PLUGIN_DIR . 'includes/class-capabilities.php';
require_once TRAIL_TRIVIA_PLUGIN_DIR . 'includes/class-settings.php';
require_once TRAIL_TRIVIA_PLUGIN_DIR . 'includes/class-admin-ui.php';
require_once TRAIL_TRIVIA_PLUGIN_DIR . 'includes/class-shortcode.php';
require_once TRAIL_TRIVIA_PLUGIN_DIR . 'includes/class-cli-command.php';

add_action(
    'init',
    function () {
        ( new Trail_Trivia_Post_Type() )->register();
        ( new Trail_Trivia_Settings() )->register();
    }
);

add_action(
    'rest_api_init',
    function () {
        ( new Trail_Trivia_REST_API() )->register_routes();
    }
);
