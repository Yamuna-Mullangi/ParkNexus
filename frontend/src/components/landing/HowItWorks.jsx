import React from 'react';
import './HowItWorks.css';

const steps = [
  {
    num: '01',
    title: 'Find',
    desc: 'View available parking spaces in your community.'
  },
  {
    num: '02',
    title: 'Choose',
    desc: 'Get a suitable parking recommendation based on your needs.'
  },
  {
    num: '03',
    title: 'Reserve',
    desc: 'Request or reserve a parking space with a single click.'
  },
  {
    num: '04',
    title: 'Park',
    desc: 'Use your authorized parking space securely and simply.'
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section how-it-works">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Four simple steps to a hassle-free parking experience.
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div className="step-card" key={index}>
              <div className="step-number">{step.num}</div>
              <div className="step-content">
                <h3 className="step-title">{step.title}</h3>
                <p className="step-desc text-muted">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
