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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
