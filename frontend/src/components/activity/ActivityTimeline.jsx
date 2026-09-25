import React from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import './ActivityTimeline.css';

const ActivityTimeline = ({ activities, role }) => {
  const navigate = useNavigate();

  if (!activities || activities.length === 0) {
    return (
      <div className="activity-empty-state">
        <p>No activity found for this period.</p>
      </div>
    );
  }

  const navigateToDetails = (event) => {
    if (role === 'resident') {
      if (event.type === 'reservation') navigate(`/reservations`);
      if (event.type === 'visitor' || event.type === 'visitorPass') navigate(`/visitors`);
      if (event.type === 'parkingShare') navigate(`/shared-parking`);
      if (event.type === 'notification') navigate(`/`); // Handled by standard layout or separate page
    } else if (role === 'security') {
      if (event.type === 'visitor') navigate(`/security/verify`);
      if (event.type === 'gateEntry') navigate(`/security/history`);
    } else if (role === 'admin') {
      if (event.type === 'reservation') navigate(`/admin/parking`);
      if (event.type === 'visitor' || event.type === 'gateEntry') navigate(`/admin/logs`);
      if (event.type === 'activityLog') navigate(`/admin/logs`);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'entered':
      case 'read':
      case 'logged':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      case 'pending':
      case 'unread':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      case 'cancelled':
      case 'denied':
      case 'expired':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      case 'completed':
      case 'exited':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
      default:
        return { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'reservation': return '📅';
      case 'visitor': return '👤';
      case 'visitorPass': return '🎟️';
      case 'gateEntry': return '🚧';
      case 'parkingShare': return '🤝';
      case 'notification': return '🔔';
      case 'activityLog': return '📝';
      default: return '📌';
    }
  };

  // Group by date
  const grouped = activities.reduce((acc, curr) => {
    const d = new Date(curr.timestamp);
    let key = format(d, 'MMM d, yyyy');
    if (isToday(d)) key = 'Today';
    else if (isYesterday(d)) key = 'Yesterday';
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});

  return (
    <div className="activity-timeline">
      {Object.entries(grouped).map(([dateLabel, items]) => (
        <div key={dateLabel} className="timeline-group">
          <div className="timeline-date-label">{dateLabel}</div>
          <div className="timeline-items">
            {items.map((item) => {
              const statusStyle = getStatusColor(item.status);
              return (
                <div key={`${item.type}-${item.id}`} className="timeline-item" onClick={() => navigateToDetails(item)}>
                  <div className="timeline-icon">{getTypeIcon(item.type)}</div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-title">{item.title}</span>
                      <span className="timeline-time">{format(new Date(item.timestamp), 'h:mm a')}</span>
                    </div>
                    <div className="timeline-desc">{item.description}</div>
                    <div className="timeline-meta">
                      <span className="timeline-type-badge">{item.type.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {item.status && (
                        <span className="timeline-status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
