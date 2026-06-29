<?php
/**
 * Class Trail_Trivia_Post_Type
 *
 * @package Trail_Trivia
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'TRAIL_TRIVIA_IMAGE_TAXONOMY', 'trivia_image_type' );
define( 'TRAIL_TRIVIA_IMAGE_TERM', 'trivia-answer-image' );

class Trail_Trivia_Post_Type {

    public function register(): void {
        $this->register_post_type();
        $this->register_taxonomy();
        $this->register_image_taxonomy();
    }

    private function register_post_type(): void {
        register_post_type(
            'trail_trivia_game',
            array(
                'labels'             => array(
                    'name'          => 'Trail Trivia Games',
                    'singular_name' => 'Trail Trivia Game',
                ),
                'public'             => false,
                'publicly_queryable' => false,
                'show_ui'            => false,
                'show_in_menu'       => false,
                'show_in_nav_menus'  => false,
                'show_in_rest'       => false,
                'query_var'          => false,
                'rewrite'            => false,
                'capability_type'    => 'post',
                'has_archive'        => false,
                'hierarchical'       => false,
                'supports'           => array( 'title', 'excerpt', 'author', 'custom-fields' ),
            )
        );
    }

    private function register_image_taxonomy(): void {
        register_taxonomy(
            TRAIL_TRIVIA_IMAGE_TAXONOMY,
            'attachment',
            array(
                'label'        => 'Trivia Image Type',
                'public'       => false,
                'show_ui'      => true,
                'show_in_rest' => true,
                'hierarchical' => false,
                'rewrite'      => false,
            )
        );
    }

    private function register_taxonomy(): void {
        register_taxonomy(
            'trivia_tag',
            'trail_trivia_game',
            array(
                'labels'            => array(
                    'name'          => 'Trivia Tags',
                    'singular_name' => 'Trivia Tag',
                ),
                'hierarchical'      => false,
                'public'            => false,
                'show_in_nav_menus' => false,
                'show_tagcloud'     => false,
                'show_in_rest'      => false,
                'rewrite'           => false,
            )
        );
    }
}
