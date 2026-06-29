<?php
/**
 * Test script to diagnose Trail_Trivia_REST_API data retrieval.
 */

// Load WordPress.
define( 'WP_USE_THEMES', false );
require_once __DIR__ . '/wp-load.php';

if ( ! class_exists( 'Trail_Trivia_REST_API' ) ) {
    die( "Trail_Trivia_REST_API not found.\n" );
}

$api = new Trail_Trivia_REST_API();
$reflection = new ReflectionClass( 'Trail_Trivia_REST_API' );
$method = $reflection->getMethod( 'build_game_response' );
$method->setAccessible( true );

// Find the most recently seeded game.
$query = new WP_Query(
    array(
        'post_type'      => 'trail_trivia_game',
        'post_status'    => 'any',
        'posts_per_page' => 1,
        'orderby'        => 'ID',
        'order'          => 'DESC',
    )
);

if ( ! $query->have_posts() ) {
    die( "No games found in database.\n" );
}

$post = $query->posts[0];
echo "Diagnosing Post ID: {$post->ID} - Title: {$post->post_title}\n";

// Check meta directly.
$questions_raw = get_post_meta( $post->ID, '_trivia_questions', true );
echo "Raw _trivia_questions length: " . strlen( $questions_raw ) . "\n";
if ( empty( $questions_raw ) ) {
    echo "ERROR: _trivia_questions meta is EMPTY!\n";
} else {
    $decoded = json_decode( $questions_raw, true );
    if ( null === $decoded ) {
        echo "ERROR: Failed to decode JSON. Error: " . json_last_error_msg() . "\n";
        echo "Raw snippet: " . substr( $questions_raw, 0, 200 ) . "...\n";
    } else {
        echo "Successfully decoded meta. Question count: " . count( $decoded ) . "\n";
    }
}

// Check what the API method returns.
$response = $method->invoke( $api, $post );

echo "\nAPI build_game_response output:\n";
echo "ID: " . $response['id'] . "\n";
echo "Questions Count: " . count( $response['questions'] ) . "\n";

if ( count( $response['questions'] ) > 0 ) {
    $q = $response['questions'][0];
    echo "First Question Text: " . $q['questionText'] . "\n";
    echo "Choices Count: " . count( $q['choices'] ) . "\n";
} else {
    echo "ERROR: API response has 0 questions!\n";
}
