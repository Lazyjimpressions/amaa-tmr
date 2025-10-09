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
      // Brand gradient band with 2-column grid
      return h('section', { style: {
        background: 'linear-gradient(135deg, var(--brand-600, #0B3C5D) 0%, #062C47 100%)',
        color: '#fff',
        padding: 'var(--space-80) 0 var(--space-56)'
      }}, [
        h('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-24)' }}, [
          h('div', { style: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-40)', alignItems: 'center' }}, [
            // Left: Copy + CTAs
            h('div', null, [
              h('h1', { style: {
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-5xl)',
                lineHeight: 'var(--leading-tight)',
                margin: '0 0 var(--space-16) 0'
              }}, 'Your Window Into the Middle Market'),
              h('p', { style: {
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-lg)',
                color: 'rgba(255,255,255,0.9)',
                margin: '0 0 var(--space-20) 0'
              }}, 'Explore exclusive insights, deal data, and valuation trends from the AM&AA Market Survey — the definitive benchmark for middle‑market M&A.'),
              h('div', { style: { display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap' }}, [
                h('a', { className: 'btn btn-primary', href: '/insights' }, 'Access Insights'),
                h('a', { className: 'btn btn-secondary', href: '/app/survey' }, 'Take the Survey')
              ])
            ]),
            // Right: Visual stat block
            h('div', { style: {
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 'var(--radius-24, 24px)',
              padding: 'var(--space-24)'
            }}, [
              h('div', { style: { display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-16)' }}, [
                h('div', { style: { display: 'flex', justifyContent: 'space-between' }}, [ h('div', null, '2000+'), h('span', { style: { opacity: .85 }}, 'Advisors') ]),
                h('div', { style: { display: 'flex', justifyContent: 'space-between' }}, [ h('div', null, '5+'), h('span', { style: { opacity: .85 }}, 'Years of Data') ]),
                h('div', { style: { display: 'flex', justifyContent: 'space-between' }}, [ h('div', null, '$50M'), h('span', { style: { opacity: .85 }}, 'Avg. Deal Size') ])
              ])
            ])
          ])
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
      const card = function(it, i){
        return h('div', { key: it.t, style: {
          backgroundColor: 'var(--bg-surface, #fff)',
          border: '1px solid var(--border-200, #e5e7eb)',
          borderRadius: 'var(--radius-16, 16px)',
          padding: 'var(--space-24)',
          transition: 'transform .2s ease, box-shadow .2s ease'
        }, onMouseEnter: e=>{e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='var(--shadow-lg, 0 10px 20px rgba(0,0,0,.08))';}, onMouseLeave: e=>{e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none';}}, [
          h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 'var(--space-16)' }}, [
            h('div', null, [ h('h3', { style: { margin: 0 }}, it.t), h('p', { style: { margin: 'var(--space-8) 0 0 0' }}, it.d) ]),
            h('div', { style: { minWidth: '110px', textAlign: 'center' }}, [ h('div', { style: { fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}, it.m), h('div', null, it.l) ])
          ])
        ]);
      };
      return h('section', { style: { padding: 'var(--space-64) 0', backgroundColor: 'var(--gray-50)' }}, [
        h('div', { style: { maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-24)' }}, [
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-40)' }}, [
            h('div', { style: { position: 'sticky', top: 'var(--space-80)' }}, [
              h('h2', { style: { margin: '0 0 var(--space-12) 0' }}, 'Key Market Insights'),
              h('p', { style: { color: 'var(--gray-600)' }}, 'Highlights from the most recent AM&AA Market Survey.')
            ]),
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}, items.map(card))
          ])
        ])
      ]);
    }

    function Credibility(){
      const badges = ['500+ Members Contributing', '5+ Years of Historical Data', 'Produced by the Alliance of M&A Advisors'];
      return h('section', { style: { padding: 'var(--space-56) 0', borderTop: '1px solid var(--border-200, #e5e7eb)', borderBottom: '1px solid var(--border-200, #e5e7eb)' }}, [
        h('div', { style: { maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '0 var(--space-24)' }}, [
          h('blockquote', { style: { fontStyle: 'italic', color: 'var(--gray-700)', margin: '0 0 var(--space-16) 0' }}, '“A must‑read for every middle‑market advisor.”'),
          h('cite', { style: { display: 'block', color: 'var(--gray-600)', fontStyle: 'normal', marginBottom: 'var(--space-24)' }}, 'Managing Director, Investment Bank'),
          h('div', { style: { display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap', justifyContent: 'center' }}, badges.map(function(b){ return h('span', { key: b, style: {
            backgroundColor: 'var(--brand-50, #eef2ff)',
            color: 'var(--brand-700, #1e3a8a)',
            border: '1px solid var(--brand-100, #e0e7ff)',
            borderRadius: '9999px',
            padding: '6px 12px',
            fontSize: 'var(--text-sm)'
          }}, b); }))
        ])
      ]);
    }

    function CTA(){
      return h('section', { style: { position: 'relative', backgroundColor: 'var(--brand-600, #0B3C5D)', color: '#fff', padding: 'var(--space-72) 0' }}, [
        // subtle pattern
        h('div', { style: { position: 'absolute', inset: 0, opacity: .15, background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,.25) 0, transparent 40%)' } }),
        h('div', { style: { position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '0 var(--space-24)' }}, [
          h('h3', { style: { margin: '0 0 var(--space-12) 0', fontSize: 'var(--text-3xl)' }}, 'Unlock Full Access to the AM&AA Market Report'),
          h('p', { style: { margin: '0 0 var(--space-20) 0', color: 'rgba(255,255,255,.9)' }}, 'Members receive full Market Survey access, analytics dashboard, and private community.'),
          h('div', { style: { display: 'flex', gap: 'var(--space-12)', flexWrap: 'wrap', justifyContent: 'center' }}, [
            h('a', { className: 'btn btn-primary', href: '/membership' }, 'Join AM&AA'),
            h('a', { className: 'btn btn-secondary', href: '/membership' }, 'Learn About Membership')
          ])
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


