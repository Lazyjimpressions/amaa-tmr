<?php
/*
Template Name: Survey Page
Template Post Type: page
*/
get_header(); ?>

<!-- template: page-survey.php -->
<main id="content" class="site">
    <div class="survey-container">
        <div id="survey-container"></div>
        
        <!-- Fallback content for non-JS users -->
        <noscript>
            <div class="survey-fallback">
                <h1>AM&AA Market Survey</h1>
                <p>Please enable JavaScript to complete the survey.</p>
            </div>
        </noscript>
    </div>
</main>

<?php get_footer(); ?>
