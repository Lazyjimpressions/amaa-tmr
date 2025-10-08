<?php
// Force the static homepage to render like Marketing Shell
get_header(); ?>

<main id="content" class="site">
    <!-- template: front-page.php (marketing shell) -->
    <div id="homepage-root"></div>
    <div class="container">
        <?php while (have_posts()) : the_post(); the_content(); endwhile; ?>
    </div>
    
</main>

<?php get_footer();


