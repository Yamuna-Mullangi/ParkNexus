import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content animate-fade-in">
          <h1 className="hero-title">Parking, Made Intelligent.</h1>
          <p className="hero-subtitle">
            ParkNexus brings parking availability, reservations, visitor access, and smart parking management into one simple platform for modern communities.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-large">Find Parking</button>
            <button className="btn btn-outline btn-large">Explore ParkNexus</button>
          </div>
        </div>
        
        <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="parking-mockup">
            <div className="mockup-header">
              <span className="mockup-title">LIVE PARKING</span>
            </div>
            <div className="mockup-grid">
              <div className="parking-spot available">
                <div className="spot-indicator"></div>
                <span className="spot-id">A01</span>
              </div>
              <div className="parking-spot occupied">
                <div className="spot-indicator"></div>
                <span className="spot-id">A02</span>
              </div>
              <div className="parking-spot available">
                <div className="spot-indicator"></div>
                <span className="spot-id">A03</span>
              </div>
              <div className="parking-spot available">
                <div className="spot-indicator"></div>
                <span className="spot-id">A04</span>
              </div>
              <div className="parking-spot reserved">
                <div className="spot-indicator"></div>
                <span className="spot-id">A05</span>
              </div>
              <div className="parking-spot available">
                <div className="spot-indicator"></div>
                <span className="spot-id">A06</span>
              </div>
            </div>
            <div className="mockup-legend">
              <div className="legend-item"><span className="legend-dot available"></span> Available</div>
              <div className="legend-item"><span className="legend-dot occupied"></span> Occupied</div>
              <div className="legend-item"><span className="legend-dot reserved"></span> Reserved</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
