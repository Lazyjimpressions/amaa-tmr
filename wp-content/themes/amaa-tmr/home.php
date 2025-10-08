<?php
// Posts page layout using Marketing Shell container
get_header(); ?>

<main id="content" class="site">
    <!-- template: home.php (posts index) -->
    <div class="container">
        <?php if (have_posts()) : ?>
            <?php while (have_posts()) : the_post(); ?>
                <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                    <h2 class="entry-title"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></h2>
                    <div class="entry-excerpt"><?php the_excerpt(); ?></div>
                </article>
            <?php endwhile; ?>
            <div class="pagination"><?php the_posts_pagination(); ?></div>
        <?php else : ?>
            <p>No posts found.</p>
        <?php endif; ?>
    </div>
</main>

<?php get_footer();


