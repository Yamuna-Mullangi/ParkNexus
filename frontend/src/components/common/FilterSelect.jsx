import React from 'react';

const FilterSelect = ({ name, value, options, onChange, defaultLabel = "All" }) => {
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
      <option value="">{defaultLabel}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default FilterSelect;
