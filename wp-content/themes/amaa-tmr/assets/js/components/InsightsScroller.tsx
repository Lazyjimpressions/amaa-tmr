import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const InsightsScroller: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const insights = [
    {
      id: 1,
      title: "Valuations Remain Resilient",
      description: "Median EBITDA multiple rose to 7.2×, marking continued confidence despite rate pressure.",
      metric: "7.2×",
      metricLabel: "Median EBITDA Multiple"
    },
    {
      id: 2,
      title: "Private Equity Dominance Continues",
      description: "62% of transactions under $100M involved private equity buyers.",
      metric: "62%",
      metricLabel: "PE Involvement"
    },
    {
      id: 3,
      title: "Confidence Index Reaches Two-Year High",
      description: "Advisors rated deal confidence at 8.1 out of 10 — a return to pre-2022 optimism.",
      metric: "8.1",
      metricLabel: "Confidence Score"
    },
    {
      id: 4,
      title: "Sector Spotlight",
      description: "Business Services, Healthcare, and Industrials lead 2024 deal volume.",
      metric: "Top 3",
      metricLabel: "Leading Sectors"
    },
    {
      id: 5,
      title: "Looking Ahead",
      description: "75% of advisors expect deal activity to grow in the next six months.",
      metric: "75%",
      metricLabel: "Growth Expectation"
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="insights-section"
      style={{
        backgroundColor: 'var(--gray-50)',
        padding: 'var(--space-96) 0',
        position: 'relative'
      }}
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-24)' }}>
        <div className="scrollytelling-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: 'var(--space-48)',
          alignItems: 'start'
        }}>
          {/* Left Column - Sticky Headline */}
          <motion.div
            style={{
              position: 'sticky',
              top: 'var(--space-96)',
              paddingRight: 'var(--space-24)'
            }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--brand-600)',
              marginBottom: 'var(--space-24)',
              lineHeight: 'var(--leading-tight)'
            }}>
              Key Market Insights
            </h2>
            
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--gray-600)',
              lineHeight: 'var(--leading-relaxed)'
            }}>
              Highlights from the most recent AM&AA Market Survey.
            </p>
          </motion.div>

          {/* Right Column - Scrolling Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-32)' }}>
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                className="insight-card"
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-24)',
                  padding: 'var(--space-32)',
                  boxShadow: 'var(--shadow-base)',
                  border: '1px solid var(--gray-200)',
                  transition: 'all var(--transition-base)'
                }}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: 'easeOut'
                }}
                viewport={{ once: true, margin: '-100px' }}
                whileHover={{
                  y: -8,
                  boxShadow: 'var(--shadow-lg)',
                  transition: { duration: 0.2 }
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 'var(--space-16)'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--gray-900)',
                      marginBottom: 'var(--space-8)',
                      lineHeight: 'var(--leading-tight)'
                    }}>
                      {insight.title}
                    </h3>
                    
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-base)',
                      color: 'var(--gray-700)',
                      lineHeight: 'var(--leading-relaxed)'
                    }}>
                      {insight.description}
                    </p>
                  </div>
                  
                  <div style={{
                    textAlign: 'center',
                    marginLeft: 'var(--space-24)',
                    minWidth: '120px'
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-3xl)',
                      fontWeight: 'var(--font-bold)',
                      color: 'var(--brand-600)',
                      marginBottom: 'var(--space-4)'
                    }}>
                      {insight.metric}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--gray-600)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {insight.metricLabel}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Design */}
      <style jsx>{`
        @media (max-width: 768px) {
          .scrollytelling-grid {
            grid-template-columns: 1fr !important;
            gap: var(--space-32) !important;
          }
          
          .insights-section {
            padding: var(--space-64) 0 !important;
          }
          
          .insight-card {
            padding: var(--space-24) !important;
          }
          
          .insight-card > div {
            flex-direction: column !important;
            gap: var(--space-16) !important;
          }
          
          .insight-card > div > div:last-child {
            margin-left: 0 !important;
            min-width: auto !important;
          }
        }
      `}</style>
    </section>
  );
};

export default InsightsScroller;
