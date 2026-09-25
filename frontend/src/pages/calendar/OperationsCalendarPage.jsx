import React from 'react';
import OperationsCalendar from '../../components/calendar/OperationsCalendar';
import useAuth from '../../hooks/useAuth';

const OperationsCalendarPage = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const roleConfigs = {
    resident: {
      title: 'My Calendar',
      description: 'Your upcoming reservations, visitor passes, and parking activity.',
      defaultView: 'week',
      allowedTypes: ['reservation', 'visitor', 'visitorPass', 'parkingShare']
    },
    security: {
      title: 'Security Operations Calendar',
      description: "Today's expected visitors, gate activity, and active passes.",
      defaultView: 'day',
      allowedTypes: ['visitor', 'gateEntry']
    },
    admin: {
      title: 'System Operations Calendar',
      description: 'Overview of all system activity, reservations, and visits.',
      defaultView: 'week',
      allowedTypes: ['reservation', 'visitor', 'gateEntry', 'parkingShare']
    }
  };

  const config = roleConfigs[user.role] || roleConfigs.resident;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{config.title}</h1>
        <p>{config.description}</p>
      </div>

      <OperationsCalendar 
        defaultView={config.defaultView} 
        allowedTypes={config.allowedTypes}
        role={user.role} 
      />
    </div>
  );
};

export default OperationsCalendarPage;
