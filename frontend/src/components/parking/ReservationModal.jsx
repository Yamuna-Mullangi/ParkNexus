import React from 'react';
import ReservationForm from '../reservations/ReservationForm';

const ReservationModal = ({ spot, onClose, onSuccess, prefilledData }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--bg-card)',
        padding: '2rem',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Complete Reservation</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-primary)' }}>&times;</button>
        </div>
        
        <ReservationForm 
          spot={spot} 
          onSuccess={onSuccess} 
          onCancel={onClose} 
          prefilledData={{
            startDate: prefilledData?.startTime?.split('T')[0] || '',
            startTime: prefilledData?.startTime?.split('T')[1] || '',
            endDate: prefilledData?.endTime?.split('T')[0] || '',
            endTime: prefilledData?.endTime?.split('T')[1] || '',
            vehicle: prefilledData?.vehicle || ''
          }}
        />
      </div>
    </div>
  );
};

export default ReservationModal;
