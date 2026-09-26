import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gateService from '../../services/gateService';
import { useSocket } from '../../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';

const SecurityDashboardPage = () => {
  const [todayEntries, setTodayEntries] = useState([]);
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [capacity, setCapacity] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { registerListener, unregisterListener } = useSocket();

  const fetchDashboardData = async () => {
    try {
      const [todayData, activeData, capacityData] = await Promise.all([
        gateService.getTodayGateEntries(),
        gateService.getActiveVisitors(),
        import('../../services/parkingCapacityService').then(m => m.default.getParkingCapacity())
      ]);
      
      setTodayEntries(todayData || []);
      setActiveVisitors(activeData || []);
      setCapacity(capacityData?.data || null);
    } catch (err) {
      console.error('Failed to load security dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    const handleGateUpdated = () => {
      fetchDashboardData();
    };
    
    registerListener('gate:updated', handleGateUpdated);
    
    return () => {
      unregisterListener('gate:updated', handleGateUpdated);
    };
  }, [registerListener, unregisterListener]);

  const checkedInToday = todayEntries.filter(e => e.status === 'checked_in' || e.status === 'checked_out').length;
  const checkedOutToday = todayEntries.filter(e => e.status === 'checked_out').length;
  const deniedToday = todayEntries.filter(e => e.status === 'denied').length;

  const now = new Date();
  const overdueVisitors = activeVisitors.filter(v => new Date(v.expectedExitTime) < now);
  const activeCount = activeVisitors.length;

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1>Gate Operations Overview</h1>
        <p>Real-time view of today's gate activity, active visitors, and pending actions.</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div style={{ textAlign: "center" }} className="glass-panel">
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>{activeCount}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Active Visitors</div>
        </div>
        {capacity && capacity.visitorCapacity > 0 && (
          <div style={{ textAlign: "center" }} className="glass-panel">
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: capacity.visitorAvailable > 0 ? '#10b981' : '#ef4444', marginBottom: '0.5rem' }}>
              {capacity.visitorAvailable}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Visitor Parking Available</div>
          </div>
        )}
        <div style={{ textAlign: "center" }} className="glass-panel">
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>{checkedInToday}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Today's Entries</div>
        </div>
        <div style={{ textAlign: "center" }} className="glass-panel">
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.5rem' }}>{checkedOutToday}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Today's Exits</div>
        </div>
        <div style={{ textAlign: "center" }} className="glass-panel">
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: overdueVisitors.length > 0 ? '#f59e0b' : 'var(--text-primary)', marginBottom: '0.5rem' }}>{overdueVisitors.length}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Pending / Overdue</div>
        </div>
        <div style={{ textAlign: "center" }} className="glass-panel">
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '0.5rem' }}>{deniedToday}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>Denied Entries</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Quick Actions & Overdue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-panel">
            <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.25rem' }}>Primary Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link to="/security/verify" className="btn btn-primary" style={{ padding: '1rem', textAlign: 'center', fontSize: '1rem' }}>
                Verify Visitor Pass
              </Link>
              <Link to="/security/active" className="btn btn-outline" style={{ padding: '1rem', textAlign: 'center' }}>
                Active Visitors
              </Link>
              <Link to="/security/history" className="btn btn-outline" style={{ padding: '1rem', textAlign: 'center' }}>
                Gate History
              </Link>
            </div>
          </div>

          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>Attention Required</h2>
            </div>
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : overdueVisitors.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                No overdue visitors.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {overdueVisitors.slice(0, 3).map(visitor => (
                  <div key={visitor._id} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '4px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{visitor.visitor?.fullName}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Resident: {visitor.resident?.name}
                        </span>
                      </div>
                      <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        OVERDUE
                      </span>
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      Expected Exit: {new Date(visitor.expectedExitTime).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {overdueVisitors.length > 3 && (
                  <Link to="/security/active" style={{ textAlign: 'center', color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    View {overdueVisitors.length - 3} more
                  </Link>
                )}
              </div>
            )}
          </div>
          
        </div>

        {/* Recent Activity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div style={{ height: "100%" }} className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>Recent Gate Activity</h2>
              <Link to="/security/history" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>View All</Link>
            </div>
            
            {loading ? (
              <div className="loading-state">Loading activity...</div>
            ) : todayEntries.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                No gate activity recorded today.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {todayEntries.slice(0, 7).map(entry => {
                  const getStatusColor = (status) => {
                    if (status === 'denied') return '#ef4444';
                    if (status === 'checked_in') return '#10b981';
                    if (status === 'checked_out') return '#8b5cf6';
                    return 'var(--border-color)';
                  };
                  
                  return (
                    <div key={entry._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '4px', borderLeft: `4px solid ${getStatusColor(entry.status)}` }}>
                      <div>
                        <strong style={{ color: 'var(--text-primary)' }}>{entry.visitor?.fullName || 'Unknown'}</strong>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {entry.status === 'checked_out' ? entry.exitGate || 'Main Gate' : entry.entryGate || 'Main Gate'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: getStatusColor(entry.status) }}>
                          {entry.status.toUpperCase().replace('_', ' ')}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {formatDistanceToNow(new Date(entry.status === 'checked_out' ? (entry.actualExitTime || entry.updatedAt) : entry.entryTime), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboardPage;

