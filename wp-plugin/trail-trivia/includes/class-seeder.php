<?php
/**
 * Class Trail_Trivia_Seeder
 *
 * Handles database seeding for Trail Trivia games.
 *
 * @package Trail_Trivia
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Trail_Trivia_Seeder {

    public function seed( array $data = array() ): void {
        if ( empty( $data ) ) {
            $path = TRAIL_TRIVIA_PLUGIN_DIR . 'data/seed-games.json';
            if ( ! file_exists( $path ) ) {
                error_log( 'Trail Trivia Seeder: Seed data file not found at ' . $path );
                return;
            }
            $raw = file_get_contents( $path );
            $data = json_decode( $raw, true );
            if ( json_last_error() !== JSON_ERROR_NONE ) {
                error_log( 'Trail Trivia Seeder: Failed to decode JSON. Error: ' . json_last_error_msg() );
                return;
            }
        }

        if ( empty( $data['quizzes'] ) || ! is_array( $data['quizzes'] ) ) {
            error_log( 'Trail Trivia Seeder: No quizzes found in data.' );
            return;
        }

        error_log( 'Trail Trivia Seeder: Starting seed of ' . count( $data['quizzes'] ) . ' quizzes.' );

        foreach ( $data['quizzes'] as $quiz ) {
            $this->seed_quiz( $quiz );
        }

        error_log( 'Trail Trivia Seeder: Seeding complete.' );
    }

    private function seed_quiz( array $quiz ): void {
        $uuid = sanitize_text_field( $quiz['id'] ?? '' );
        if ( empty( $uuid ) ) {
            error_log( 'Trail Trivia Seeder: Missing quiz ID.' );
            return;
        }

        // Find every post with this UUID across all statuses.
        $existing = new WP_Query(
            array(
                'post_type'      => 'trail_trivia_game',
                'meta_key'       => '_trivia_original_id',
                'meta_value'     => $uuid,
                'posts_per_page' => -1,
                'post_status'    => array( 'publish', 'draft', 'trash' ),
                'fields'         => 'ids',
            )
        );

        if ( $existing->have_posts() ) {
            $ids = $existing->posts;

            // If any existing post already has valid questions, leave everything alone.
            foreach ( $ids as $id ) {
                $raw = get_post_meta( $id, '_trivia_questions', true );
                if ( $this->is_valid_questions( $raw ) ) {
                    error_log( "Trail Trivia Seeder: Quiz $uuid already exists with valid questions (Post ID: $id). Skipping." );
                    return;
                }
            }

            // All found posts are empty/broken — permanently delete them so we start clean.
            error_log( "Trail Trivia Seeder: Found " . count( $ids ) . " empty/broken posts for quiz $uuid. Cleaning up." );
            foreach ( $ids as $id ) {
                wp_delete_post( $id, true );
            }
        }

        error_log( "Trail Trivia Seeder: Inserting fresh post for quiz $uuid: " . ( $quiz['title'] ?? 'No Title' ) );

        // Create a fresh post as a draft.
        $post_id = wp_insert_post(
            array(
                'post_type'    => 'trail_trivia_game',
                'post_title'   => sanitize_text_field( $quiz['title'] ?? '' ),
                'post_excerpt' => sanitize_text_field( $quiz['subtitle'] ?? '' ),
                'post_status'  => 'draft',
                'post_author'  => $this->get_author_id( $quiz['author'] ?? '' ),
            ),
            true
        );

        if ( is_wp_error( $post_id ) ) {
            error_log( "Trail Trivia Seeder: Failed to insert post for $uuid. Error: " . $post_id->get_error_message() );
            return;
        }

        update_post_meta( $post_id, '_trivia_original_id', $uuid );
        $q_count = $this->save_questions( $post_id, $quiz['questions'] ?? array() );

        $tags = array_map( 'sanitize_text_field', $quiz['tags'] ?? array() );
        wp_set_object_terms( $post_id, $tags, 'trivia_tag' );
        update_post_meta( $post_id, '_trivia_tags', wp_json_encode( $tags ) );
        update_post_meta( $post_id, '_trivia_schema_version', '1.0' );

        error_log( "Trail Trivia Seeder: Successfully seeded quiz $uuid with $q_count questions (Post ID: $post_id)." );
    }

    /**
     * Saves questions with raw image URLs.
     * 
     * @return int Number of questions saved.
     */
    private function save_questions( int $post_id, array $raw_questions ): int {
        $questions = array();
        if ( empty( $raw_questions ) ) {
            error_log( "Trail Trivia Seeder: No questions found for post $post_id." );
        }

        foreach ( $raw_questions as $index => $q ) {
            $choices = array();
            foreach ( ( $q['choices'] ?? array() ) as $c ) {
                $choices[] = array(
                    'id'   => sanitize_text_field( $c['id'] ?? wp_generate_uuid4() ),
                    'text' => trim( (string) ($c['text'] ?? '') ),
                );
            }

            $questions[] = array(
                'id'                 => sanitize_text_field( $q['id'] ?? wp_generate_uuid4() ),
                'questionText'       => trim( (string) ($q['questionText'] ?? '') ),
                'choices'            => $choices,
                'correctAnswerIndex' => (int) ( $q['correctAnswerIndex'] ?? 0 ),
                'answerText'         => trim( (string) ($q['answerText'] ?? '') ),
                'answerImage'        => esc_url_raw( trim( (string) ($q['answerImage'] ?? '') ) ),
                'answerImageCaption' => trim( (string) ($q['answerImageCaption'] ?? '') ),
                'tags'               => array(),
            );
        }

        if ( empty( $questions ) ) {
            error_log( "Trail Trivia Seeder: Processed 0 questions for post $post_id." );
            return 0;
        }

        $encoded = wp_json_encode( $questions );
        if ( ! $encoded ) {
            error_log( "Trail Trivia Seeder: JSON encoding failed for questions of post $post_id. Error: " . json_last_error_msg() );
            return 0;
        }

        // addslashes to counteract WordPress's magic stripslashes on update_post_meta.
        update_post_meta( $post_id, '_trivia_questions', addslashes( $encoded ) );
        return count( $questions );
    }

    private function is_valid_questions( string $raw ): bool {
        if ( empty( $raw ) ) {
            return false;
        }
        $decoded = json_decode( $raw, true );
        return is_array( $decoded ) && count( $decoded ) > 0;
    }

    private function parse_date( $date_input ): string {
        if ( empty( $date_input ) ) {
            return current_time( 'mysql' );
        }

        if ( is_numeric( $date_input ) ) {
            // Assume milliseconds if > 10^12
            $timestamp = $date_input > 10000000000 ? (int) ( $date_input / 1000 ) : (int) $date_input;
        } else {
            $timestamp = strtotime( (string) $date_input );
        }

        return $timestamp ? date( 'Y-m-d H:i:s', $timestamp ) : current_time( 'mysql' );
    }

    private function get_author_id( string $author_name ): int {
        if ( ! empty( $author_name ) ) {
            $user = get_user_by( 'slug', sanitize_title( $author_name ) ) ?: get_user_by( 'login', $author_name );
            if ( $user ) {
                return $user->ID;
            }
        }
        $admin = get_user_by( 'email', get_option( 'admin_email' ) );
        return $admin ? $admin->ID : 1;
    }
}
