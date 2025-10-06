// TMR Public Survey - Contact Form Component
// Handles initial contact info collection and membership checking

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

const cfg = window.TMR_SB || {};

// Contact form component
class ContactForm {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentStep = 'contact';
    this.contactData = {};
    this.membershipData = {};
    
    if (this.container) {
      this.render();
      this.bindEvents();
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="tmr-survey-container">
        <div class="tmr-progress">
          <div class="tmr-progress-bar">
            <div class="tmr-progress-fill" style="width: 25%"></div>
          </div>
          <div class="tmr-progress-text">Step 1 of 4: Contact Information</div>
        </div>

        <div class="tmr-step tmr-step-contact" data-step="contact">
          <h2>AM&AA Market Survey - Summer 2025</h2>
          <p class="tmr-intro">
            By taking this survey, you will be entered to win a complimentary pass to the 
            2025 AM&AA Summer Conference, a $1,495 value.
          </p>
          <p class="tmr-intro">
            <strong>AM&AA members</strong> who take the survey will receive a <strong>free copy</strong> of the report.<br>
            <strong>Non-members</strong> who take the survey will receive a <strong>discount</strong> on the report.
          </p>
          
          <form id="tmr-contact-form" class="tmr-form">
            <div class="tmr-form-group">
              <label for="firstName">First Name *</label>
              <input type="text" id="firstName" name="firstName" required>
            </div>
            
            <div class="tmr-form-group">
              <label for="lastName">Last Name *</label>
              <input type="text" id="lastName" name="lastName" required>
            </div>
            
            <div class="tmr-form-group">
              <label for="email">Email Address *</label>
              <input type="email" id="email" name="email" required>
              <small>We will not sell or provide your contact info to others.</small>
            </div>
            
            <button type="submit" class="tmr-btn tmr-btn-primary">
              <span class="tmr-btn-text">Continue to Survey</span>
              <span class="tmr-btn-loading" style="display: none;">Checking membership...</span>
            </button>
          </form>
        </div>

        <div class="tmr-step tmr-step-membership" data-step="membership" style="display: none;">
          <div class="tmr-membership-check">
            <div class="tmr-loading" id="membership-loading">
              <div class="tmr-spinner"></div>
              <p>Checking your membership status...</p>
            </div>
            
            <div class="tmr-membership-result" id="membership-result" style="display: none;">
              <div class="tmr-membership-card">
                <h3 id="membership-title"></h3>
                <p id="membership-message"></p>
                <button id="continue-to-survey" class="tmr-btn tmr-btn-primary">
                  Continue to Survey
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="tmr-step tmr-step-survey" data-step="survey" style="display: none;">
          <h2>Survey Questions</h2>
          <p>Survey content will go here...</p>
          <button id="back-to-contact" class="tmr-btn tmr-btn-secondary">
            Back to Contact Info
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Contact form submission
    const contactForm = document.getElementById('tmr-contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleContactSubmit();
      });
    }

    // Continue to survey button
    const continueBtn = document.getElementById('continue-to-survey');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.showStep('survey');
      });
    }

    // Back button
    const backBtn = document.getElementById('back-to-contact');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.showStep('contact');
      });
    }
  }

  async handleContactSubmit() {
    const form = document.getElementById('tmr-contact-form');
    const formData = new FormData(form);
    
    this.contactData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email')
    };

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.tmr-btn-text');
    const btnLoading = submitBtn.querySelector('.tmr-btn-loading');
    
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;

    try {
      // Check membership status
      await this.checkMembership();
    } catch (error) {
      console.error('Membership check failed:', error);
      this.showError('Failed to check membership status. Please try again.');
    } finally {
      // Reset button state
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
    }
  }

  async checkMembership() {
    if (!cfg.efBase) {
      throw new Error('Edge Functions base URL not configured');
    }

    const response = await fetch(`${cfg.efBase}/check-membership`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.contactData)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    this.membershipData = await response.json();
    console.log('Membership check result:', this.membershipData);
    
    // Show membership result
    this.showMembershipResult();
  }

  showMembershipResult() {
    const loading = document.getElementById('membership-loading');
    const result = document.getElementById('membership-result');
    const title = document.getElementById('membership-title');
    const message = document.getElementById('membership-message');

    loading.style.display = 'none';
    result.style.display = 'block';

    if (this.membershipData.is_member) {
      title.textContent = '🎉 Welcome, AM&AA Member!';
      message.innerHTML = `
        <p>Thank you for being an AM&AA member!</p>
        <p><strong>You will receive a free copy</strong> of the Market Report when it's published.</p>
        <p>Let's get started with the survey.</p>
      `;
    } else if (this.membershipData.found) {
      title.textContent = '📊 Survey Participant';
      message.innerHTML = `
        <p>Thank you for your interest in the AM&AA Market Survey!</p>
        <p><strong>Survey participants receive a discount</strong> on the Market Report.</p>
        <p>Let's get started with the survey.</p>
      `;
    } else {
      title.textContent = '👋 Welcome to AM&AA!';
      message.innerHTML = `
        <p>Thank you for your interest in the AM&AA Market Survey!</p>
        <p><strong>Survey participants receive a discount</strong> on the Market Report.</p>
        <p>Learn more about <a href="#" target="_blank">AM&AA membership benefits</a>.</p>
        <p>Let's get started with the survey.</p>
      `;
    }

    this.showStep('membership');
  }

  showStep(step) {
    // Hide all steps
    document.querySelectorAll('.tmr-step').forEach(el => {
      el.style.display = 'none';
    });

    // Show target step
    const targetStep = document.querySelector(`[data-step="${step}"]`);
    if (targetStep) {
      targetStep.style.display = 'block';
    }

    // Update progress bar
    const progressFill = document.querySelector('.tmr-progress-fill');
    const progressText = document.querySelector('.tmr-progress-text');
    
    if (step === 'contact') {
      progressFill.style.width = '25%';
      progressText.textContent = 'Step 1 of 4: Contact Information';
    } else if (step === 'membership') {
      progressFill.style.width = '50%';
      progressText.textContent = 'Step 2 of 4: Membership Check';
    } else if (step === 'survey') {
      progressFill.style.width = '75%';
      progressText.textContent = 'Step 3 of 4: Survey Questions';
    }

    this.currentStep = step;
  }

  showError(message) {
    // Simple error display - could be enhanced
    alert(message);
  }

  // Public methods for external access
  getContactData() {
    return this.contactData;
  }

  getMembershipData() {
    return this.membershipData;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const surveyContainer = document.getElementById('tmr-public-survey');
  if (surveyContainer) {
    window.tmrSurvey = new ContactForm('tmr-public-survey');
  }
});
