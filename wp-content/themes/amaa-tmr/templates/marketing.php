<?php
/**
 * Marketing Template
 * Used for public pages: homepage, pricing, about, insights teasers
 */

// Disable WordPress admin bar for non-admins
if (!current_user_can('administrator')) {
    show_admin_bar(false);
}

get_header(); ?>

<main class="site-main">
    <?php
    // Get the current page template
    $template = get_page_template_slug();
    
    if ($template === 'page-home.php' || is_front_page()) {
        // Homepage layout
        ?>
        <!-- Hero Section (Modern Editorial) -->
        <section class="section section-lg">
            <div class="container container-wide">
                <div class="grid grid-2" style="align-items: center; gap: var(--space-16);">
                    <div>
                        <h1 class="mb-6">AM&AA Market Survey</h1>
                        <p class="body mb-8" style="font-size: var(--text-xl); color: var(--color-gray-600);">
                            Real-time deal flow & valuation signals from the private markets.
                        </p>
                        <div style="display: flex; gap: var(--space-4); flex-wrap: wrap;">
                            <a href="/survey" class="btn btn-primary">Take the Survey</a>
                            <a href="/insights" class="btn btn-secondary">View Insights</a>
                        </div>
                    </div>
                    <div>
                        <!-- Hero visual placeholder -->
                        <div style="background: var(--color-brand-50); border-radius: var(--radius-xl); padding: var(--space-12); text-align: center;">
                            <div class="insight-card-value" style="color: var(--color-brand-600);">$2.4B</div>
                            <div class="insight-card-title">Total Deal Value</div>
                            <div class="delta-chip positive">▲ +12% QoQ</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Scrollytelling Insights Section -->
        <section class="section" style="background: var(--color-gray-50);">
            <div class="container container-wide">
                <div class="scrollytelling-panel">
                    <div class="scrollytelling-headline">
                        Key Market Insights
                    </div>
                    <div class="scrollytelling-content">
                        <div class="insight-card">
                            <div class="insight-card-title">Deal Volume</div>
                            <div class="insight-card-value">847</div>
                            <div class="insight-card-delta positive">▲ +8% QoQ</div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-card-title">Average Deal Size</div>
                            <div class="insight-card-value">$2.8M</div>
                            <div class="insight-card-delta positive">▲ +15% QoQ</div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-card-title">Valuation Multiple</div>
                            <div class="insight-card-value">4.2x</div>
                            <div class="insight-card-delta negative">▼ -3% QoQ</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Credibility Section -->
        <section class="section">
            <div class="container">
                <div class="text-center mb-8">
                    <h2 class="mb-4">Trusted by Industry Leaders</h2>
                    <p class="body" style="color: var(--color-gray-600); max-width: 600px; margin: 0 auto;">
                        Over 500 private market professionals rely on our insights to make informed decisions.
                    </p>
                </div>
                <div class="grid grid-3">
                    <div class="card text-center">
                        <div class="kpi-card-value" style="color: var(--color-brand-600);">500+</div>
                        <div class="kpi-card-label">Active Members</div>
                    </div>
                    <div class="card text-center">
                        <div class="kpi-card-value" style="color: var(--color-brand-600);">$50B+</div>
                        <div class="kpi-card-label">Deal Value Tracked</div>
                    </div>
                    <div class="card text-center">
                        <div class="kpi-card-value" style="color: var(--color-brand-600);">95%</div>
                        <div class="kpi-card-label">Member Satisfaction</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section class="section section-lg" style="background: var(--color-brand-600); color: white;">
            <div class="container text-center">
                <h2 class="mb-4" style="color: white;">Ready to Access Market Insights?</h2>
                <p class="body mb-8" style="color: rgba(255,255,255,0.9); max-width: 600px; margin: 0 auto var(--space-8) auto;">
                    Join industry leaders who rely on our data-driven insights to make informed investment decisions.
                </p>
                <a href="/pricing" class="btn" style="background: white; color: var(--color-brand-600);">View Pricing</a>
            </div>
        </section>
        <?php
    } elseif ($template === 'page-pricing.php' || is_page('pricing')) {
        // Pricing page layout
        ?>
        <section class="section section-lg">
            <div class="container">
                <div class="text-center mb-12">
                    <h1 class="mb-4">Choose Your Plan</h1>
                    <p class="body" style="color: var(--color-gray-600); max-width: 600px; margin: 0 auto;">
                        Access comprehensive market insights and data-driven reports tailored to your needs.
                    </p>
                </div>
                <div class="grid grid-2" style="max-width: 800px; margin: 0 auto;">
                    <div class="pricing-tile">
                        <div class="pricing-title">Non-Member</div>
                        <div class="pricing-price">Free</div>
                        <ul class="pricing-features">
                            <li>Survey Access</li>
                            <li>Teaser Report</li>
                            <li>Basic Insights</li>
                        </ul>
                        <a href="/survey" class="btn btn-secondary" style="width: 100%;">Get Started</a>
                    </div>
                    <div class="pricing-tile featured">
                        <div class="pricing-badge">Most Popular</div>
                        <div class="pricing-title">AM&AA Member</div>
                        <div class="pricing-price">Included</div>
                        <ul class="pricing-features">
                            <li>Full Survey Access</li>
                            <li>Complete Reports</li>
                            <li>Historical Data</li>
                            <li>AI-Generated Briefs</li>
                            <li>Priority Support</li>
                        </ul>
                        <a href="/app" class="btn btn-primary" style="width: 100%;">Access Portal</a>
                    </div>
                </div>
            </div>
        </section>
        <?php
    } else {
        // Default content for other marketing pages
        ?>
        <section class="section">
            <div class="container container-narrow">
                <?php
                while (have_posts()) :
                    the_post();
                    ?>
                    <article class="card">
                        <header class="card-header">
                            <h1 class="card-title"><?php the_title(); ?></h1>
                        </header>
                        <div class="card-body">
                            <?php the_content(); ?>
                        </div>
                    </article>
                    <?php
                endwhile;
                ?>
            </div>
        </section>
        <?php
    }
    ?>
</main>

<?php get_footer(); ?>
