import React from 'react';
import './AuthVisual.css';

const AuthVisual = () => {
  return (
    <div className="auth-visual-container">
      <div className="parking-lot">
        <div className="parking-spot">
          <div className="spot-line left"></div>
          <div className="spot-line right"></div>
          <div className="spot-text">VIP-01</div>
        </div>
        
        <div className="animated-car">
          {/* Top-down sleek car SVG */}
          <svg viewBox="0 0 100 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Car Body */}
            <rect x="10" y="10" width="80" height="200" rx="40" fill="rgba(16, 185, 129, 0.1)" stroke="#10B981" strokeWidth="2" />
            <rect x="15" y="15" width="70" height="190" rx="35" fill="rgba(16, 185, 129, 0.2)" />
            
            {/* Windshield */}
            <path d="M20 70 Q 50 50 80 70 L 75 90 L 25 90 Z" fill="rgba(255, 255, 255, 0.3)" />
            {/* Rear Window */}
            <path d="M25 160 L 75 160 L 70 180 Q 50 190 30 180 Z" fill="rgba(255, 255, 255, 0.3)" />
            
            {/* Headlights */}
            <ellipse cx="25" cy="20" rx="8" ry="4" fill="#A7F3D0" filter="url(#glow)" />
            <ellipse cx="75" cy="20" rx="8" ry="4" fill="#A7F3D0" filter="url(#glow)" />
            
            {/* Taillights */}
            <rect x="20" y="195" width="15" height="5" rx="2" fill="#EF4444" filter="url(#glow-red)" />
            <rect x="65" y="195" width="15" height="5" rx="2" fill="#EF4444" filter="url(#glow-red)" />
            
            <defs>
              <filter id="glow" x="-20" y="-20" width="140" height="140" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="4" result="effect1_foregroundBlur" />
              </filter>
              <filter id="glow-red" x="-20" y="-20" width="140" height="140" filterUnits="userSpaceOnUse">
                <feGaussianBlur stdDeviation="3" result="effect1_foregroundBlur" />
              </filter>
            </defs>
          </svg>
          <div className="headlight-beam left"></div>
          <div className="headlight-beam right"></div>
        </div>
      </div>
      <div className="visual-overlay"></div>
    </div>
  );
};

export default AuthVisual;
