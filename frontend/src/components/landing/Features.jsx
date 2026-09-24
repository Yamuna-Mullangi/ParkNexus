import React from 'react';
import { Map, Calendar, Share2, Users, Bell, BarChart3 } from 'lucide-react';
import './Features.css';

const featureData = [
  {
    icon: <Map size={24} />,
    title: 'Smart Parking',
    description: 'Find suitable parking spaces quickly with intelligent availability tracking.'
  },
  {
    icon: <Calendar size={24} />,
    title: 'Easy Reservations',
    description: 'Reserve available spaces in advance without worrying about conflicts.'
  },
  {
    icon: <Share2 size={24} />,
    title: 'Temporary Sharing',
    description: 'Share your unused assigned parking spaces with other residents easily.'
  },
  {
    icon: <Users size={24} />,
    title: 'Visitor Access',
    description: 'Manage visitor parking and temporary access with secure digital passes.'
  },
  {
    icon: <Bell size={24} />,
    title: 'Real-Time Updates',
    description: 'Stay informed about parking availability and reservations instantly.'
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Parking Analytics',
    description: 'Understand parking utilization and peak periods across the community.'
  }
];

const Features = () => {
  return (
    <section id="features" className="section features">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">
            A comprehensive suite of tools designed to optimize residential parking.
          </p>
        </div>

        <div className="features-grid">
          {featureData.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc text-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
