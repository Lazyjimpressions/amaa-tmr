// Minimal homepage React island using design tokens and existing buttons
(function(){
  function mount(){
    var mountEl = document.getElementById('homepage-root');
    if (!mountEl) return;
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') return;

    const h = React.createElement;

    // Helpers
    function useCountUp(target, duration){
      const useRef = React.useRef;
      const useState = React.useState;
      const useEffect = React.useEffect;
      const [value, setValue] = useState(0);
      const startedRef = useRef(false);

      useEffect(function(){
        function onIntersect(entries){
          if (entries[0].isIntersecting && !startedRef.current){
            startedRef.current = true;
            const start = performance.now();
            (function tick(now){
              const p = Math.min((now - start) / duration, 1);
              setValue(Math.round(target * p));
              if (p < 1) requestAnimationFrame(tick);
            })(start);
          }
        }
        var observer = new IntersectionObserver(onIntersect, { threshold: 0.3 });
        var node = ref.current;
        if (node) observer.observe(node);
        return function(){ observer.disconnect(); };
      }, []);

      const ref = useRef(null);
      return [value, ref];
    }

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

    function Stats(){
      const useEffect = React.useEffect;
      const [advisors, advisorsRef] = (function(){
        const ref = React.useRef(null);
        const [val, setVal] = React.useState(0);
        React.useEffect(function(){
          const io = new IntersectionObserver(([e])=>{
            if (!e.isIntersecting) return;
            io.disconnect();
            const start = performance.now();
            const target = 2000; const dur = 1500;
            (function step(t){
              const p = Math.min((t - start)/dur, 1);
              setVal(Math.round(target * p));
              if (p < 1) requestAnimationFrame(step);
            })(start);
          }, { threshold: 0.3 });
          if (ref.current) io.observe(ref.current);
          return ()=> io.disconnect();
        }, []);
        return [val, ref];
      })();

      const [years, yearsRef] = (function(){
        const ref = React.useRef(null);
        const [val, setVal] = React.useState(0);
        React.useEffect(function(){
          const io = new IntersectionObserver(([e])=>{
            if (!e.isIntersecting) return;
            io.disconnect();
            const start = performance.now();
            const target = 5; const dur = 1200;
            (function step(t){
              const p = Math.min((t - start)/dur, 1);
              setVal(Math.round(target * p));
              if (p < 1) requestAnimationFrame(step);
            })(start);
          }, { threshold: 0.3 });
          if (ref.current) io.observe(ref.current);
          return ()=> io.disconnect();
        }, []);
        return [val, ref];
      })();

      const [deal, dealRef] = (function(){
        const ref = React.useRef(null);
        const [val, setVal] = React.useState(0);
        React.useEffect(function(){
          const io = new IntersectionObserver(([e])=>{
            if (!e.isIntersecting) return;
            io.disconnect();
            const start = performance.now();
            const target = 50; const dur = 1200;
            (function step(t){
              const p = Math.min((t - start)/dur, 1);
              setVal(Math.round(target * p));
              if (p < 1) requestAnimationFrame(step);
            })(start);
          }, { threshold: 0.3 });
          if (ref.current) io.observe(ref.current);
          return ()=> io.disconnect();
        }, []);
        return [val, ref];
      })();

      const cardStyle = {
        backgroundColor: 'var(--bg-surface, #fff)',
        border: '1px solid var(--border-200, #e5e7eb)',
        borderRadius: 'var(--radius-16, 16px)',
        padding: 'var(--space-24)'
      };

      return h('section', { style: { padding: 'var(--space-24) 0 var(--space-8)' }}, [
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'var(--space-16)' }}, [
          h('div', { style: cardStyle, ref: advisorsRef }, [
            h('div', { style: { fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)' }}, advisors + '+'),
            h('div', null, 'Advisors')
          ]),
          h('div', { style: cardStyle, ref: yearsRef }, [
            h('div', { style: { fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)' }}, years + '+'),
            h('div', null, 'Years of Data')
          ]),
          h('div', { style: cardStyle, ref: dealRef }, [
            h('div', { style: { fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)' }}, '$' + deal + 'M'),
            h('div', null, 'Avg. Deal Size')
          ])
        ])
      ]);
    }

    function Insights(){
      const items = [
        { t: 'Valuations Remain Resilient', d: 'Median EBITDA multiple rose to 7.2×.', m: '7.2×', l: 'Median EBITDA Multiple' },
        { t: 'Private Equity Dominance', d: '62% of sub-$100M transactions involve PE buyers.', m: '62%', l: 'PE Involvement' },
        { t: 'Confidence Index High', d: 'Advisors rate deal confidence at 8.1/10.', m: '8.1', l: 'Confidence' }
      ];
      const card = function(it){
        return h('div', { key: it.t, style: {
          backgroundColor: 'var(--bg-surface, #fff)',
          border: '1px solid var(--border-200, #e5e7eb)',
          borderRadius: 'var(--radius-16, 16px)',
          padding: 'var(--space-24)'
        }}, [
          h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 'var(--space-16)' }}, [
            h('div', null, [
              h('h3', { style: { margin: 0 }}, it.t),
              h('p', { style: { margin: 'var(--space-8) 0 0 0' }}, it.d)
            ]),
            h('div', { style: { minWidth: '110px', textAlign: 'center' }}, [
              h('div', { style: { fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}, it.m),
              h('div', null, it.l)
            ])
          ])
        ]);
      };
      return h('section', { style: { padding: 'var(--space-48) 0' }}, [
        h('h2', { style: { margin: '0 0 var(--space-16) 0' }}, 'Key Market Insights'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}, items.map(card))
      ]);
    }

    function Credibility(){
      const badges = ['500+ Members Contributing', '5+ Years of Historical Data', 'Produced by the Alliance of M&A Advisors'];
      return h('section', { style: { padding: 'var(--space-24) 0', borderTop: '1px solid var(--border-200, #e5e7eb)', borderBottom: '1px solid var(--border-200, #e5e7eb)' }}, [
        h('div', { style: { display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap' }}, badges.map(function(b){ return h('span', { key: b, style: {
          backgroundColor: 'var(--brand-50, #eef2ff)',
          color: 'var(--brand-700, #1e3a8a)',
          border: '1px solid var(--brand-100, #e0e7ff)',
          borderRadius: '9999px',
          padding: '6px 12px',
          fontSize: 'var(--text-sm)'
        }}, b); }))
      ]);
    }

    function CTA(){
      return h('section', { style: { padding: 'var(--space-48) 0' }}, [
        h('h3', { style: { margin: '0 0 var(--space-12) 0' }}, 'Unlock Full Access to the AM&AA Market Report'),
        h('p', { style: { margin: '0 0 var(--space-16) 0', color: 'var(--text-subtle)' }}, 'Members receive full Market Survey access, analytics dashboard, and private community.'),
        h('div', { style: { display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap' }}, [
          h('a', { className: 'btn btn-primary', href: '/membership' }, 'Join AM&AA'),
          h('a', { className: 'btn btn-secondary', href: '/membership' }, 'Learn About Membership')
        ])
      ]);
    }

  function Home(){
    return h('div', { className: 'home-island' }, [
      h(Hero),
      h(Stats),
      h(Insights),
      h(Credibility),
      h(CTA)
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


