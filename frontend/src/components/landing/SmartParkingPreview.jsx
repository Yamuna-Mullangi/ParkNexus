import React from 'react';
import { Search, CheckCircle, Navigation, ShieldCheck } from 'lucide-react';
import './SmartParkingPreview.css';

const SmartParkingPreview = () => {
  return (
    <section className="section smart-preview">
      <div className="container">
        <div className="preview-container">
          <div className="preview-content">
            <h2 className="preview-title">Intelligent Workflow</h2>
            <p className="preview-desc text-muted">
              Experience a seamless parking process from discovery to authorization. Our smart platform ensures minimal friction.
            </p>
          </div>
          
          <div className="workflow-visual">
            <div className="workflow-step">
              <div className="step-icon-wrapper"><Search size={24} /></div>
              <span className="step-label">FIND</span>
            </div>
            
            <div className="workflow-connector"></div>
            
            <div className="workflow-step">
              <div className="step-icon-wrapper active"><CheckCircle size={24} /></div>
              <span className="step-label">MATCH</span>
            </div>
            
            <div className="workflow-connector"></div>
            
            <div className="workflow-step">
              <div className="step-icon-wrapper"><Navigation size={24} /></div>
              <span className="step-label">RESERVE</span>
            </div>
            
            <div className="workflow-connector"></div>
            
            <div className="workflow-step">
              <div className="step-icon-wrapper"><ShieldCheck size={24} /></div>
              <span className="step-label">PARK</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartParkingPreview;
