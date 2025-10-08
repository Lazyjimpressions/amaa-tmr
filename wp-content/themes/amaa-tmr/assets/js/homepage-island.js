// Minimal homepage React island using design tokens and existing buttons
(function(){
  function mount(){
    var mountEl = document.getElementById('homepage-root');
    if (!mountEl) return;
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') return;

    const h = React.createElement;

  function Hero(){
    return h('section', { style: {
      padding: 'var(--space-64) 0 var(--space-24)',
    }}, [
      h('h1', { style: {
        fontFamily: 'var(--font-heading)',
        fontSize: 'var(--text-4xl)',
        lineHeight: 'var(--leading-tight)',
        margin: '0 0 var(--space-12) 0'
      }}, 'Your Window Into the Middle Market'),
      h('p', { style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-lg)',
        color: 'var(--text-subtle)',
        margin: '0 0 var(--space-16) 0'
      }}, 'Explore exclusive insights, deal data, and valuation trends from the AM&AA Market Survey — the definitive benchmark for middle-market M&A.'),
      h('div', { style: { display: 'flex', gap: 'var(--space-12)' }}, [
        h('a', { className: 'btn btn-primary', href: '/insights' }, 'Access Insights'),
        h('a', { className: 'btn btn-secondary', href: '/app/survey' }, 'Take the Survey')
      ])
    ]);
  }

  function Home(){
    return h('div', { className: 'home-island' }, [
      h(Hero)
    ]);
  }

    if (ReactDOM.createRoot) {
      ReactDOM.createRoot(mountEl).render(h(Home));
    } else {
      ReactDOM.render(h(Home), mountEl);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();


