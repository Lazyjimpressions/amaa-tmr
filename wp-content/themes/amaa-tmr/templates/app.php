<?php
/**
 * App Template
 * Used for member portal pages: /app/* routes
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
    
    if ($template === 'page-dashboard.php' || is_page('app') || is_page('dashboard')) {
        // Member Dashboard (Compact Dashboard)
        ?>
        <section class="section">
            <div class="container">
                <div class="mb-8">
                    <h1 class="mb-2">Member Dashboard</h1>
                    <p class="body" style="color: var(--color-gray-600);">Welcome back! Here's your latest market insights.</p>
                </div>
                
                <!-- KPI Row -->
                <div class="grid grid-3 mb-12">
                    <div class="kpi-card">
                        <div class="kpi-card-label">Survey Responses</div>
                        <div class="kpi-card-value">1,247</div>
                        <div class="kpi-card-change positive">▲ +15% this month</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-card-label">Reports Downloaded</div>
                        <div class="kpi-card-value">23</div>
                        <div class="kpi-card-change positive">▲ +3 this week</div>
                    </div>
                    <div class="kpi-card">
                        <div class="kpi-card-label">AI Briefs Generated</div>
                        <div class="kpi-card-value">8</div>
                        <div class="kpi-card-change neutral">No change</div>
                    </div>
                </div>
                
                <!-- Dashboard Content -->
                <div class="grid grid-2">
                    <!-- Recent Reports -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Recent Reports</h3>
                        </div>
                        <div class="card-body">
                            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-lg);">
                                    <div>
                                        <div style="font-weight: var(--font-medium);">Winter 2025 Market Report</div>
                                        <div class="small">Downloaded 2 days ago</div>
                                    </div>
                                    <a href="#" class="btn btn-ghost" style="padding: var(--space-2) var(--space-3);">Download</a>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-lg);">
                                    <div>
                                        <div style="font-weight: var(--font-medium);">Q4 2024 Deal Flow Analysis</div>
                                        <div class="small">Downloaded 1 week ago</div>
                                    </div>
                                    <a href="#" class="btn btn-ghost" style="padding: var(--space-2) var(--space-3);">Download</a>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background: var(--color-gray-50); border-radius: var(--radius-lg);">
                                    <div>
                                        <div style="font-weight: var(--font-medium);">Valuation Trends Report</div>
                                        <div class="small">Downloaded 2 weeks ago</div>
                                    </div>
                                    <a href="#" class="btn btn-ghost" style="padding: var(--space-2) var(--space-3);">Download</a>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <a href="/app/reports" class="btn btn-secondary" style="width: 100%;">View All Reports</a>
                        </div>
                    </div>
                    
                    <!-- Survey Progress -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Survey Progress</h3>
                        </div>
                        <div class="card-body">
                            <div class="mb-4">
                                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                                    <span class="small">Winter 2025 Survey</span>
                                    <span class="small">75% Complete</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 75%;"></div>
                                </div>
                            </div>
                            <div class="mb-4">
                                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                                    <span class="small">Q4 2024 Follow-up</span>
                                    <span class="small">100% Complete</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 100%;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer">
                            <a href="/app/survey" class="btn btn-primary" style="width: 100%;">Continue Survey</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <?php
    } elseif ($template === 'page-survey.php' || is_page('app/survey')) {
        // Survey Page (Enterprise Minimal)
        ?>
        <section class="section">
            <div class="container container-narrow">
                <div class="mb-8 text-center">
                    <h1 class="mb-4">Market Survey</h1>
                    <p class="body" style="color: var(--color-gray-600);">Help us understand current market conditions by completing this survey.</p>
                </div>
                
                <!-- Progress Bar -->
                <div class="mb-8">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-2);">
                        <span class="small">Progress</span>
                        <span class="small">Step 3 of 5</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 60%;"></div>
                    </div>
                </div>
                
                <!-- Survey Form -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Deal Flow Questions</h3>
                    </div>
                    <div class="card-body">
                        <form id="survey-form">
                            <div style="margin-bottom: var(--space-6);">
                                <label for="deal-volume" class="small" style="display: block; margin-bottom: var(--space-2); font-weight: var(--font-medium);">
                                    How many deals did your firm close in Q4 2024?
                                </label>
                                <input type="number" id="deal-volume" class="input" placeholder="Enter number of deals" min="0">
                            </div>
                            
                            <div style="margin-bottom: var(--space-6);">
                                <label for="deal-size" class="small" style="display: block; margin-bottom: var(--space-2); font-weight: var(--font-medium);">
                                    What was your average deal size?
                                </label>
                                <select id="deal-size" class="input">
                                    <option value="">Select range</option>
                                    <option value="under-1m">Under $1M</option>
                                    <option value="1m-5m">$1M - $5M</option>
                                    <option value="5m-10m">$5M - $10M</option>
                                    <option value="10m-25m">$10M - $25M</option>
                                    <option value="over-25m">Over $25M</option>
                                </select>
                            </div>
                            
                            <div style="margin-bottom: var(--space-6);">
                                <label for="market-outlook" class="small" style="display: block; margin-bottom: var(--space-2); font-weight: var(--font-medium);">
                                    How would you describe the current market outlook?
                                </label>
                                <textarea id="market-outlook" class="input" rows="4" placeholder="Share your thoughts on current market conditions..."></textarea>
                            </div>
                        </form>
                    </div>
                    <div class="card-footer">
                        <div style="display: flex; gap: var(--space-4); justify-content: space-between;">
                            <button type="button" class="btn btn-ghost">Previous</button>
                            <button type="button" class="btn btn-primary">Next Step</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <?php
    } else {
        // Default app content
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
