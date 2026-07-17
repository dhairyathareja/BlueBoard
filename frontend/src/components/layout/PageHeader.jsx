import React from 'react';

const PageHeader = ({ title, subtitle, actions }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      <div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.02em',
          margin: 0,
          textAlign: 'left'
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            marginTop: '4px',
            textAlign: 'left'
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
