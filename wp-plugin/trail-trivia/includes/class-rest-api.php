<?php
/**
 * Class Trail_Trivia_REST_API
 *
 * Registers and handles all /wp-json/trail-trivia/v1/ REST endpoints.
 * Route handlers perform validation; persistence is delegated to private helpers.
 *
 * @package Trail_Trivia
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Trail_Trivia_REST_API {

    private const NAMESPACE = 'trail-trivia/v1';

    // -------------------------------------------------------------------------
    // Route registration
    // -------------------------------------------------------------------------

    public function register_routes(): void {
        register_rest_route(
            self::NAMESPACE,
            '/games',
            array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_games_handler' ),
                    'permission_callback' => '__return_true',
                ),
                array(
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => array( $this, 'create_game_handler' ),
                    'permission_callback' => '__return_true',
                ),
            )
        );

        register_rest_route(
            self::NAMESPACE,
            '/games/all',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_all_games_handler' ),
                'permission_callback' => '__return_true',
            )
        );

        register_rest_route(
            self::NAMESPACE,
            '/games/(?P<id>[a-zA-Z0-9\-]+)',
            array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_game_handler' ),
                    'permission_callback' => '__return_true',
                ),
                array(
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'update_game_handler' ),
                    'permission_callback' => '__return_true',
                ),
                array(
                    'methods'             => 'PATCH',
                    'callback'            => array( $this, 'patch_game_handler' ),
                    'permission_callback' => '__return_true',
                ),
                array(
                    'methods'             => WP_REST_Server::DELETABLE,
                    'callback'            => array( $this, 'delete_game_handler' ),
                    'permission_callback' => '__return_true',
                ),
            )
        );

        register_rest_route(
            self::NAMESPACE,
            '/settings',
            array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( $this, 'get_settings_handler' ),
                    'permission_callback' => '__return_true',
                ),
                array(
                    'methods'             => WP_REST_Server::EDITABLE,
                    'callback'            => array( $this, 'put_settings_handler' ),
                    'permission_callback' => '__return_true',
                ),
            )
        );
    }

    // -------------------------------------------------------------------------
    // Public read handlers
    // -------------------------------------------------------------------------

    /** GET /games — published games with publishDate <= now */
    public function get_games_handler( WP_REST_Request $request ): WP_REST_Response {
        $query = new WP_Query(
            array(
                'post_type'      => 'trail_trivia_game',
                'post_status'    => 'publish',
                'date_query'     => array(
                    array(
                        'before'    => 'now',
                        'inclusive' => true,
                    ),
                ),
                'posts_per_page' => -1,
                'orderby'        => 'date',
                'order'          => 'DESC',
            )
        );

        $games = array_map( array( $this, 'build_game_response' ), $query->posts );
        return new WP_REST_Response( $games, 200 );
    }

    /** GET /games/{id} — single published game by UUID */
    public function get_game_handler( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        $uuid = sanitize_text_field( $request->get_param( 'id' ) );
        $post = $this->get_game_by_uuid( $uuid );

        if ( ! $post || 'publish' !== $post->post_status ) {
            return new WP_Error( 'game_not_found', 'Game not found.', array( 'status' => 404 ) );
        }

        return new WP_REST_Response( $this->build_game_response( $post ), 200 );
    }

    /** GET /games/all — all non-trashed games (requires manage_trail_trivia) */
    public function get_all_games_handler( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        if ( ! Trail_Trivia_Capabilities::has_manage_cap() ) {
            return new WP_Error( 'rest_forbidden', 'You do not have permission.', array( 'status' => 403 ) );
        }

        $query = new WP_Query(
            array(
                'post_type'      => 'trail_trivia_game',
                'post_status'    => array( 'publish', 'draft' ),
                'posts_per_page' => -1,
                'orderby'        => 'date',
                'order'          => 'DESC',
            )
        );

        $games = array_map( array( $this, 'build_game_response' ), $query->posts );
        return new WP_REST_Response( $games, 200 );
    }

    // -------------------------------------------------------------------------
    // Write handlers
    // -------------------------------------------------------------------------

    /** POST /games — create a new game */
    public function create_game_handler( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        if ( ! $this->verify_nonce( $request ) ) {
            return new WP_Error( 'rest_not_logged_in', 'Nonce verification failed.', array( 'status' => 401 ) );
        }
        if ( ! Trail_Trivia_Capabilities::has_manage_cap() ) {
            return new WP_Error( 'rest_forbidden', 'You do not have permission.', array( 'status' => 403 ) );
        }

        $body  = $request->get_json_params();
        $error = $this->validate_create_body( $body );
        if ( is_wp_error( $error ) ) {
            return $error;
        }

        $post_date = $this->unix_ms_to_wp_date( $body['publishDate'] );
        $post_id   = wp_insert_post(
            array(
                'post_type'    => 'trail_trivia_game',
                'post_title'   => sanitize_text_field( $body['title'] ),
                'post_excerpt' => sanitize_text_field( $body['subtitle'] ?? '' ),
                'post_status'  => 'published' === ( $body['status'] ?? 'draft' ) ? 'publish' : 'draft',
                'post_date'    => $post_date,
                'post_author'  => get_current_user_id(),
            ),
            true
        );

        if ( is_wp_error( $post_id ) ) {
            return $post_id;
        }

        update_post_meta( $post_id, '_trivia_original_id', wp_generate_uuid4() );
        $this->save_game_data( $post_id, $body );

        return new WP_REST_Response( $this->build_game_response( get_post( $post_id ) ), 201 );
    }

    /** PUT /games/{id} — full replacement */
    public function update_game_handler( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        if ( ! $this->verify_nonce( $request ) ) {
            return new WP_Error( 'rest_not_logged_in', 'Nonce verification failed.', array( 'status' => 401 ) );
        }
        if ( ! Trail_Trivia_Capabilities::has_manage_cap() ) {
            return new WP_Error( 'rest_forbidden', 'You do not have permission.', array( 'status' => 403 ) );
        }

        $uuid = sanitize_text_field( $request->get_param( 'id' ) );
        $post = $this->get_game_by_uuid( $uuid );
        if ( ! $post ) {
            return new WP_Error( 'game_not_found', 'Game not found.', array( 'status' => 404 ) );
        }

        $body  = $request->get_json_params();
        $error = $this->validate_create_body( $body );
        if ( is_wp_error( $error ) ) {
            return $error;
        }

        $post_date = $this->unix_ms_to_wp_date( $body['publishDate'] );
        wp_update_post(
            array(
                'ID'           => $post->ID,
                'post_title'   => sanitize_text_field( $body['title'] ),
                'post_excerpt' => sanitize_text_field( $body['subtitle'] ?? '' ),
                'post_status'  => 'published' === ( $body['status'] ?? 'draft' ) ? 'publish' : 'draft',
                'post_date'    => $post_date,
            )
        );
        $this->save_game_data( $post->ID, $body );

        return new WP_REST_Response( $this->build_game_response( get_post( $post->ID ) ), 200 );
    }

    /** PATCH /games/{id} — partial update: status, title, tags only */
    public function patch_game_handler( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        if ( ! $this->verify_nonce( $request ) ) {
            return new WP_Error( 'rest_not_logged_in', 'Nonce verification failed.', array( 'status' => 401 ) );
        }
        if ( ! Trail_Trivia_Capabilities::has_manage_cap() ) {
            return new WP_Error( 'rest_forbidden', 'You do not have permission.', array( 'status' => 403 ) );
        }

        $uuid = sanitize_text_field( $request->get_param( 'id' ) );
        $post = $this->get_game_by_uuid( $uuid );
        if ( ! $post ) {
            return new WP_Error( 'game_not_found', 'Game not found.', array( 'status' => 404 ) );
        }

        $body   = $request->get_json_params();
        $update = array( 'ID' => $post->ID );

        if ( isset( $body['title'] ) ) {
            $update['post_title'] = sanitize_text_field( $body['title'] );
        }

        if ( isset( $body['status'] ) ) {
            $status = $body['status'];
            if ( ! in_array( $status, array( 'published', 'draft' ), true ) ) {
                return new WP_Error( 'invalid_status', 'Status must be "published" or "draft".', array( 'status' => 400 ) );
            }
            $update['post_status'] = 'published' === $status ? 'publish' : 'draft';
        }

        if ( count( $update ) > 1 ) {
            wp_update_post( $update );
        }

        if ( isset( $body['tags'] ) && is_array( $body['tags'] ) ) {
            $tags = array_map( 'sanitize_text_field', $body['tags'] );
            wp_set_object_terms( $post->ID, $tags, 'trivia_tag' );
            update_post_meta( $post->ID, '_trivia_tags', wp_json_encode( $tags ) );
        }

        return new WP_REST_Response( $this->build_game_response( get_post( $post->ID ) ), 200 );
    }

    /** DELETE /games/{id} — move to trash (recoverable) */
    public function delete_game_handler( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        if ( ! $this->verify_nonce( $request ) ) {
            return new WP_Error( 'rest_not_logged_in', 'Nonce verification failed.', array( 'status' => 401 ) );
        }
        if ( ! Trail_Trivia_Capabilities::has_manage_cap() ) {
            return new WP_Error( 'rest_forbidden', 'You do not have permission.', array( 'status' => 403 ) );
        }

        $uuid = sanitize_text_field( $request->get_param( 'id' ) );
        $post = $this->get_game_by_uuid( $uuid );
        if ( ! $post || 'trash' === $post->post_status ) {
            return new WP_Error( 'game_not_found', 'Game not found.', array( 'status' => 404 ) );
        }

        wp_trash_post( $post->ID );

        return new WP_REST_Response( array( 'deleted' => true, 'id' => $uuid ), 200 );
    }

    /** GET /settings */
    public function get_settings_handler( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        if ( ! current_user_can( 'manage_options' ) ) {
            return new WP_Error( 'rest_forbidden', 'You do not have permission.', array( 'status' => 403 ) );
        }

        $settings = new Trail_Trivia_Settings();
        return new WP_REST_Response(
            array_merge( $settings->get_settings(), $settings->get_plugin_info() ),
            200
        );
    }

    /** PUT /settings */
    public function put_settings_handler( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        if ( ! $this->verify_nonce( $request ) ) {
            return new WP_Error( 'rest_not_logged_in', 'Nonce verification failed.', array( 'status' => 401 ) );
        }
        if ( ! current_user_can( 'manage_options' ) ) {
            return new WP_Error( 'rest_forbidden', 'You do not have permission.', array( 'status' => 403 ) );
        }

        $body     = $request->get_json_params();
        $instance = new Trail_Trivia_Settings();
        $result   = $instance->update_settings( $body );

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        return new WP_REST_Response(
            array_merge( $instance->get_settings(), $instance->get_plugin_info() ),
            200
        );
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /** Maps a WP_Post to a Quiz-shaped array. */
    private function build_game_response( WP_Post $post ): array {
        $questions_raw = get_post_meta( $post->ID, '_trivia_questions', true );
        $questions     = $questions_raw ? json_decode( $questions_raw, true ) : array();
        $tags_raw      = get_post_meta( $post->ID, '_trivia_tags', true );
        $tags          = $tags_raw ? json_decode( $tags_raw, true ) : array();
        $uuid          = get_post_meta( $post->ID, '_trivia_original_id', true );
        $status        = 'publish' === $post->post_status ? 'published' : 'draft';
        $publish_ms    = (int) strtotime( get_post_field( 'post_date', $post->ID ) ) * 1000;
        $author_name   = get_the_author_meta( 'display_name', (int) $post->post_author );

        return array(
            'id'          => $uuid ?: (string) $post->ID,
            'title'       => $post->post_title,
            'subtitle'    => $post->post_excerpt ?: '',
            'author'      => $author_name,
            'authorId'    => (int) $post->post_author,
            'publishDate' => $publish_ms,
            'status'      => $status,
            'questions'   => is_array( $questions ) ? $questions : array(),
            'tags'        => is_array( $tags ) ? $tags : array(),
        );
    }

    /**
     * Validates the `questions` field for POST and PUT requests.
     *
     * @param mixed $questions
     * @return true|WP_Error
     */
    private function validate_questions( $questions ) {
        if ( ! is_array( $questions ) || count( $questions ) !== 5 ) {
            return new WP_Error(
                'invalid_questions',
                'The questions field must be an array of exactly 5 items.',
                array( 'status' => 400 )
            );
        }

        foreach ( $questions as $index => $q ) {
            if ( empty( $q['questionText'] ) || ! is_string( $q['questionText'] ) ) {
                return new WP_Error(
                    'invalid_questions',
                    sprintf( 'Question %d: questionText must be a non-empty string.', $index + 1 ),
                    array( 'status' => 400 )
                );
            }
            if ( ! isset( $q['choices'] ) || ! is_array( $q['choices'] ) || count( $q['choices'] ) !== 4 ) {
                return new WP_Error(
                    'invalid_questions',
                    sprintf( 'Question %d: choices must be an array of exactly 4 items.', $index + 1 ),
                    array( 'status' => 400 )
                );
            }
            foreach ( $q['choices'] as $ci => $choice ) {
                if ( empty( $choice['text'] ) || ! is_string( $choice['text'] ) ) {
                    return new WP_Error(
                        'invalid_questions',
                        sprintf( 'Question %d, choice %d: text must be a non-empty string.', $index + 1, $ci + 1 ),
                        array( 'status' => 400 )
                    );
                }
            }
            $cai = $q['correctAnswerIndex'] ?? null;
            if ( ! is_int( $cai ) || $cai < 0 || $cai > 3 ) {
                return new WP_Error(
                    'invalid_questions',
                    sprintf( 'Question %d: correctAnswerIndex must be an integer 0–3.', $index + 1 ),
                    array( 'status' => 400 )
                );
            }
            if ( empty( $q['answerText'] ) || ! is_string( $q['answerText'] ) ) {
                return new WP_Error(
                    'invalid_questions',
                    sprintf( 'Question %d: answerText must be a non-empty string.', $index + 1 ),
                    array( 'status' => 400 )
                );
            }
        }

        return true;
    }

    /** Validates a full create/update body and returns a WP_Error or null. */
    private function validate_create_body( array $body ): ?WP_Error {
        if ( empty( $body['title'] ) ) {
            return new WP_Error( 'missing_required_field', 'title is required.', array( 'status' => 400 ) );
        }

        if ( ! isset( $body['publishDate'] ) || ! is_int( $body['publishDate'] ) ) {
            return new WP_Error(
                'invalid_publishdate',
                'publishDate must be a Unix millisecond integer.',
                array( 'status' => 400 )
            );
        }

        $questions_result = $this->validate_questions( $body['questions'] ?? null );
        if ( is_wp_error( $questions_result ) ) {
            return $questions_result;
        }

        return null;
    }

    /**
     * Saves questions, tags (taxonomy + meta), and schema version post meta.
     *
     * @param int   $post_id
     * @param array<string,mixed> $data
     */
    private function save_game_data( int $post_id, array $data ): void {
        // Ensure each question and choice has a UUID.
        $questions = array_map(
            function ( array $q ): array {
                $q['id'] = ! empty( $q['id'] ) ? $q['id'] : wp_generate_uuid4();
                $q['choices'] = array_map(
                    function ( array $c ): array {
                        $c['id'] = ! empty( $c['id'] ) ? $c['id'] : wp_generate_uuid4();
                        return $c;
                    },
                    $q['choices']
                );
                return $q;
            },
            $data['questions'] ?? array()
        );

        update_post_meta( $post_id, '_trivia_questions', wp_json_encode( $questions ) );

        $tags = array_map( 'sanitize_text_field', $data['tags'] ?? array() );
        wp_set_object_terms( $post_id, $tags, 'trivia_tag' );
        update_post_meta( $post_id, '_trivia_tags', wp_json_encode( $tags ) );

        // Set schema version on creation only.
        if ( ! get_post_meta( $post_id, '_trivia_schema_version', true ) ) {
            update_post_meta( $post_id, '_trivia_schema_version', '1.0' );
        }
    }

    /** Finds a game post by its _trivia_original_id UUID. */
    private function get_game_by_uuid( string $uuid ): ?WP_Post {
        $query = new WP_Query(
            array(
                'post_type'      => 'trail_trivia_game',
                'post_status'    => array( 'publish', 'draft', 'trash' ),
                'meta_key'       => '_trivia_original_id',
                'meta_value'     => $uuid,
                'posts_per_page' => 1,
            )
        );

        return ! empty( $query->posts ) ? $query->posts[0] : null;
    }

    /** Verifies the WordPress REST nonce from X-WP-Nonce header. */
    private function verify_nonce( WP_REST_Request $request ): bool {
        $nonce = $request->get_header( 'X-WP-Nonce' );
        if ( ! $nonce ) {
            return false;
        }
        return (bool) wp_verify_nonce( $nonce, 'wp_rest' );
    }

    /** Converts Unix milliseconds to WordPress datetime string. */
    private function unix_ms_to_wp_date( int $unix_ms ): string {
        return date( 'Y-m-d H:i:s', intval( $unix_ms ) / 1000 );
    }
}
