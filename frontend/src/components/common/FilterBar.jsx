import React from 'react';

const FilterBar = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '1rem', 
      flexWrap: 'wrap', 
      marginBottom: '1.5rem', 
      background: 'var(--bg-card)', 
      padding: '1.5rem', 
      borderRadius: '8px', 
      border: '1px solid var(--border-color)',
      alignItems: 'center'
    }}>
      {children}
    </div>
  );
};

export default FilterBar;
