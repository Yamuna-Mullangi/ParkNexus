import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, subDays, startOfDay, endOfDay } from 'date-fns';
import operationsCalendarService from '../../services/operationsCalendarService';
import { useSocket } from '../../context/SocketContext';
import './OperationsCalendar.css';

const OperationsCalendar = ({ defaultView = 'week', allowedTypes, role }) => {
  const navigate = useNavigate();
  const [view, setView] = useState(defaultView);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { registerListener, unregisterListener } = useSocket();

  const loadEvents = async () => {
    try {
      setLoading(true);
      let startDate, endDate;

      if (view === 'day' || view === 'agenda') {
        startDate = startOfDay(currentDate);
        endDate = endOfDay(view === 'agenda' ? addDays(currentDate, 30) : currentDate);
      } else if (view === 'week') {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
      }

      const res = await operationsCalendarService.getCalendarEvents({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        types: allowedTypes?.join(',')
      });
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to load calendar events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentDate]);

  useEffect(() => {
    const handleUpdate = () => loadEvents();
    registerListener('reservation:updated', handleUpdate);
    registerListener('visitor:updated', handleUpdate);
    registerListener('gate:updated', handleUpdate);
    
    return () => {
      unregisterListener('reservation:updated', handleUpdate);
      unregisterListener('visitor:updated', handleUpdate);
      unregisterListener('gate:updated', handleUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registerListener, unregisterListener]);

  const handlePrev = () => {
    if (view === 'day') setCurrentDate(subDays(currentDate, 1));
    if (view === 'week') setCurrentDate(subDays(currentDate, 7));
    if (view === 'agenda') setCurrentDate(subDays(currentDate, 7));
  };

  const handleNext = () => {
    if (view === 'day') setCurrentDate(addDays(currentDate, 1));
    if (view === 'week') setCurrentDate(addDays(currentDate, 7));
    if (view === 'agenda') setCurrentDate(addDays(currentDate, 7));
  };

  const getEventColor = (type) => {
    switch(type) {
      case 'reservation': return { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#3b82f6' };
      case 'visitor': return { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#10b981' };
      case 'visitorPass': return { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#f59e0b' };
      case 'gateEntry': return { bg: 'rgba(139, 92, 246, 0.1)', border: '#8b5cf6', text: '#8b5cf6' };
      case 'parkingShare': return { bg: 'rgba(236, 72, 153, 0.1)', border: '#ec4899', text: '#ec4899' };
      default: return { bg: 'var(--bg-secondary)', border: 'var(--border-color)', text: 'var(--text-primary)' };
    }
  };

  const navigateToDetails = (event) => {
    if (role === 'resident') {
      if (event.type === 'reservation') navigate(`/reservations`);
      if (event.type === 'visitor' || event.type === 'visitorPass') navigate(`/visitors`);
      if (event.type === 'parkingShare') navigate(`/shared-parking`);
    } else if (role === 'security') {
      if (event.type === 'visitor') navigate(`/security/verify`);
      if (event.type === 'gateEntry') navigate(`/security/history`);
    } else if (role === 'admin') {
      if (event.type === 'reservation') navigate(`/admin/parking`);
      if (event.type === 'visitor' || event.type === 'gateEntry') navigate(`/admin/logs`);
    }
  };

  const renderAgenda = () => {
    if (events.length === 0) return <div className="empty-state">No scheduled events found for this period.</div>;
    return (
      <div className="agenda-view">
        {events.map(ev => {
          const colors = getEventColor(ev.type);
          return (
            <div key={`${ev.id}-${ev.type}`} className="agenda-item" onClick={() => navigateToDetails(ev)} style={{ borderLeftColor: colors.border }}>
              <div className="agenda-time">
                {format(new Date(ev.startTime), 'MMM d, h:mm a')}
              </div>
              <div className="agenda-content">
                <div className="agenda-title" style={{ color: 'var(--text-primary)' }}>{ev.title}</div>
                <div className="agenda-meta">
                  <span style={{ background: colors.bg, color: colors.text, padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{ev.type}</span>
                  <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{ev.status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

    return (
      <div className="week-view">
        {days.map(day => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), day));
          return (
            <div key={day.toISOString()} className="week-day-column">
              <div className={`week-day-header ${isSameDay(day, new Date()) ? 'today' : ''}`}>
                <div className="day-name">{format(day, 'EEE')}</div>
                <div className="day-number">{format(day, 'd')}</div>
              </div>
              <div className="week-day-events">
                {dayEvents.map(ev => {
                  const colors = getEventColor(ev.type);
                  return (
                    <div key={`${ev.id}-${ev.type}`} className="calendar-event-card" style={{ backgroundColor: colors.bg, borderLeft: `3px solid ${colors.border}` }} onClick={() => navigateToDetails(ev)}>
                      <div className="event-time">{format(new Date(ev.startTime), 'h:mm a')}</div>
                      <div className="event-title">{ev.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), currentDate));
    return (
      <div className="day-view">
        <h3 style={{ margin: '0 0 1rem 0' }}>{format(currentDate, 'EEEE, MMMM d, yyyy')}</h3>
        {dayEvents.length === 0 ? (
          <div className="empty-state">No events for today.</div>
        ) : (
          <div className="agenda-view">
            {dayEvents.map(ev => {
              const colors = getEventColor(ev.type);
              return (
                <div key={`${ev.id}-${ev.type}`} className="agenda-item" onClick={() => navigateToDetails(ev)} style={{ borderLeftColor: colors.border }}>
                  <div className="agenda-time">
                    {format(new Date(ev.startTime), 'h:mm a')} - {format(new Date(ev.endTime), 'h:mm a')}
                  </div>
                  <div className="agenda-content">
                    <div className="agenda-title" style={{ color: 'var(--text-primary)' }}>{ev.title}</div>
                    <div className="agenda-meta">
                      <span style={{ background: colors.bg, color: colors.text, padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{ev.type}</span>
                      <span style={{ marginLeft: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{ev.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="operations-calendar">
      <div className="calendar-toolbar">
        <div className="toolbar-nav">
          <button className="btn btn-outline" onClick={handlePrev}>&larr; Prev</button>
          <button className="btn btn-outline" onClick={() => setCurrentDate(new Date())}>Today</button>
          <button className="btn btn-outline" onClick={handleNext}>Next &rarr;</button>
        </div>
        
        <div className="toolbar-title">
          {view === 'day' && format(currentDate, 'MMMM d, yyyy')}
          {view === 'week' && `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`}
          {view === 'agenda' && 'Agenda'}
        </div>

        <div className="toolbar-views">
          <button className={`btn ${view === 'day' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('day')}>Day</button>
          <button className={`btn ${view === 'week' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('week')}>Week</button>
          <button className={`btn ${view === 'agenda' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('agenda')}>Agenda</button>
        </div>
      </div>

      <div className="calendar-content">
        {loading ? (
          <div className="loading-state">Loading calendar...</div>
        ) : (
          <>
            {view === 'agenda' && renderAgenda()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </>
        )}
      </div>
    </div>
  );
};

export default OperationsCalendar;
