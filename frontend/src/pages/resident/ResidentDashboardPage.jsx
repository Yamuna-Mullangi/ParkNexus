import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import parkingService from '../../services/parkingService';
import reservationService from '../../services/reservationService';
import visitorService from '../../services/visitorService';
import vehicleService from '../../services/vehicleService';
import notificationService from '../../services/notificationService';
import preferenceService from '../../services/preferenceService';
import parkingCapacityService from '../../services/parkingCapacityService';
import { useSocket } from '../../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';

const ResidentDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    parkingSpot: null,
    reservations: [],
    visitors: [],
    vehicles: [],
    notifications: [],
    capacity: null,
    favorites: [],
    recentViews: []
  });
  
  const { registerListener, unregisterListener } = useSocket();

  const [preferences, setPreferences] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const { default: favoriteParkingService } = await import('../../services/favoriteParkingService');
      const { default: recentParkingService } = await import('../../services/recentParkingService');

      const { default: activityHistoryService } = await import('../../services/activityHistoryService');

      const [
        parkingSpotRes,
        reservationsRes,
        visitorsRes,
        vehiclesRes,
        notificationsRes,
        prefsRes,
        capacityRes,
        favsRes,
        recentRes,
        historyRes
      ] = await Promise.allSettled([
        parkingService.getMyParking(),
        reservationService.getMyReservations({ limit: 3, sortBy: 'startTime', sortOrder: 'asc', status: 'approved' }), // Upcoming
        visitorService.getMyVisitors({ limit: 3, sortBy: 'expectedArrival', sortOrder: 'asc', status: 'upcoming' }),
        vehicleService.getMyVehicles(),
        notificationService.getNotifications({ limit: 3 }),
        preferenceService.getPreferences(),
        parkingCapacityService.getParkingCapacity(),
        favoriteParkingService.getFavorites(),
        recentParkingService.getRecentViews(5),
        activityHistoryService.getActivityHistory({ limit: 3 })
      ]);

      setDashboardData({
        parkingSpot: parkingSpotRes.status === 'fulfilled' ? parkingSpotRes.value : null,
        reservations: reservationsRes.status === 'fulfilled' ? (reservationsRes.value.data || []) : [],
        visitors: visitorsRes.status === 'fulfilled' ? (visitorsRes.value.data || []) : [],
        vehicles: vehiclesRes.status === 'fulfilled' ? (vehiclesRes.value || []) : [],
        notifications: notificationsRes.status === 'fulfilled' ? (notificationsRes.value.data || []) : [],
        capacity: capacityRes.status === 'fulfilled' ? (capacityRes.value.data || null) : null,
        favorites: favsRes.status === 'fulfilled' ? (favsRes.value.data || []) : [],
        recentViews: recentRes.status === 'fulfilled' ? (recentRes.value.data || []) : [],
        recentHistory: historyRes.status === 'fulfilled' ? (historyRes.value.data || []) : []
      });

      if (prefsRes.status === 'fulfilled') {
        setPreferences(prefsRes.value);
      }
      
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    const handleRefresh = () => fetchDashboardData();
    
    registerListener('parking:updated', handleRefresh);
    registerListener('reservation:updated', handleRefresh);
    registerListener('visitor:updated', handleRefresh);
    registerListener('notification:new', handleRefresh);
    
    return () => {
      unregisterListener('parking:updated', handleRefresh);
      unregisterListener('reservation:updated', handleRefresh);
      unregisterListener('visitor:updated', handleRefresh);
      unregisterListener('notification:new', handleRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerListener, unregisterListener]);

  const primaryVehicle = dashboardData.vehicles.find(v => v.isPrimary) || dashboardData.vehicles[0];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Your Parking Overview</h1>
        <p>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name.split(' ')[0]}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Parking Spotlight */}
        {preferences?.dashboardPreferences?.showParkingOverview !== false && (
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>My Parking</h3>
            {loading ? (
              <div className="loading-state" style={{ minHeight: '80px', padding: 0 }}>Loading...</div>
            ) : dashboardData.parkingSpot ? (
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {dashboardData.parkingSpot.spotNumber}
                </div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Zone {dashboardData.parkingSpot.block} • {dashboardData.parkingSpot.floor} Floor
                </div>
                <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                  Status: {dashboardData.parkingSpot.status.charAt(0).toUpperCase() + dashboardData.parkingSpot.status.slice(1)}
                </div>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No parking spot assigned.</p>
                <Link to="/parking-map" className="btn btn-primary" style={{ display: 'block', textAlign: 'center' }}>Find Available Parking</Link>
              </div>
            )}
          </div>
        )}

        {/* Global Capacity Spotlight */}
        {dashboardData.capacity && (
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>Parking Availability</h3>
            {loading ? (
              <div className="loading-state" style={{ minHeight: '80px', padding: 0 }}>Loading...</div>
            ) : (
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: dashboardData.capacity.available > 5 ? '#10b981' : '#ef4444', marginBottom: '0.5rem' }}>
                  {dashboardData.capacity.available}
                </div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  spaces currently available
                </div>
                <Link to="/parking-map" className="btn btn-outline" style={{ display: 'block', textAlign: 'center' }}>View Map</Link>
              </div>
            )}
          </div>
        )}

        {/* Primary Vehicle Spotlight */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>Primary Vehicle</h3>
          {loading ? (
            <div className="loading-state" style={{ minHeight: '80px', padding: 0 }}>Loading...</div>
          ) : primaryVehicle ? (
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {primaryVehicle.make} {primaryVehicle.model}
              </div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '1px', background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', display: 'inline-block', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                {primaryVehicle.licensePlate}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>
                Color: {primaryVehicle.color}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No vehicle added yet.</p>
              <Link to="/vehicles" className="btn btn-outline" style={{ display: 'block', textAlign: 'center' }}>Add Vehicle</Link>
            </div>
          )}
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        
        {/* Reservations Preview */}
        {preferences?.dashboardPreferences?.showUpcomingReservations !== false && (
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Upcoming Reservations</h3>
              <Link to="/reservations" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>View All</Link>
            </div>
            
            {loading ? (
              <div className="loading-state" style={{ padding: '2rem 0' }}>Loading...</div>
            ) : dashboardData.reservations.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                No upcoming reservations.
                <br/><br/>
                <Link to="/parking-map" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Find Parking</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dashboardData.reservations.map(res => (
                  <div key={res._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>Spot {res.parkingSpot?.spotNumber}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {new Date(res.startTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      APPROVED
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Visitors Preview */}
        {preferences?.dashboardPreferences?.showVisitorSection !== false && (
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Expected Visitors</h3>
              <Link to="/visitors" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>Manage Visitors</Link>
            </div>

            {loading ? (
              <div className="loading-state" style={{ padding: '2rem 0' }}>Loading...</div>
            ) : dashboardData.visitors.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                No upcoming visitors.
                <br/><br/>
                <Link to="/visitors" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Add Visitor</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dashboardData.visitors.map(visitor => (
                  <div key={visitor._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)' }}>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{visitor.fullName}</strong>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Exp: {new Date(visitor.expectedArrival).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      UPCOMING
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Preview */}
        {preferences?.dashboardPreferences?.showNotificationPreview !== false && (
          <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Recent Notifications</h3>
              <Link to="/notifications" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>View All</Link>
            </div>

            {loading ? (
              <div className="loading-state" style={{ padding: '2rem 0' }}>Loading...</div>
            ) : dashboardData.notifications.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                No recent notifications.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {dashboardData.notifications.map(notif => (
                  <div key={notif._id} style={{ padding: '1rem', borderLeft: `3px solid ${notif.isRead ? 'var(--border-color)' : '#3b82f6'}`, borderRadius: '4px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: notif.isRead ? 'normal' : 'bold', marginBottom: '0.25rem' }}>{notif.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Activity Preview */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Recent Activity</h3>
            <Link to="/resident/history" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>View History</Link>
          </div>

          {loading ? (
            <div className="loading-state" style={{ padding: '2rem 0' }}>Loading...</div>
          ) : dashboardData.recentHistory?.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
              No recent activity.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dashboardData.recentHistory?.map(activity => (
                <div key={`${activity.type}-${activity.id}`} style={{ padding: '1rem', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{activity.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {activity.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access (Favorites / Recents) Preview */}
        <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Saved & Recent Parking</h3>
            <Link to="/resident/favorites" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>View All</Link>
          </div>
          
          {loading ? (
            <div className="loading-state" style={{ padding: '2rem 0' }}>Loading...</div>
          ) : dashboardData.favorites.length === 0 && dashboardData.recentViews.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
              No saved or recently viewed parking locations.
              <br/><br/>
              <Link to="/parking-map" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>Explore Map</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {dashboardData.favorites.slice(0, 3).map(fav => (
                <Link key={fav._id} to={`/resident/parking?search=${fav.parkingSpot?.spotNumber}`} style={{ textDecoration: 'none', minWidth: '150px', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{fav.parkingSpot?.spotNumber}</strong>
                    <span style={{ color: '#f59e0b' }}>★</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{fav.parkingSpot?.block}</span>
                </Link>
              ))}
              {dashboardData.recentViews.slice(0, 3).filter(r => !dashboardData.favorites.find(f => f.parkingSpot?._id === r.parkingSpot?._id)).map(recent => (
                <Link key={recent._id} to={`/resident/parking?search=${recent.parkingSpot?.spotNumber}`} style={{ textDecoration: 'none', minWidth: '150px', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{recent.parkingSpot?.spotNumber}</strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Recently Viewed</span>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResidentDashboardPage;
