import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  const [localValue, setLocalValue] = useState(value || '');

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange({ target: { name: 'search', value: localValue } });
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(handler);
  }, [localValue, onChange, value]);

  return (
    <div style={{ position: 'relative', flex: '1 1 250px' }}>
      <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
      <input
        type="text"
        name="search"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        style={{ 
          width: '100%', 
          padding: '0.75rem 0.75rem 0.75rem 2.2rem', 
          borderRadius: '4px', 
          border: '1px solid var(--border-color)', 
          background: 'var(--bg-secondary)', 
          color: 'var(--text-primary)',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
};

export default SearchBar;
