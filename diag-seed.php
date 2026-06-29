<?php
/**
 * Test script to diagnose Trail_Trivia_Seeder issues.
 * Place this in the WordPress root.
 */

// Load WordPress.
define( 'WP_USE_THEMES', false );
require_once __DIR__ . '/wp-load.php';

// Ensure the plugin is active and its classes are available.
if ( ! class_exists( 'Trail_Trivia_Seeder' ) ) {
    die( "Trail_Trivia_Seeder not found. Is the plugin active?\n" );
}

$seeder = new Trail_Trivia_Seeder();

// Load the seed data.
$seed_file = WP_PLUGIN_DIR . '/trail-trivia/data/seed-games.json';
if ( ! file_exists( $seed_file ) ) {
    die( "Seed file not found at $seed_file\n" );
}

$raw_data = file_get_contents( $seed_file );
$data = json_decode( $raw_data, true );

if ( ! $data || ! isset( $data['quizzes'][0] ) ) {
    die( "Invalid seed data.\n" );
}

// Take just the first quiz for testing.
$quiz = $data['quizzes'][0];
$uuid = $quiz['id'];

echo "Attempting to seed test quiz: {$quiz['title']} ($uuid)\n";

// Use Reflection to access private methods if needed, or just use seed().
$reflection = new ReflectionClass( 'Trail_Trivia_Seeder' );
$method = $reflection->getMethod( 'seed_quiz' );
$method->setAccessible( true );

// Before seeding, let's see if it exists.
$existing = new WP_Query(
    array(
        'post_type'      => 'trail_trivia_game',
        'meta_key'       => '_trivia_original_id',
        'meta_value'     => $uuid,
        'post_status'    => array( 'publish', 'draft', 'trash' ),
        'fields'         => 'ids',
    )
);

echo "Found " . count( $existing->posts ) . " existing posts for this UUID.\n";
if ( count( $existing->posts ) > 0 ) {
    foreach ( $existing->posts as $id ) {
        $questions = get_post_meta( $id, '_trivia_questions', true );
        echo "Post ID $id questions meta length: " . strlen( $questions ) . "\n";
        // Optionally delete it to force a re-seed.
        echo "Deleting post $id to force fresh seed...\n";
        wp_delete_post( $id, true );
    }
}

// Run the seed.
echo "Running seed_quiz...\n";
try {
    $method->invoke( $seeder, $quiz );
} catch ( Exception $e ) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
}

// Verify the result.
$after = new WP_Query(
    array(
        'post_type'      => 'trail_trivia_game',
        'meta_key'       => '_trivia_original_id',
        'meta_value'     => $uuid,
        'post_status'    => 'any',
        'fields'         => 'ids',
    )
);

if ( count( $after->posts ) >= 1 ) {
    $new_id = $after->posts[0];
    echo "Found post ID $new_id after seeding.\n";
    $questions = get_post_meta( $new_id, '_trivia_questions', true );
    echo "Questions meta string length: " . strlen( $questions ) . "\n";
    if ( empty( $questions ) ) {
        echo "ERROR: _trivia_questions is EMPTY!\n";
    } else {
        $decoded = json_decode( $questions, true );
        if ( is_array( $decoded ) ) {
            echo "Decoded questions count: " . count( $decoded ) . "\n";
            if ( count( $decoded ) === 0 ) {
                echo "ERROR: Decoded questions array is EMPTY!\n";
            } else {
                echo "First question text: " . $decoded[0]['questionText'] . "\n";
            }
        } else {
             echo "ERROR: Failed to decode _trivia_questions JSON. Raw value: " . substr($questions, 0, 100) . "...\n";
        }
    }
} else {
    echo "ERROR: Post not found after seeding.\n";
}
