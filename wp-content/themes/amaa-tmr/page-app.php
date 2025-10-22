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
                <a href="/dashboard" class="active">Dashboard</a>
                <a href="/survey">Survey</a>
                <a href="/reports">Reports</a>
                <a href="/profile">Profile</a>
                <a href="/help">Help</a>
            </nav>
        </div>
    </header>

    <!-- App Main Content -->
    <main class="app-main">
        <div class="app-container">
            <!-- Dashboard Header -->
            <div class="dashboard-header">
                <h1 class="dashboard-title" id="dashboard-welcome">Welcome to Your Dashboard</h1>
                <p class="dashboard-subtitle">Here's your survey progress and report access.</p>
            </div>

            <!-- KPI Row -->
            <div class="kpi-row">
                <div class="kpi-card">
                    <div class="kpi-label">Survey Status</div>
                    <div class="kpi-value" id="survey-status">Not Started</div>
                    <div class="kpi-action">
                        <a href="/survey" class="btn btn-secondary">Start Survey</a>
                    </div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-label">Latest Report</div>
                    <div class="kpi-value">Winter 2025</div>
                    <div class="kpi-action">
                        <button class="btn btn-secondary" id="download-report">Download</button>
                    </div>
                </div>
                <div class="kpi-card" id="member-status-card" style="display: none;">
                    <div class="kpi-label">Membership</div>
                    <div class="kpi-value">Active Member</div>
                    <div class="kpi-badge">✓ AM&AA Member</div>
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

<script>
// Personalize dashboard on load
(async function() {
  const token = localStorage.getItem('supabase_token');
  if (!token) {
    window.location.href = '/survey';
    return;
  }
  
  try {
    const response = await fetch('<?php echo esc_url(rest_url('supabase/v1/me')); ?>', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const userData = await response.json();
      
      // Personalize welcome message
      const welcomeEl = document.getElementById('dashboard-welcome');
      if (welcomeEl && userData.email) {
        welcomeEl.textContent = `Welcome back, ${userData.email.split('@')[0]}!`;
      }
      
      // Show member badge if applicable
      if (userData.is_member) {
        const memberCard = document.getElementById('member-status-card');
        if (memberCard) memberCard.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
})();
</script>

<?php get_footer();
