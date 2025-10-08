import React from 'react';
import { motion } from 'framer-motion';

const CredibilityBand: React.FC = () => {
  const badges = [
    "500+ Members Contributing",
    "5+ Years of Historical Data", 
    "Produced by the Alliance of M&A Advisors"
  ];

  const testimonials = [
    {
      quote: "A must-read for every middle-market advisor.",
      author: "Managing Director, Investment Bank"
    },
    {
      quote: "Essential data for valuation benchmarking.",
      author: "Partner, Private Equity Firm"
    },
    {
      quote: "The gold standard for M&A market intelligence.",
      author: "CEO, Business Services Company"
    }
  ];

  return (
    <section 
      className="credibility-section"
      style={{
        backgroundColor: 'white',
        padding: 'var(--space-96) 0',
        borderTop: '1px solid var(--gray-200)',
        borderBottom: '1px solid var(--gray-200)'
      }}
    >
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-24)' }}>
        {/* Main Heading */}
        <motion.div
          style={{ textAlign: 'center', marginBottom: 'var(--space-48)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--brand-600)',
            marginBottom: 'var(--space-8)'
          }}>
            Trusted by the Middle-Market Community
          </h3>
          
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--gray-600)',
            lineHeight: 'var(--leading-relaxed)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            For over a decade, the AM&AA Market Survey has captured the voice of hundreds of M&A professionals across North America.
          </p>
        </motion.div>

        {/* Badge Row */}
        <motion.div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-24)',
            marginBottom: 'var(--space-48)',
            flexWrap: 'wrap'
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              style={{
                backgroundColor: 'var(--brand-50)',
                color: 'var(--brand-600)',
                padding: 'var(--space-12) var(--space-24)',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                border: '1px solid var(--brand-100)',
                whiteSpace: 'nowrap'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{
                scale: 1.05,
                backgroundColor: 'var(--brand-100)',
                transition: { duration: 0.2 }
              }}
            >
              {badge}
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonial Carousel */}
        <motion.div
          style={{
            backgroundColor: 'var(--gray-50)',
            borderRadius: 'var(--radius-24)',
            padding: 'var(--space-32)',
            textAlign: 'center',
            maxWidth: '800px',
            margin: '0 auto'
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <blockquote style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lg)',
            fontStyle: 'italic',
            color: 'var(--gray-700)',
            lineHeight: 'var(--leading-relaxed)',
            marginBottom: 'var(--space-16)',
            position: 'relative'
          }}>
            <span style={{
              fontSize: 'var(--text-4xl)',
              color: 'var(--brand-600)',
              position: 'absolute',
              left: '-20px',
              top: '-10px'
            }}>"</span>
            {testimonials[0].quote}
            <span style={{
              fontSize: 'var(--text-4xl)',
              color: 'var(--brand-600)',
              position: 'absolute',
              right: '-20px',
              bottom: '-20px'
            }}>"</span>
          </blockquote>
          
          <cite style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--gray-600)',
            fontStyle: 'normal',
            fontWeight: 'var(--font-medium)'
          }}>
            — {testimonials[0].author}
          </cite>
        </motion.div>

        {/* Partner Logos Placeholder */}
        <motion.div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--space-32)',
            marginTop: 'var(--space-48)',
            opacity: 0.6,
            flexWrap: 'wrap'
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--gray-500)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            Trusted Partners
          </div>
          <div style={{
            display: 'flex',
            gap: 'var(--space-24)',
            alignItems: 'center'
          }}>
            {['AM&AA', 'PitchBook', 'CapLinked', 'Axial'].map((partner, index) => (
              <div
                key={index}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--gray-400)',
                  fontWeight: 'var(--font-medium)',
                  padding: 'var(--space-8) var(--space-16)',
                  border: '1px solid var(--gray-300)',
                  borderRadius: 'var(--radius-8)',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--brand-600)';
                  e.currentTarget.style.borderColor = 'var(--brand-600)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--gray-400)';
                  e.currentTarget.style.borderColor = 'var(--gray-300)';
                }}
              >
                {partner}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Responsive Design */}
      <style jsx>{`
        @media (max-width: 768px) {
          .credibility-section {
            padding: var(--space-64) 0 !important;
          }
          
          .badge-row {
            flex-direction: column !important;
            align-items: center !important;
            gap: var(--space-16) !important;
          }
          
          .partner-logos {
            flex-direction: column !important;
            gap: var(--space-16) !important;
          }
        }
      `}</style>
    </section>
  );
};

export default CredibilityBand;
