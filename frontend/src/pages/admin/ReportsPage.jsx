import React, { useState } from 'react';
import reportService from '../../services/reportService';

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7');
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });

  const handleDownload = async (type) => {
    try {
      setLoading(true);
      setError(null);
      
      let start, end;
      if (dateRange === 'custom') {
        if (!customRange.startDate || !customRange.endDate) {
          throw new Error('Please select both start and end dates');
        }
        if (new Date(customRange.startDate) > new Date(customRange.endDate)) {
          throw new Error('Start date must be before end date');
        }
        start = customRange.startDate;
        end = customRange.endDate;
      } else if (dateRange !== 'all') {
        const d = new Date();
        d.setDate(d.getDate() - parseInt(dateRange, 10));
        start = d.toISOString().split('T')[0];
        end = new Date().toISOString().split('T')[0];
      }

      await reportService.downloadReport(type, start, end);
    } catch (err) {
      setError(err.message || 'Failed to download report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { type: 'parking', title: 'Parking Utilization', description: 'Snapshot of all parking spaces, zones, and their current status.' },
    { type: 'reservations', title: 'Reservation History', description: 'Detailed log of all parking reservations within the selected timeframe.' },
    { type: 'visitors', title: 'Visitor Log', description: 'List of pre-registered visitors and their statuses.' },
    { type: 'gate', title: 'Gate Activity', description: 'Chronological log of gate entries, exits, and denied attempts.' },
    { type: 'users', title: 'User Directory', description: 'Current list of registered users and their account statuses.' }
  ];

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1>Generate Reports</h1>
        <p>Export operational data as CSV files for external analysis.</p>
      </div>

      <div style={{ marginBottom: "2rem" }} className="glass-panel">
        <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>1. Select Date Range</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', minWidth: '200px' }}
          >
            <option value="0">Today</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="all">All Time</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === 'custom' && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="date" 
                value={customRange.startDate}
                onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })}
                style={{ padding: '0.65rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>to</span>
              <input 
                type="date" 
                value={customRange.endDate}
                onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })}
                style={{ padding: '0.65rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>
          )}
        </div>
      </div>

      {error && <div className="error-state" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {reportTypes.map((report) => (
          <div key={report.type} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }} className="glass-panel">
            <div>
              <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{report.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {report.description}
              </p>
            </div>
            <button 
              onClick={() => handleDownload(report.type)}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              {loading ? 'Processing...' : 'Download CSV'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;

