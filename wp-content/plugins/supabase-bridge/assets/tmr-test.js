// Additional test functionality for the plugin test page
// This file is only loaded on test pages

document.addEventListener('DOMContentLoaded', function() {
  // Update teaser download link with actual URL
  const teaserLink = document.getElementById('teaser-download');
  if (teaserLink && window.TMR_SB && window.TMR_SB.teaserUrl) {
    teaserLink.href = window.TMR_SB.teaserUrl;
  }

  // Update debug info
  const debugInfo = document.getElementById('debug-info');
  if (debugInfo) {
    function updateDebugInfo() {
      const user = window.TMRUser || {};
      const config = window.TMR_SB || {};
      
      debugInfo.innerHTML = `
        <p><strong>User Status:</strong></p>
        <ul>
          <li>Logged In: ${user.isLoggedIn ? 'Yes' : 'No'}</li>
          <li>Is Member: ${user.isMember ? 'Yes' : 'No'}</li>
          <li>Email: ${user.email || 'Not available'}</li>
          <li>Membership Level: ${user.membership_level || 'Not available'}</li>
        </ul>
        <p><strong>Configuration:</strong></p>
        <ul>
          <li>Supabase URL: ${config.supabaseUrl ? 'Set' : 'Missing'}</li>
          <li>Anon Key: ${config.supabaseAnonKey ? 'Set' : 'Missing'}</li>
          <li>EF Base: ${config.efBase ? 'Set' : 'Missing'}</li>
          <li>Teaser URL: ${config.teaserUrl ? 'Set' : 'Missing'}</li>
        </ul>
        <p><strong>Cache:</strong></p>
        <ul>
          <li>Membership Cache: ${localStorage.getItem('tmr_membership_v1') ? 'Present' : 'Empty'}</li>
        </ul>
      `;
    }

    // Update immediately and then every 2 seconds
    updateDebugInfo();
    setInterval(updateDebugInfo, 2000);
  }
});
