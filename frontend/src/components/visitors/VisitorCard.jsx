import React from 'react';
import { Link } from 'react-router-dom';

const VisitorCard = ({ visitor, onCancel, onGeneratePass }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return { bg: '#dcfce7', text: '#166534' };
      case 'inside': return { bg: '#fef3c7', text: '#92400e' };
      case 'upcoming': return { bg: '#e0f2fe', text: '#0369a1' };
      case 'completed': return { bg: '#f3f4f6', text: '#374151' };
      case 'cancelled': return { bg: '#fee2e2', text: '#991b1b' };
      case 'expired': return { bg: '#fef3c7', text: '#92400e' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const statusColor = getStatusColor(visitor.status);

  return (
    <div className="visitor-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0' }}>{visitor.fullName}</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{visitor.phone}</p>
        </div>
        <span style={{ background: statusColor.bg, color: statusColor.text, padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
          {visitor.status}
        </span>
      </div>
      
      <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Arrival:</strong> {new Date(visitor.expectedArrival).toLocaleString()}
        </div>
        <div>
          <strong>Departure:</strong> {new Date(visitor.expectedDeparture).toLocaleString()}
        </div>
      </div>
      
      {visitor.vehicle && (
        <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          🚗 Assigned Vehicle: {visitor.vehicle.registrationNumber}
        </div>
      )}
      
      {visitor.vehicleNumber && !visitor.vehicle && (
        <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          🚗 Visitor Vehicle: {visitor.vehicleNumber}
        </div>
      )}

      {visitor.activePass ? (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <Link to={`/visitor-passes/${visitor.activePass._id}`} style={{ display: 'block', textAlign: 'center', background: '#10b981', color: 'white', padding: '0.5rem', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>
            View QR Pass
          </Link>
        </div>
      ) : (
        ['upcoming', 'active'].includes(visitor.status) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <button onClick={() => onGeneratePass(visitor._id)} style={{ flex: 1, background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
              Generate Pass
            </button>
            <button onClick={() => onCancel(visitor._id)} style={{ flex: 1, background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default VisitorCard;
