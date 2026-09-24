import React from 'react';
import Navbar from '../../components/navigation/Navbar';
import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import SmartParkingPreview from '../../components/landing/SmartParkingPreview';
import HowItWorks from '../../components/landing/HowItWorks';
import CTA from '../../components/landing/CTA';
import Footer from '../../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <Hero />
        <SmartParkingPreview />
        <Features />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
