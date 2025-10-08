<?php
/*
Template Name: App Shell
Template Post Type: page
*/
get_header(); ?>

<div class="app-shell">
    <!-- App Header -->
    <header class="app-header">
        <div class="app-header-content">
            <a href="/" class="app-logo">AM&AA TMR</a>
            <nav class="app-nav">
                <a href="/app/dashboard" class="active">Dashboard</a>
                <a href="/app/survey">Survey</a>
                <a href="/app/reports">Reports</a>
                <a href="/app/profile">Profile</a>
                <a href="/app/help">Help</a>
            </nav>
        </div>
    </header>

    <!-- App Main Content -->
    <main class="app-main">
        <div class="app-container">
            <!-- Dashboard Header -->
            <div class="dashboard-header">
                <h1 class="dashboard-title">Member Dashboard</h1>
                <p class="dashboard-subtitle">Welcome back! Here's your latest survey progress and insights.</p>
            </div>

            <!-- KPI Row - Compact Dashboard (#9) -->
            <div class="kpi-row">
                <div class="kpi-card">
                    <div class="kpi-label">Your Survey Progress</div>
                    <div class="kpi-value">75%</div>
                    <div class="kpi-change positive">Continue Survey</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Latest Report Access</div>
                    <div class="kpi-value">Winter 2025</div>
                    <div class="kpi-change neutral">Download Now</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">AI Briefs Generated</div>
                    <div class="kpi-value">3</div>
                    <div class="kpi-change positive">View All Briefs</div>
                </div>
            </div>

            <!-- Content Row -->
            <div class="content-row">
                <!-- Reports Card -->
                <div class="reports-card">
                    <div class="reports-header">
                        <h3 class="reports-title">Recent Reports</h3>
                    </div>
                    <div class="reports-list">
                        <div class="reports-item">
                            <div class="reports-info">
                                <div class="reports-name">Winter 2025 Market Report</div>
                                <div class="reports-date">Published 2 days ago</div>
                            </div>
                            <a href="#" class="reports-download">Download</a>
                        </div>
                        <div class="reports-item">
                            <div class="reports-info">
                                <div class="reports-name">Fall 2024 Market Report</div>
                                <div class="reports-date">Published 1 month ago</div>
                            </div>
                            <a href="#" class="reports-download">Download</a>
                        </div>
                        <div class="reports-item">
                            <div class="reports-info">
                                <div class="reports-name">Summer 2024 Market Report</div>
                                <div class="reports-date">Published 3 months ago</div>
                            </div>
                            <a href="#" class="reports-download">Download</a>
                        </div>
                    </div>
                    <div class="reports-footer">
                        <a href="/app/reports" class="btn btn-secondary">View All Reports</a>
                    </div>
                </div>

                <!-- Survey Progress Card -->
                <div class="survey-card">
                    <div class="survey-header">
                        <h3 class="survey-title">Survey Progress</h3>
                    </div>
                    <div class="survey-progress">
                        <div class="survey-progress-item">
                            <div class="survey-progress-header">
                                <div class="survey-progress-label">Company Information</div>
                                <div class="survey-progress-percent">100%</div>
                            </div>
                            <div class="survey-progress-bar">
                                <div class="survey-progress-fill" style="width: 100%;"></div>
                            </div>
                        </div>
                        <div class="survey-progress-item">
                            <div class="survey-progress-header">
                                <div class="survey-progress-label">Market Data</div>
                                <div class="survey-progress-percent">75%</div>
                            </div>
                            <div class="survey-progress-bar">
                                <div class="survey-progress-fill" style="width: 75%;"></div>
                            </div>
                        </div>
                        <div class="survey-progress-item">
                            <div class="survey-progress-header">
                                <div class="survey-progress-label">Valuation Insights</div>
                                <div class="survey-progress-percent">50%</div>
                            </div>
                            <div class="survey-progress-bar">
                                <div class="survey-progress-fill" style="width: 50%;"></div>
                            </div>
                        </div>
                    </div>
                    <div class="survey-footer">
                        <a href="/app/survey" class="btn btn-primary">Continue Survey</a>
                    </div>
                </div>
            </div>

            <!-- React App Mount Point -->
            <div id="app-root" style="margin-top: var(--space-48);">
                <!-- React will render the main application here -->
                <div class="skeleton" style="height: 200px; border-radius: var(--radius-16);"></div>
            </div>
        </div>
    </main>
</div>

<?php get_footer();
