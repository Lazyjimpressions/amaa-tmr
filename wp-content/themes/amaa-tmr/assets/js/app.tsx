import React from 'react';
import { createRoot } from 'react-dom/client';
import HomePage from './components/HomePage';

// Initialize React app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Mount HomePage component
  const homeContainer = document.getElementById('homepage-root');
  if (homeContainer) {
    const root = createRoot(homeContainer);
    root.render(<HomePage />);
  }
});
