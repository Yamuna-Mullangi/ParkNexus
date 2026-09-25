import React from 'react';

const Pagination = ({ page, totalPages, totalItems, onPageChange }) => {
  if (totalPages <= 1 && totalItems === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
      {totalItems > 0 && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Showing {Math.min((page - 1) * 20 + 1, totalItems)}–{Math.min(page * 20, totalItems)} of {totalItems}
        </div>
      )}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            disabled={page <= 1} 
            onClick={() => onPageChange(page - 1)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '4px', 
              background: 'var(--bg-secondary)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)', 
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              opacity: page <= 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>
          
          <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Page {page} of {totalPages}
          </span>
          
          <button 
            disabled={page >= totalPages} 
            onClick={() => onPageChange(page + 1)}
            style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '4px', 
              background: 'var(--bg-secondary)', 
              color: 'var(--text-primary)', 
              border: '1px solid var(--border-color)', 
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              opacity: page >= totalPages ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
