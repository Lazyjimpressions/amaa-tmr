import React from 'react';
import { motion, useMotionValue, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';

const HeroSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  // Count-up animations
  const advisorsCount = useMotionValue(0);
  const yearsCount = useMotionValue(0);
  const dealSizeCount = useMotionValue(0);

  const advisorsDisplay = useTransform(advisorsCount, (value) => Math.round(value));
  const yearsDisplay = useTransform(yearsCount, (value) => Math.round(value));
  const dealSizeDisplay = useTransform(dealSizeCount, (value) => Math.round(value));

  React.useEffect(() => {
    if (isInView) {
      advisorsCount.set(2000);
      yearsCount.set(5);
      dealSizeCount.set(50);
    }
  }, [isInView, advisorsCount, yearsCount, dealSizeCount]);

  return (
    <section 
      ref={ref}
      className="hero-section"
      style={{
        background: 'linear-gradient(135deg, var(--brand-600) 0%, #062C47 100%)',
        color: 'white',
        padding: 'var(--space-96) 0',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-24)' }}>
        <div className="hero-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 'var(--space-48)',
          alignItems: 'center'
        }}>
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-5xl)',
              fontWeight: 'var(--font-semibold)',
              lineHeight: 'var(--leading-tight)',
              marginBottom: 'var(--space-16)',
              color: 'white'
            }}>
              Your Window Into the Middle Market
            </h1>
            
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-lg)',
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 'var(--space-32)',
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              Explore exclusive insights, deal data, and valuation trends from the AM&AA Market Survey —
              the definitive benchmark for middle-market M&A.
            </p>
            
            <div style={{ display: 'flex', gap: 'var(--space-16)' }}>
              <button className="btn btn-primary" style={{
                backgroundColor: 'var(--accent-600)',
                color: 'white',
                border: 'none',
                padding: 'var(--space-12) var(--space-24)',
                borderRadius: 'var(--radius-16)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}>
                Access Insights
              </button>
              
              <button className="btn btn-secondary" style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: 'var(--space-12) var(--space-24)',
                borderRadius: 'var(--radius-16)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}>
                Take the Survey
              </button>
            </div>
          </motion.div>

          {/* Right Column - Animated Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}
          >
            <motion.div
              className="stat-card"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-24)',
                padding: 'var(--space-24)',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--accent-600)',
                marginBottom: 'var(--space-8)'
              }}>
                {advisorsDisplay}+
              </motion.div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                Advisors Participating
              </div>
            </motion.div>

            <motion.div
              className="stat-card"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-24)',
                padding: 'var(--space-24)',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--accent-600)',
                marginBottom: 'var(--space-8)'
              }}>
                {yearsDisplay}+
              </motion.div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                Years of Data
              </div>
            </motion.div>

            <motion.div
              className="stat-card"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-24)',
                padding: 'var(--space-24)',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-4xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--accent-600)',
                marginBottom: 'var(--space-8)'
              }}>
                ${dealSizeDisplay}M
              </motion.div>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-base)',
                color: 'rgba(255, 255, 255, 0.9)'
              }}>
                Avg. Deal Size
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Responsive Design */}
      <style jsx>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: var(--space-32) !important;
            text-align: center;
          }
          
          .hero-section {
            padding: var(--space-64) 0 !important;
          }
          
          h1 {
            font-size: var(--text-3xl) !important;
          }
          
          .stat-card {
            margin: 0 auto;
            max-width: 300px;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
