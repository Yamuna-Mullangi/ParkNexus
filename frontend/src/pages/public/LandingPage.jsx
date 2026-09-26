import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, Shield, Clock, Users, BarChart, Settings, 
  MapPin, CheckCircle, ArrowRight, Zap, Map,
  Check, Smartphone, Video, QrCode
} from 'lucide-react';
import '../../components/landing/Landing.css'; // Assume we will create/update this

// Reusing Navbar from existing components or a custom one if missing
import LandingNavbar from '../../components/navigation/LandingNavbar';
import Footer from '../../components/landing/Footer';
import ParkNexus3DScene from '../../components/landing/3d/ParkNexus3DScene';


const Hero = () => (
  <section className="landing-hero">
    <div className="hero-content">
      <div className="hero-badge">Smart Residential Platform</div>
      <h1 className="hero-title">Parking, <span>Made Intelligent.</span></h1>
      <p className="hero-subtitle">
        ParkNexus helps residential communities manage parking availability, reservations, 
        visitor access, and security operations—all from one seamless platform.
      </p>
      <div className="hero-actions">
        <Link to="/login" className="btn btn-primary btn-lg">Find Parking</Link>
        <a href="#features" className="btn btn-outline btn-lg">Explore Features</a>
      </div>
    </div>
    <div className="hero-visual">
      <div className="hero-dashboard-mockup">
        <div className="mockup-header">
          <div className="mockup-dots"><span></span><span></span><span></span></div>
        </div>
        <div className="mockup-body">
          <div className="mockup-widget">
            <h4>Available Spots</h4>
            <div className="mockup-number">42</div>
          </div>
          <div className="mockup-widget">
            <h4>Active Visitors</h4>
            <div className="mockup-number">12</div>
          </div>
          <div className="mockup-map">
            <div className="spot available">A-14</div>
            <div className="spot occupied">A-15</div>
            <div className="spot reserved">A-16</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TrustStrip = () => (
  <section className="trust-strip">
    <div className="trust-item"><Clock size={24} /> <span>Real-Time Availability</span></div>
    <div className="trust-item"><Car size={24} /> <span>Easy Reservations</span></div>
    <div className="trust-item"><Users size={24} /> <span>Visitor Access</span></div>
    <div className="trust-item"><Zap size={24} /> <span>Smart Recommendations</span></div>
    <div className="trust-item"><Shield size={24} /> <span>Secure Gate Operations</span></div>
    <div className="trust-item"><BarChart size={24} /> <span>Parking Analytics</span></div>
  </section>
);

const CoreFeatures = () => {
  const features = [
    { icon: <Map size={32} />, title: 'Smart Parking Map', desc: 'Live availability with interactive maps.' },
    { icon: <Clock size={32} />, title: 'Reservations', desc: 'Book spots in advance without conflicts.' },
    { icon: <Users size={32} />, title: 'Parking Sharing', desc: 'Share your assigned spot when away.' },
    { icon: <Car size={32} />, title: 'Vehicle Management', desc: 'Track residents and registered vehicles.' },
    { icon: <Smartphone size={32} />, title: 'Visitor QR Passes', desc: 'Secure, scannable guest access.' },
    { icon: <Shield size={32} />, title: 'Security Gate', desc: 'Live monitoring and gate check-in workflows.' },
    { icon: <Zap size={32} />, title: 'Smart Recommendations', desc: 'Find the best spot based on your vehicle and preferences.' },
    { icon: <BarChart size={32} />, title: 'Analytics', desc: 'Community parking usage insights.' }
  ];

  return (
    <section id="features" className="core-features">
      <div className="section-header">
        <h2>Everything you need.</h2>
        <p>A complete ecosystem for modern residential parking.</p>
      </div>
      <div className="features-grid">
        {features.map((f, i) => (
          <div className="uiverse-container noselect" key={i}>
            <div className="canvas">
              {Array.from({ length: 25 }).map((_, j) => (
                <div key={j} className={`tracker tr-${j + 1}`}></div>
              ))}
              <div className="uiverse-card">
                <div className="card-glare"></div>
                <div className="cyber-lines">
                  <span></span><span></span><span></span><span></span>
                </div>
                <div className="corner-elements">
                  <span></span><span></span><span></span><span></span>
                </div>
                <div className="scan-line"></div>
                <div className="glowing-elements">
                  <div className="glow-1"></div>
                  <div className="glow-2"></div>
                  <div className="glow-3"></div>
                </div>
                <div className="card-particles">
                  <span></span><span></span><span></span><span></span><span></span><span></span>
                </div>
                
                <div className="card-content">
                  <div className="feature-icon">{f.icon}</div>
                  <h3 className="title">{f.title}</h3>
                  <p className="subtitle">{f.desc}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const HowItWorks = () => (
  <section id="about" className="how-it-works">
    <div className="section-header">
      <h2>How It Works</h2>
      <p>The simplest workflow for residents and guests.</p>
    </div>
    <div className="workflow-steps">
      <div className="step">
        <div className="step-number"><Map size={32} /></div>
        <div className="step-content">
          <h3>Find a Spot</h3>
          <p>View live availability and smart recommendations.</p>
        </div>
      </div>
      <div className="step">
        <div className="step-number"><Clock size={32} /></div>
        <div className="step-content">
          <h3>Reserve</h3>
          <p>Book instantly with conflict-free scheduling.</p>
        </div>
      </div>
      <div className="step">
        <div className="step-number"><Smartphone size={32} /></div>
        <div className="step-content">
          <h3>Access</h3>
          <p>Get a digital parking pass or QR code.</p>
        </div>
      </div>
      <div className="step">
        <div className="step-number"><Car size={32} /></div>
        <div className="step-content">
          <h3>Park</h3>
          <p>Arrive and park securely with peace of mind.</p>
        </div>
      </div>
    </div>
  </section>
);

const ExperienceSections = () => (
  <section className="experiences">
    <div className="experience-row">
      <div className="experience-content">
        <h2>For Residents</h2>
        <ul className="checklist">
          <li><Check size={20}/> Find Parking instantly</li>
          <li><Check size={20}/> View interactive map</li>
          <li><Check size={20}/> Reserve spots for guests</li>
          <li><Check size={20}/> Invite visitors with QR passes</li>
          <li><Check size={20}/> Manage registered vehicles</li>
        </ul>
      </div>
      <div className="experience-visual resident-visual">
        <img 
          src="/images/ui_matched_parking.jpg" 
          alt="Intelligent Smart Parking App" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
        />
      </div>
    </div>

    <div className="experience-row reverse">
      <div className="experience-content">
        <h2>For Security & Gate</h2>
        <ul className="checklist">
          <li><Check size={20}/> Scan QR visitor passes</li>
          <li><Check size={20}/> Verify active guests</li>
          <li><Check size={20}/> Fast check-in & check-out</li>
          <li><Check size={20}/> Monitor active visitors</li>
        </ul>
      </div>
      <div className="experience-visual security-visual">
         <div className="mockup-dashboard">
           <div className="mockup-nav"><Shield size={20} /> Security Console</div>
           <div className="mockup-scan-window" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <QrCode size={120} color="var(--color-primary)" opacity={0.3} style={{ position: 'absolute' }} />
             <div className="scan-line"></div>
             <p style={{ zIndex: 1, marginTop: '140px' }}>Awaiting Scan...</p>
           </div>
           <div className="mockup-log">
             <div className="log-item success">Approved: Toyota Camry (Visitor)</div>
             <div className="log-item success">Approved: Resident (Spot 12)</div>
           </div>
         </div>
      </div>
    </div>

    <div className="experience-row">
      <div className="experience-content">
        <h2>For Administration</h2>
        <ul className="checklist">
          <li><Check size={20}/> Global parking overview</li>
          <li><Check size={20}/> Occupancy & analytics tracking</li>
          <li><Check size={20}/> Manage users & reservations</li>
          <li><Check size={20}/> Resolve parking issues</li>
        </ul>
      </div>
      <div className="experience-visual admin-visual">
         <div className="mockup-dashboard">
           <div className="mockup-nav"><BarChart size={20} /> Admin Analytics</div>
           <div className="mockup-stats">
             <div className="stat-box"><h4 style={{color: 'var(--color-text)', marginBottom: '0.25rem', fontSize: '1.5rem'}}>95%</h4><p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0}}>Occupancy</p></div>
             <div className="stat-box"><h4 style={{color: 'var(--color-text)', marginBottom: '0.25rem', fontSize: '1.5rem'}}>12</h4><p style={{color: 'var(--color-text-muted)', fontSize: '0.875rem', margin: 0}}>Active Guests</p></div>
           </div>
           <div className="mockup-chart">
              <div className="bar" style={{height: '60%'}}></div>
              <div className="bar" style={{height: '80%'}}></div>
              <div className="bar" style={{height: '100%', background: 'var(--color-primary)'}}></div>
              <div className="bar" style={{height: '40%'}}></div>
           </div>
         </div>
      </div>
    </div>
  </section>
);

const SmartRecommendations = () => (
  <section className="smart-recs">
    <div className="smart-recs-container">
      <h2>Intelligent Recommendations</h2>
      <p>Find a spot that perfectly fits your vehicle, preferred location, and requested time.</p>
      <div className="recs-visual">
        <div className="rec-card">
          <h4>Match: 95%</h4>
          <ul>
            <li>✓ Vehicle compatible</li>
            <li>✓ Preferred zone</li>
            <li>✓ Available for requested duration</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
);

const CTA = () => (
  <section className="final-cta">
    <h2>Make parking simpler for your community.</h2>
    <p>Join modern residential communities using ParkNexus.</p>
    <div className="cta-actions">
      <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
      <Link to="/login" className="btn btn-outline btn-lg">Login to Dashboard</Link>
    </div>
  </section>
);

const LandingPage = () => {
  return (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -1,
          opacity: 0.4
        }}
      >
        <source src="/carparkingvideo.mp4" type="video/mp4" />
      </video>
      <div className="landing-page-v2" style={{ position: 'relative', zIndex: 1 }}>
        <main>
          <Hero />
          <TrustStrip />
          <CoreFeatures />
          <HowItWorks />
          <ExperienceSections />
          <SmartRecommendations />
          <CTA />
        </main>
      </div>
    </>
  );
};

export default LandingPage;
