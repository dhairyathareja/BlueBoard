import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyles = (statusVal = '') => {
    const s = statusVal.toLowerCase();
    switch (s) {
      case 'active':
      case 'completed':
        return {
          background: 'var(--success-light)',
          color: '#34d399',
          border: '1px solid var(--success-border)',
        };
      case 'pending':
      case 'documents pending':
      case 'documents_pending':
        return {
          background: 'var(--warning-light)',
          color: '#fbbf24',
          border: '1px solid var(--warning-border)',
        };
      case 'inactive':
      case 'disabled':
        return {
          background: 'var(--danger-light)',
          color: '#f87171',
          border: '1px solid var(--danger-border)',
        };
      default:
        return {
          background: 'var(--border-color)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-color-hover)',
        };
    }
  };

  const style = getStatusStyles(status);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      fontFamily: 'var(--font-display)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      ...style
    }}>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
