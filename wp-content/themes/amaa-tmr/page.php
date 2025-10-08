<?php
// Generic page fallback uses Marketing Shell container
get_header(); ?>

<main id="content" class="site">
    <!-- template: page.php (fallback) -->
    <div class="container">
        <?php while (have_posts()) : the_post(); ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <h1 class="entry-title"><?php the_title(); ?></h1>
                <div class="entry-content"><?php the_content(); ?></div>
            </article>
        <?php endwhile; ?>
    </div>
</main>

<?php get_footer();


