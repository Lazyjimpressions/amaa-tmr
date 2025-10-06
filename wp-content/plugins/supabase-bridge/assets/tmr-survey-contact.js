// TMR Public Survey - Contact Form Component
// Handles initial contact info collection and membership checking

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

const cfg = window.TMR_SB || {};
let sb = null;

// Contact form component
class ContactForm {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentStep = 'contact';
    this.contactData = {};
    this.membershipData = {};
    
    if (this.container) {
      // init supabase (used for optional magic-link account creation)
      if (cfg.supabaseUrl && cfg.supabaseAnonKey) {
        sb = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
        });
      }
      this.render();
      this.bindEvents();
    }
  }

  render() {
    console.log('[TMR Survey] Rendering form for container:', this.container);
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
                <div class="tmr-actions" id="membership-actions">
                  <button id="continue-to-survey" class="tmr-btn tmr-btn-primary">Start Without Account</button>
                  <button id="send-magic-link" class="tmr-btn tmr-btn-secondary">Create Account (Save Progress)</button>
                  <p id="magic-link-status" style="margin-top:10px;color:#555;"></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="tmr-step tmr-step-survey" data-step="survey" style="display: none;">
          <h2>Survey Questions</h2>
          <p>Please answer the following questions about your market experience:</p>
          
          <form id="tmr-survey-form" class="tmr-form">
            <!-- Sample questions - these would be dynamically loaded from the survey structure -->
            <div class="tmr-form-group">
              <label>1. What is your primary role in M&A transactions?</label>
              <div class="tmr-radio-group">
                <label><input type="radio" name="role" value="buyer" required> Buyer</label>
                <label><input type="radio" name="role" value="seller" required> Seller</label>
                <label><input type="radio" name="role" value="advisor" required> Advisor</label>
                <label><input type="radio" name="role" value="other" required> Other</label>
              </div>
            </div>
            
            <div class="tmr-form-group">
              <label>2. How many deals have you been involved in over the past 12 months?</label>
              <select name="deal_count" required>
                <option value="">Select...</option>
                <option value="0">0</option>
                <option value="1-2">1-2</option>
                <option value="3-5">3-5</option>
                <option value="6-10">6-10</option>
                <option value="11+">11+</option>
              </select>
            </div>
            
            <div class="tmr-form-group">
              <label>3. What is your primary industry focus?</label>
              <input type="text" name="industry_focus" placeholder="e.g., Technology, Healthcare, Manufacturing" required>
            </div>
            
            <div class="tmr-form-group">
              <label>4. What deal size range do you typically work with?</label>
              <div class="tmr-radio-group">
                <label><input type="radio" name="deal_size" value="under-10m" required> Under $10M</label>
                <label><input type="radio" name="deal_size" value="10m-50m" required> $10M - $50M</label>
                <label><input type="radio" name="deal_size" value="50m-100m" required> $50M - $100M</label>
                <label><input type="radio" name="deal_size" value="over-100m" required> Over $100M</label>
              </div>
            </div>
            
            <div class="tmr-form-group">
              <label>5. What are the biggest challenges you face in M&A transactions?</label>
              <textarea name="challenges" rows="4" placeholder="Please describe the main challenges..."></textarea>
            </div>
            
            <div class="tmr-form-actions">
              <button type="submit" class="tmr-btn tmr-btn-primary">
                <span class="tmr-btn-text">Submit Survey</span>
                <span class="tmr-btn-loading" style="display: none;">Submitting...</span>
              </button>
            </div>
          </form>
          
          <div id="login-nudge" style="background:#f8f9fa;border-left:4px solid #007cba;padding:12px 16px;border-radius:6px;margin:12px 0;display:none;">
            <strong>Tip:</strong> Create an account to save progress and access the member portal.
            <button id="inline-magic-link" class="tmr-btn tmr-btn-secondary" style="margin-left:8px;">Send Magic Link</button>
            <span id="inline-magic-status" style="margin-left:8px;color:#555;"></span>
          </div>
          
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

    // Survey form submission
    const surveyForm = document.getElementById('tmr-survey-form');
    if (surveyForm) {
      surveyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSurveySubmit();
      });
    }

    // Continue to survey button
    const continueBtn = document.getElementById('continue-to-survey');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        this.showStep('survey');
        this.updateLoginNudge();
      });
    }

    // Magic link buttons
    const magicBtn = document.getElementById('send-magic-link');
    if (magicBtn) {
      magicBtn.addEventListener('click', async () => {
        await this.sendMagicLink('magic-link-status');
      });
    }

    const inlineMagic = document.getElementById('inline-magic-link');
    if (inlineMagic) {
      inlineMagic.addEventListener('click', async () => {
        await this.sendMagicLink('inline-magic-status');
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
        <p>Check your email to login if you want to save progress, or continue without logging in.</p>
      `;
    } else if (this.membershipData.found) {
      title.textContent = '📊 Survey Participant';
      message.innerHTML = `
        <p>Thank you for your interest in the AM&AA Market Survey!</p>
        <p><strong>Survey participants receive a discount</strong> on the Market Report.</p>
        <p>You can create an account to save progress and access the member portal, or start right away.</p>
      `;
    } else {
      title.textContent = '👋 Welcome to AM&AA!';
      message.innerHTML = `
        <p>Thank you for your interest in the AM&AA Market Survey!</p>
        <p><strong>Survey participants receive a discount</strong> on the Market Report.</p>
        <p>Learn more about <a href="#" target="_blank">AM&AA membership benefits</a>.</p>
        <p>Create an account to save progress and access the member portal, or start right away.</p>
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

  async sendMagicLink(statusElementId) {
    if (!sb) {
      alert('Supabase is not configured.');
      return;
    }
    const email = (this.contactData?.email || '').toString();
    if (!email) {
      alert('Please enter your email first.');
      return;
    }
    const statusEl = document.getElementById(statusElementId);
    if (statusEl) statusEl.textContent = 'Sending magic link...';
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: cfg.siteOrigin || window.location.origin }
    });
    if (statusEl) statusEl.textContent = error ? 'Error sending link. Try again.' : 'Check your inbox for the magic link.';
  }

  async updateLoginNudge() {
    if (!sb) return;
    const { data: { session } } = await sb.auth.getSession();
    const nudge = document.getElementById('login-nudge');
    if (nudge) nudge.style.display = session ? 'none' : 'block';
  }

  async handleSurveySubmit() {
    const form = document.getElementById('tmr-survey-form');
    const formData = new FormData(form);
    
    // Convert form data to answers array
    const answers = [];
    for (const [name, value] of formData.entries()) {
      if (value.trim()) {
        answers.push({
          code: name,
          type: this.getAnswerType(name),
          value: value.trim()
        });
      }
    }

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.tmr-btn-text');
    const btnLoading = submitBtn.querySelector('.tmr-btn-loading');
    
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;

    try {
      // Check if user is logged in
      const isLoggedIn = sb && (await sb.auth.getSession()).data.session;
      
      if (isLoggedIn) {
        // Use authenticated endpoint
        await this.submitSurveyAuthenticated(answers);
      } else {
        // Use public endpoint
        await this.submitSurveyPublic(answers);
      }
      
      // Show success message
      this.showSurveySuccess();
      
    } catch (error) {
      console.error('Survey submission failed:', error);
      this.showError('Failed to submit survey. Please try again.');
    } finally {
      // Reset button state
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
    }
  }

  getAnswerType(fieldName) {
    // Determine answer type based on field name
    const textFields = ['industry_focus', 'challenges'];
    const selectFields = ['deal_count'];
    const radioFields = ['role', 'deal_size'];
    
    if (textFields.includes(fieldName)) return 'text';
    if (selectFields.includes(fieldName)) return 'single';
    if (radioFields.includes(fieldName)) return 'single';
    return 'text'; // default
  }

  async submitSurveyAuthenticated(answers) {
    if (!cfg.efBase) {
      throw new Error('Edge Functions base URL not configured');
    }

    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const response = await fetch(`${cfg.efBase}/survey-submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        survey_slug: '2025-summer',
        answers: answers
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async submitSurveyPublic(answers) {
    if (!cfg.efBase) {
      throw new Error('Edge Functions base URL not configured');
    }

    const response = await fetch(`${cfg.efBase}/survey-submit-public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: this.contactData.email,
        survey_slug: '2025-summer',
        answers: answers,
        hubspot_contact_id: this.membershipData.hubspot_contact_id || null
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  showSurveySuccess() {
    // Update progress to completion
    const progressFill = document.querySelector('.tmr-progress-fill');
    const progressText = document.querySelector('.tmr-progress-text');
    
    progressFill.style.width = '100%';
    progressText.textContent = 'Step 4 of 4: Survey Complete!';

    // Show success message
    const surveyStep = document.querySelector('.tmr-step-survey');
    surveyStep.innerHTML = `
      <div class="tmr-success">
        <h2>🎉 Thank You!</h2>
        <p>Your survey has been submitted successfully.</p>
        <p><strong>What happens next:</strong></p>
        <ul>
          <li>You'll be entered to win a complimentary pass to the 2025 AM&AA Summer Conference</li>
          ${this.membershipData.is_member ? 
            '<li>As an AM&AA member, you\'ll receive a <strong>free copy</strong> of the Market Report when it\'s published</li>' :
            '<li>You\'ll receive a <strong>discount</strong> on the Market Report when it\'s published</li>'
          }
          <li>We'll notify you when the report is available</li>
        </ul>
        <p>Thank you for participating in the AM&AA Market Survey!</p>
      </div>
    `;
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
  console.log('[TMR Survey] DOM loaded, looking for container...');
  const surveyContainer = document.getElementById('tmr-public-survey');
  if (surveyContainer) {
    console.log('[TMR Survey] Container found, initializing ContactForm...');
    window.tmrSurvey = new ContactForm('tmr-public-survey');
    console.log('[TMR Survey] ContactForm initialized:', window.tmrSurvey);
  } else {
    console.log('[TMR Survey] Container not found! Available elements:', document.querySelectorAll('[id*="survey"]));
  }
});
