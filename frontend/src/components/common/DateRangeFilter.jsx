import React from 'react';

const DateRangeFilter = ({ name = "dateRange", value, onChange }) => {
  const options = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'next7Days', label: 'Next 7 Days' },
    { value: 'past7Days', label: 'Past 7 Days' },
    { value: 'thisMonth', label: 'This Month' }
  ];

  return (
    <select 
      name={name} 
      value={value} 
      onChange={onChange}
      style={{ 
        padding: '0.75rem', 
        borderRadius: '4px', 
        border: '1px solid var(--border-color)', 
        background: 'var(--bg-secondary)', 
        color: 'var(--text-primary)',
        minWidth: '140px'
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default DateRangeFilter;
