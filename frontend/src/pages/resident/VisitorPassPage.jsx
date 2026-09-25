import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import visitorPassService from '../../services/visitorPassService';
import { QRCodeSVG } from 'qrcode.react';

const VisitorPassPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pass, setPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPass = async () => {
      try {
        const response = await import('../../services/api').then(m => m.default.get(`/visitors/passes/${id}`));
        setPass(response.data.data || response.data);
      } catch (err) {
        setError('Failed to load pass.');
      } finally {
        setLoading(false);
      }
    };
    fetchPass();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this pass?')) return;
    try {
      await import('../../services/api').then(m => m.default.put(`/visitors/passes/${id}/cancel`));
      navigate('/visitors');
    } catch (err) {
      alert('Failed to cancel');
    }
  };

  if (loading) return <div className="page-container">Loading pass...</div>;
  if (error || !pass) return <div className="page-container error-state">{error || 'Pass not found'}</div>;

  const isExpired = pass.status === 'expired' || new Date() > new Date(pass.validUntil);
  const isCancelled = pass.status === 'cancelled';
  const isActive = pass.status === 'active' && !isExpired;

  return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%', color: '#1f2937' }}>
        
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #e5e7eb', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#3b82f6' }}>ParkNexus</h2>
          <h3 style={{ margin: 0, color: '#4b5563' }}>Visitor Access Pass</h3>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Visitor</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{pass.visitor.fullName}</div>
          </div>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Date</div>
            <div style={{ fontWeight: '500' }}>{new Date(pass.validFrom).toLocaleDateString()}</div>
          </div>

          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Time</div>
            <div style={{ fontWeight: '500' }}>
              {new Date(pass.validFrom).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(pass.validUntil).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>

          {pass.visitor.vehicle && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>Vehicle</div>
              <div style={{ fontWeight: '500' }}>{pass.visitor.vehicle.registrationNumber}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', padding: '1.5rem', background: isActive ? '#f8fafc' : '#fee2e2', borderRadius: '8px', marginBottom: '1.5rem', position: 'relative' }}>
          {!isActive && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
              <h2 style={{ color: '#ef4444', transform: 'rotate(-15deg)', border: '4px solid #ef4444', padding: '0.5rem 1rem', borderRadius: '8px', textTransform: 'uppercase', letterSpacing: '2px' }}>
                {isExpired ? 'Expired' : 'Cancelled'}
              </h2>
            </div>
          )}
          <QRCodeSVG value={pass.qrPayload} size={200} level="H" includeMargin={true} />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Status</div>
          <span style={{ 
            background: isActive ? '#dcfce7' : '#fee2e2', 
            color: isActive ? '#166534' : '#991b1b', 
            padding: '4px 12px', 
            borderRadius: '9999px', 
            fontSize: '0.9rem', 
            fontWeight: 'bold', 
            textTransform: 'uppercase' 
          }}>
            {isActive ? 'ACTIVE' : pass.status}
          </span>
        </div>

        {isActive && (
          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
            <button style={{ flex: 1, padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Share Pass
            </button>
            <button onClick={handleCancel} style={{ flex: 1, padding: '0.75rem', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              Cancel Pass
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorPassPage;
