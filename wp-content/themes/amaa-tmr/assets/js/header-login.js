import { h, render } from 'preact';
import { useState } from 'preact/hooks';
import { LoginModal } from './components/LoginModal';

(function() {
  'use strict';
  
  const supabaseConfig = window.supabaseConfig || {
    url: 'https://ffgjqlmulaqtfopgwenf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmZ2pxbG11bGFxdGZvcGd3ZW5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTU2ODEsImV4cCI6MjA3NTE3MTY4MX0.dR0jytzP7h07DkaYdFwkrqyCAZOfVWUfzJwfiJy_O5g'
  };
  
  function HeaderLoginManager() {
    const [showModal, setShowModal] = useState(false);
    
    return h(LoginModal, {
      isOpen: showModal,
      onClose: () => setShowModal(false),
      redirectTo: 'dashboard',
      supabaseConfig: supabaseConfig
    });
  }
  
  // Mount React component
  const modalRoot = document.getElementById('login-modal-root');
  if (modalRoot) {
    const root = render(h(HeaderLoginManager), modalRoot);
    
    // Wire up header login button
    const loginBtn = document.getElementById('header-login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        // Trigger modal open via custom event
        window.dispatchEvent(new CustomEvent('open-login-modal'));
      });
    }
  }
})();
