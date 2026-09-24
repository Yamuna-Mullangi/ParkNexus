import React from 'react';
import './CTA.css';

const CTA = () => {
  return (
    <section className="section cta">
      <div className="container">
        <div className="cta-container text-center">
          <h2 className="cta-title">A smarter way to manage parking.</h2>
          <p className="cta-desc">
            Bring simplicity, visibility, and intelligence to residential parking with ParkNexus.
          </p>
          <button className="btn btn-primary btn-large">Get Started</button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
