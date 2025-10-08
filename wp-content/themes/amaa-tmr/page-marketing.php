<?php
/*
Template Name: Marketing Shell
Template Post Type: page
*/
get_header(); ?>

<main id="content" class="site">
    <?php if (is_front_page()) : ?>
        <!-- React HomePage Component Mount Point -->
        <div id="homepage-root"></div>
    <?php else : ?>
        <!-- Default content for other marketing pages -->
        <div class="container">
            <?php
            while (have_posts()) : the_post();
                the_content();
            endwhile;
            ?>
        </div>
    <?php endif; ?>
</main>

<?php get_footer();
