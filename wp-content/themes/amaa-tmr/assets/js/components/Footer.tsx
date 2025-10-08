import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  const quickLinks = [
    { name: 'Market Survey', href: '/survey' },
    { name: 'Insights Dashboard', href: '/insights' },
    { name: 'Reports', href: '/reports' },
    { name: 'Membership', href: '/membership' },
    { name: 'Contact Us', href: '/contact' }
  ];

  const socialLinks = [
    { name: 'LinkedIn', href: 'https://linkedin.com/company/amaa', icon: '💼' },
    { name: 'Twitter', href: 'https://twitter.com/amaa', icon: '🐦' },
    { name: 'Email', href: 'mailto:info@amaaonline.com', icon: '✉️' }
  ];

  return (
    <footer 
      className="footer"
      style={{
        backgroundColor: 'var(--brand-600)',
        color: 'white',
        padding: 'var(--space-64) 0 var(--space-32) 0'
      }}
    >
      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0 var(--space-24)' 
      }}>
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-48)',
          marginBottom: 'var(--space-48)'
        }}>
          {/* About AM&AA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--space-16)',
              color: 'white'
            }}>
              About AM&AA
            </h4>
            
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: 'var(--space-16)'
            }}>
              Connecting and empowering middle-market M&A professionals worldwide.
            </p>
            
            <a 
              href="https://amaaonline.com" 
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--accent-600)',
                textDecoration: 'none',
                fontWeight: 'var(--font-medium)',
                transition: 'color var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent-500)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--accent-600)';
              }}
            >
              Learn More →
            </a>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--space-16)',
              color: 'white'
            }}>
              Quick Links
            </h4>
            
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {quickLinks.map((link, index) => (
                <li key={index} style={{ marginBottom: 'var(--space-8)' }}>
                  <a 
                    href={link.href}
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-sm)',
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--accent-600)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Connect */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              marginBottom: 'var(--space-16)',
              color: 'white'
            }}>
              Connect
            </h4>
            
            <div style={{
              display: 'flex',
              gap: 'var(--space-16)',
              marginBottom: 'var(--space-24)'
            }}>
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-full)',
                    textDecoration: 'none',
                    fontSize: 'var(--text-lg)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-600)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: 'var(--leading-relaxed)'
            }}>
              © 2025 Alliance of M&A Advisors<br />
              All rights reserved.
            </p>
          </motion.div>
        </div>

        {/* Bottom Border */}
        <motion.div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            paddingTop: 'var(--space-24)',
            textAlign: 'center'
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: 0
          }}>
            Powered by WordPress + Supabase + React
          </p>
        </motion.div>
      </div>

      {/* Responsive Design */}
      <style jsx>{`
        @media (max-width: 768px) {
          .footer {
            padding: var(--space-48) 0 var(--space-24) 0 !important;
          }
          
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: var(--space-32) !important;
            text-align: center;
          }
          
          .social-links {
            justify-content: center !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
