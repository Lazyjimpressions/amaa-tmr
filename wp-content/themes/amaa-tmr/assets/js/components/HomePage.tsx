import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from './HeroSection';
import InsightsScroller from './InsightsScroller';
import CredibilityBand from './CredibilityBand';
import CTASection from './CTASection';
import Footer from './Footer';

const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <HeroSection />
      <InsightsScroller />
      <CredibilityBand />
      <CTASection />
      <Footer />
    </div>
  );
};

export default HomePage;
