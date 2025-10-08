<?php
/*
Template Name: Marketing Shell
Template Post Type: page
*/
get_header(); ?>

<main id="content" class="site">
    <!-- template: page-marketing.php -->
    <div id="homepage-root"></div>
    <div class="container">
        <?php
        while (have_posts()) : the_post();
            the_content();
        endwhile;
        ?>
    </div>
</main>

<?php get_footer();
