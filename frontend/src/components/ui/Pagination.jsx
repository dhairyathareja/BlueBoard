import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px', paddingBottom: '12px' }}>
      
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="btn btn-secondary"
        style={{ padding: '8px 12px', minWidth: '40px', height: '40px', borderRadius: '8px', opacity: currentPage === 1 ? 0.4 : 1 }}
      >
        <FiChevronLeft size={16} />
      </button>

      {/* Page Numbers */}
      {pages.map((p) => {
        const isCurrent = p === currentPage;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className="btn"
            style={{
              minWidth: '40px',
              height: '40px',
              borderRadius: '8px',
              padding: '0',
              fontWeight: 600,
              fontSize: '0.85rem',
              background: isCurrent ? 'var(--primary)' : 'transparent',
              border: isCurrent ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              color: isCurrent ? '#ffffff' : 'var(--text-primary)',
              boxShadow: isCurrent ? '0 0 10px rgba(139, 92, 246, 0.3)' : 'none',
              cursor: 'pointer'
            }}
          >
            {p}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="btn btn-secondary"
        style={{ padding: '8px 12px', minWidth: '40px', height: '40px', borderRadius: '8px', opacity: currentPage === totalPages ? 0.4 : 1 }}
      >
        <FiChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
