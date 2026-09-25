import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const SortSelect = ({ sortOptions, sortBy, sortOrder, onSortChange }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sort by:</span>
      <select 
        value={sortBy} 
        onChange={(e) => onSortChange(e.target.value, sortOrder)}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-primary)', 
          outline: 'none',
          padding: '0.25rem'
        }}
      >
        {sortOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <button 
        onClick={() => onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: 'var(--text-secondary)', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          padding: '0.25rem'
        }}
        title={sortOrder === 'asc' ? "Ascending" : "Descending"}
      >
        {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
      </button>
    </div>
  );
};

export default SortSelect;
