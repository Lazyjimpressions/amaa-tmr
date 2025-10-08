<?php
/*
Template Name: Marketing Shell
Template Post Type: page
*/
get_header(); ?>

<main id="content" class="site">
    <?php if (is_front_page()) : ?>
        <!-- Hero Section - Modern Editorial (#1) -->
        <section class="hero">
            <div class="hero-grid">
                <div class="hero-content">
                    <h1>AM&AA Market Survey</h1>
                    <p>Real-time deal flow & valuation signals for M&A professionals. Get the insights that drive smarter decisions.</p>
                    <div class="hero-actions">
                        <a href="/app/survey" class="btn btn-primary">Take the Survey</a>
                        <a href="/insights" class="btn btn-secondary">View Insights</a>
                    </div>
                </div>
                <div class="hero-visual">
                    <div class="insight-card">
                        <div class="insight-card-title">Current Deal Flow</div>
                        <div class="insight-card-value">18.7%</div>
                        <div class="insight-card-delta positive">▲ +2.1% QoQ</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Scrollytelling Insights Section (#4) -->
        <section class="insights-section">
            <div class="scrollytelling-panel">
                <div class="scrollytelling-headline">
                    <h2>Key Market Insights</h2>
                    <p>Explore the latest trends and data points from the AM&AA Market Survey.</p>
                </div>
                <div class="scrollytelling-content">
                    <div class="insight-card">
                        <div class="insight-card-title">Valuation Multiples</div>
                        <div class="insight-card-value">6.2x EBITDA</div>
                        <div class="insight-card-delta negative">▼ -0.3x QoQ</div>
                    </div>
                    <div class="insight-card">
                        <div class="insight-card-title">Average Deal Size</div>
                        <div class="insight-card-value">$25M</div>
                        <div class="insight-card-delta positive">▲ +$2M QoQ</div>
                    </div>
                    <div class="insight-card">
                        <div class="insight-card-title">Private Equity Activity</div>
                        <div class="insight-card-value">High</div>
                        <div class="insight-card-delta neutral">Stable QoQ</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Credibility Section -->
        <section class="credibility-section">
            <div class="credibility-grid">
                <div class="credibility-card">
                    <div class="credibility-value">500+</div>
                    <div class="credibility-label">Active Members</div>
                </div>
                <div class="credibility-card">
                    <div class="credibility-value">$2.5B</div>
                    <div class="credibility-label">Deals Tracked</div>
                </div>
                <div class="credibility-card">
                    <div class="credibility-value">95%</div>
                    <div class="credibility-label">Member Satisfaction</div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="cta-section">
            <div class="cta-content">
                <h2>Ready to Get Started?</h2>
                <p>Join the AM&AA Market Survey and get access to exclusive insights, reports, and AI-powered briefs.</p>
                <a href="/app/survey" class="btn btn-white">Start Your Survey</a>
            </div>
        </section>
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
