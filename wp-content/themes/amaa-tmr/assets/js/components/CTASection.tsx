import React from 'react';
import { motion } from 'framer-motion';

const CTASection: React.FC = () => {
  return (
    <section 
      className="cta-section"
      style={{
        backgroundColor: 'var(--brand-600)',
        padding: 'var(--space-96) 0',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(45deg, transparent 25%, rgba(242, 159, 5, 0.1) 25%),
          linear-gradient(-45deg, transparent 25%, rgba(242, 159, 5, 0.1) 25%),
          linear-gradient(45deg, rgba(242, 159, 5, 0.1) 75%, transparent 75%),
          linear-gradient(-45deg, rgba(242, 159, 5, 0.1) 75%, transparent 75%)
        `,
        backgroundSize: '60px 60px',
        backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px',
        opacity: 0.3
      }} />

      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 var(--space-24)',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div
          style={{ textAlign: 'center' }}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-3xl)',
            fontWeight: 'var(--font-semibold)',
            color: 'white',
            marginBottom: 'var(--space-16)',
            lineHeight: 'var(--leading-tight)'
          }}>
            Unlock Full Access to the AM&AA Market Report
          </h3>
          
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            color: 'rgba(255, 255, 255, 0.9)',
            lineHeight: 'var(--leading-relaxed)',
            marginBottom: 'var(--space-32)',
            maxWidth: '600px',
            margin: '0 auto var(--space-32) auto'
          }}>
            Members receive exclusive access to the complete Market Survey,
            in-depth analytics dashboard, and private dealmaking community.
          </p>

          {/* CTA Buttons */}
          <motion.div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--space-16)',
              flexWrap: 'wrap'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="btn btn-primary"
              style={{
                backgroundColor: 'var(--accent-600)',
                color: 'white',
                border: 'none',
                padding: 'var(--space-16) var(--space-32)',
                borderRadius: 'var(--radius-16)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                minWidth: '200px'
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: '0 10px 25px rgba(242, 159, 5, 0.3)',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              Join AM&AA
            </motion.button>
            
            <motion.button
              className="btn btn-secondary"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                padding: 'var(--space-16) var(--space-32)',
                borderRadius: 'var(--radius-16)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                minWidth: '200px'
              }}
              whileHover={{
                scale: 1.05,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              Learn About Membership
            </motion.button>
          </motion.div>

          {/* Additional Benefits */}
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--space-24)',
              marginTop: 'var(--space-48)',
              maxWidth: '800px',
              margin: 'var(--space-48) auto 0 auto'
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {[
              { icon: '📊', title: 'Complete Market Survey', desc: 'Full access to all data' },
              { icon: '📈', title: 'Analytics Dashboard', desc: 'Interactive insights' },
              { icon: '🤝', title: 'Private Community', desc: 'Network with peers' }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                style={{
                  textAlign: 'center',
                  padding: 'var(--space-24)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-16)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -5,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transition: { duration: 0.2 }
                }}
              >
                <div style={{
                  fontSize: 'var(--text-2xl)',
                  marginBottom: 'var(--space-8)'
                }}>
                  {benefit.icon}
                </div>
                <h4 style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'white',
                  marginBottom: 'var(--space-4)'
                }}>
                  {benefit.title}
                </h4>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 'var(--leading-relaxed)'
                }}>
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Responsive Design */}
      <style jsx>{`
        @media (max-width: 768px) {
          .cta-section {
            padding: var(--space-64) 0 !important;
          }
          
          h3 {
            font-size: var(--text-2xl) !important;
          }
          
          .cta-buttons {
            flex-direction: column !important;
            align-items: center !important;
          }
          
          .benefits-grid {
            grid-template-columns: 1fr !important;
            gap: var(--space-16) !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CTASection;
