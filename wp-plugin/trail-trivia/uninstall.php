<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package Trail_Trivia
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Future cleanup: remove options, caps, and CPT data.
