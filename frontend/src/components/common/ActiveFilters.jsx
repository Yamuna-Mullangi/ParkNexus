import React from 'react';
import { X } from 'lucide-react';

const ActiveFilters = ({ filters, onClearFilter, onClearAll }) => {
  const activeKeys = Object.keys(filters).filter(key => 
    filters[key] && key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder'
  );

  if (activeKeys.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Active Filters:</span>
      {activeKeys.map(key => (
        <div 
          key={key} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.25rem', 
            background: 'var(--primary-color)', 
            color: 'white', 
            padding: '0.25rem 0.5rem', 
            borderRadius: '16px', 
            fontSize: '0.85rem' 
          }}
        >
          <span>{key}: {filters[key]}</span>
          <X 
            size={14} 
            style={{ cursor: 'pointer' }} 
            onClick={() => onClearFilter(key)}
          />
        </div>
      ))}
      <button 
        onClick={onClearAll}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--primary-color)', 
          fontSize: '0.85rem', 
          cursor: 'pointer',
          textDecoration: 'underline' 
        }}
      >
        Clear All
      </button>
    </div>
  );
};

export default ActiveFilters;
