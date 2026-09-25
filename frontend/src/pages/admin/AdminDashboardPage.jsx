import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import analyticsService from '../../services/analyticsService';
import activityLogService from '../../services/activityLogService';
import parkingCapacityService from '../../services/parkingCapacityService';
import { useSocket } from '../../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [capacity, setCapacity] = useState(null);
  const [zoneCapacity, setZoneCapacity] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);
  
  const { registerListener, unregisterListener } = useSocket();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, logsRes, capacityRes, zoneCapRes] = await Promise.all([
        analyticsService.getOverview(days),
        activityLogService.getLogs({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        parkingCapacityService.getParkingCapacity(),
        parkingCapacityService.getParkingCapacityBreakdown({ groupBy: 'zone' })
      ]);
      setData(analyticsRes.data);
      setCapacity(capacityRes.data);
      setZoneCapacity(zoneCapRes.data || []);
      // Determine format of logs API res
      setRecentLogs(Array.isArray(logsRes) ? logsRes : (logsRes.data || []));
      setError(null);
    } catch (err) {
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [days]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchDashboardData();
    };

    registerListener('parking:updated', handleRefresh);
    registerListener('reservation:updated', handleRefresh);
    registerListener('gate:updated', handleRefresh);

    return () => {
      unregisterListener('parking:updated', handleRefresh);
      unregisterListener('reservation:updated', handleRefresh);
      unregisterListener('gate:updated', handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerListener, unregisterListener, days]);

  if (loading && !data) return <div className="loading-state">Loading...</div>;
  if (error) return <div className="error-state">{error}</div>;
  if (!data) return null;

  const { overview, utilization, zones, reservations, visitors, gate, trends, users } = data;

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280', '#3b82f6'];
  
  const parkingStatusData = capacity ? [
    { name: 'Available', value: capacity.available },
    { name: 'Occupied', value: capacity.occupied },
    { name: 'Reserved', value: capacity.reserved },
    { name: 'Maintenance', value: capacity.maintenance },
    { name: 'Assigned', value: capacity.assigned },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="page-container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>ParkNexus Operations Overview</h1>
          <p>Real-time analytics and administrative control center.</p>
        </div>
        <select 
          value={days} 
          onChange={(e) => setDays(Number(e.target.value))}
          style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          <option value={0}>Today</option>
          <option value={7}>7 Days</option>
          <option value={30}>30 Days</option>
          <option value={90}>90 Days</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Parking Occupancy</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: capacity?.occupancyRate > 85 ? '#ef4444' : '#3b82f6' }}>
            {capacity?.occupancyRate || 0}%
          </p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
            {capacity?.occupied + capacity?.assigned} / {capacity?.usableCapacity} Usable Spaces
          </p>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Currently Inside</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{visitors?.currentlyInside || 0}</p>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Reservations Today</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{reservations?.today || 0}</p>
        </div>
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}>Total Users</h3>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{users?.total || 0}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Attention Panel */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', height: '100%' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.25rem' }}>Attention Required</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '4px', borderLeft: '4px solid #f59e0b' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Maintenance Spots</span>
              <strong style={{ color: '#f59e0b' }}>{overview?.maintenance || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '4px', borderLeft: '4px solid #ef4444' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Overdue Visitors</span>
              <strong style={{ color: '#ef4444' }}>{visitors?.overdue || 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '4px', borderLeft: '4px solid #6b7280' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Inactive Users</span>
              <strong style={{ color: '#6b7280' }}>{users?.inactive || 0}</strong>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', height: '100%' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.25rem' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Link to="/admin/parking" className="btn btn-outline" style={{ textAlign: 'center', padding: '1rem' }}>Manage Parking</Link>
            <Link to="/admin/users" className="btn btn-outline" style={{ textAlign: 'center', padding: '1rem' }}>Manage Users</Link>
            <Link to="/admin/logs" className="btn btn-outline" style={{ textAlign: 'center', padding: '1rem' }}>Activity Logs</Link>
            <Link to="/admin/reports" className="btn btn-outline" style={{ textAlign: 'center', padding: '1rem' }}>Export Reports</Link>
            <Link to="/admin/settings" className="btn btn-primary" style={{ textAlign: 'center', padding: '1rem', gridColumn: '1 / -1' }}>System Settings</Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Reservation Trends */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>Reservation Trends</h3>
          {!trends || trends.length === 0 ? (
            <p>No activity recorded for this period.</p>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={trends} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="date" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <Line type="monotone" dataKey="reservations" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Reservations" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Status Distribution Chart */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>Parking Status Distribution</h3>
          {parkingStatusData.length === 0 ? (
            <p>Not enough data yet.</p>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={parkingStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                    {parkingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Zone Utilization Chart */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', gridColumn: '1 / -1' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>Zone Utilization</h3>
          {zoneCapacity.length === 0 ? (
            <p>Not enough data yet.</p>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={zoneCapacity} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="group" stroke="var(--text-secondary)" />
                  <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  <Legend />
                  <Bar dataKey="available" stackId="a" fill="#10b981" name="Available" />
                  <Bar dataKey="occupied" stackId="a" fill="#3b82f6" name="Occupied" />
                  <Bar dataKey="assigned" stackId="a" fill="#8b5cf6" name="Assigned" />
                  <Bar dataKey="reserved" stackId="a" fill="#f59e0b" name="Reserved" />
                  <Bar dataKey="maintenance" stackId="a" fill="#6b7280" name="Maintenance" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Breakdown Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>User Demographics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><span style={{ color: 'var(--text-secondary)' }}>Residents:</span> <strong>{users?.residents || 0}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Security:</span> <strong>{users?.security || 0}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Admin:</span> <strong>{users?.admins || 0}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Active:</span> <strong>{users?.active || 0}</strong></div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>Gate Activity (Today)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div><span style={{ color: 'var(--text-secondary)' }}>Entries:</span> <strong>{gate?.entriesToday || 0}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Exits:</span> <strong>{gate?.exitsToday || 0}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Denied:</span> <strong style={{ color: '#ef4444' }}>{gate?.deniedToday || 0}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Total Visitors:</span> <strong>{visitors?.today || 0}</strong></div>
            </div>
          </div>
        </div>

        {/* Recent Activity Logs */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>Recent System Activity</h2>
            <Link to="/admin/logs" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>View All</Link>
          </div>
          
          {recentLogs.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
              No recent activity.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentLogs.map(log => (
                <div key={log._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '0.95rem' }}>
                      {log.action.replace(/_/g, ' ')}
                    </strong>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {log.description}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </div>
                    {log.actor && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>
                        {log.actor.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;
