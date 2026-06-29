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

    /**
     * Seeds the database with provided games if they don't already exist.
     *
     * @param array $data Seed data in the format provided by the user.
     */
    public function seed( array $data ): void {
        if ( empty( $data['quizzes'] ) || ! is_array( $data['quizzes'] ) ) {
            return;
        }

        foreach ( $data['quizzes'] as $quiz ) {
            $this->seed_quiz( $quiz );
        }
    }

    /**
     * Seeds a single quiz.
     *
     * @param array $quiz Quiz data.
     */
    private function seed_quiz( array $quiz ): void {
        $uuid = sanitize_text_field( $quiz['id'] ?? '' );
        if ( empty( $uuid ) ) {
            return;
        }

        // Check if game already exists.
        $existing = new WP_Query(
            array(
                'post_type'      => 'trail_trivia_game',
                'meta_key'       => '_trivia_original_id',
                'meta_value'     => $uuid,
                'posts_per_page' => 1,
                'post_status'    => array( 'publish', 'draft', 'trash' ),
            )
        );

        if ( $existing->have_posts() ) {
            return;
        }

        $publish_date = $this->parse_date( $quiz['publishDate'] ?? '' );
        $author_id    = $this->get_author_id( $quiz['author'] ?? '' );

        $post_id = wp_insert_post(
            array(
                'post_type'    => 'trail_trivia_game',
                'post_title'   => sanitize_text_field( $quiz['title'] ?? '' ),
                'post_excerpt' => sanitize_text_field( $quiz['subtitle'] ?? '' ),
                'post_status'  => 'publish',
                'post_date'    => $publish_date,
                'post_author'  => $author_id,
            ),
            true
        );

        if ( is_wp_error( $post_id ) ) {
            return;
        }

        update_post_meta( $post_id, '_trivia_original_id', $uuid );
        $this->save_quiz_metadata( $post_id, $quiz );
    }

    /**
     * Parses the publish date.
     *
     * @param string $date_str Date string in YYYY/MM/DD format.
     * @return string MySQL date string.
     */
    private function parse_date( string $date_str ): string {
        if ( empty( $date_str ) ) {
            return current_time( 'mysql' );
        }
        $timestamp = strtotime( $date_str );
        return $timestamp ? date( 'Y-m-d H:i:s', $timestamp ) : current_time( 'mysql' );
    }

    /**
     * Gets author ID by display name or returns current user/admin.
     *
     * @param string $author_name Author name.
     * @return int User ID.
     */
    private function get_author_id( string $author_name ): int {
        if ( ! empty( $author_name ) ) {
            $user = get_user_by( 'slug', sanitize_title( $author_name ) );
            if ( ! $user ) {
                $user = get_user_by( 'login', $author_name );
            }
            if ( $user ) {
                return $user->ID;
            }
        }

        $admin = get_user_by( 'email', get_option( 'admin_email' ) );
        return $admin ? $admin->ID : 1;
    }

    /**
     * Saves quiz metadata.
     *
     * @param int   $post_id Post ID.
     * @param array $quiz    Quiz data.
     */
    private function save_quiz_metadata( int $post_id, array $quiz ): void {
        $questions = array_map(
            function ( array $q ): array {
                return array(
                    'id'                 => $q['id'] ?? wp_generate_uuid4(),
                    'questionText'       => $q['questionText'] ?? '',
                    'choices'            => array_map(
                        function ( array $c ): array {
                            return array(
                                'id'   => $c['id'] ?? wp_generate_uuid4(),
                                'text' => $c['text'] ?? '',
                            );
                        },
                        $q['choices'] ?? array()
                    ),
                    'correctAnswerIndex' => $q['correctAnswerIndex'] ?? 0,
                    'answerText'         => $q['answerText'] ?? '',
                    'answerImage'        => $q['answerImage'] ?? '',
                    'answerImageCaption' => $q['answerImageCaption'] ?? '',
                    'tags'               => $q['tags'] ?? array(),
                );
            },
            $quiz['questions'] ?? array()
        );

        update_post_meta( $post_id, '_trivia_questions', wp_json_encode( $questions ) );
        update_post_meta( $post_id, '_trivia_schema_version', '1.0' );

        $tags = array_map( 'sanitize_text_field', $quiz['tags'] ?? array() );
        wp_set_object_terms( $post_id, $tags, 'trivia_tag' );
        update_post_meta( $post_id, '_trivia_tags', wp_json_encode( $tags ) );
    }
}
