import React from 'react';

const VehicleCard = ({ vehicle, onEdit, onSetPrimary, onDeactivate }) => {
  const getIcon = (type) => {
    switch(type) {
      case 'car': return '🚗';
      case 'motorcycle': return '🏍️';
      case 'scooter': return '🛵';
      case 'bicycle': return '🚲';
      default: return '🚙';
    }
  };

  return (
    <div className="vehicle-card" style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', border: vehicle.isPrimary ? '2px solid #3b82f6' : '1px solid var(--border-color)' }}>
      {vehicle.isPrimary && (
        <span style={{ position: 'absolute', top: '-10px', right: '10px', background: '#3b82f6', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
          PRIMARY
        </span>
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ fontSize: '2rem', background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '8px' }}>
          {getIcon(vehicle.vehicleType)}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.25rem', letterSpacing: '1px' }}>{vehicle.registrationNumber}</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{vehicle.make} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <div><strong>Color:</strong> {vehicle.color}</div>
        <div><strong>Type:</strong> <span style={{ textTransform: 'capitalize' }}>{vehicle.vehicleType}</span></div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <button onClick={() => onEdit(vehicle)} style={{ flex: 1, padding: '0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
          Edit
        </button>
        {!vehicle.isPrimary && (
          <button onClick={() => onSetPrimary(vehicle._id)} style={{ flex: 1, padding: '0.5rem', background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
            Make Primary
          </button>
        )}
        <button onClick={() => onDeactivate(vehicle)} style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
          Deactivate
        </button>
      </div>
    </div>
  );
};

export default VehicleCard;
