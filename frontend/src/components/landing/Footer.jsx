import React from 'react';
import { Car } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <Car size={24} className="brand-icon" />
              <span className="brand-name">ParkNexus</span>
            </div>
            <p className="footer-desc text-muted">
              Intelligent parking management for modern communities.
            </p>
          </div>
          
          <div className="footer-links">
            <h4 className="footer-heading">Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
            </ul>
          </div>
          
          <div className="footer-links">
            <h4 className="footer-heading">Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="text-muted">&copy; 2026 ParkNexus. All rights reserved.</p>
          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.7 }}>
            This work is based on <a href="https://sketchfab.com/3d-models/mclaren-p1-gtr-2015-187bdc110d16417e8a02e71af4ebd8d8" target="_blank" rel="noreferrer">"McLaren P1 GTR 2015"</a> by <a href="https://sketchfab.com/h.e.l.l.o_" target="_blank" rel="noreferrer">LC Design ⓥⓘⓟ</a> licensed under <a href="http://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC-BY-4.0</a>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
