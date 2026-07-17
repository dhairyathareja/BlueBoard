import React from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ title = 'No Data Found', description = 'There are no records to display at this time.', icon: Icon = FiInbox, action }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      borderRadius: '12px',
      background: 'rgba(0, 0, 0, 0.1)',
      border: '1px dashed var(--border-color)',
      textAlign: 'center',
      width: '100%',
      maxWidth: '500px',
      margin: '24px auto'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'var(--primary-light)',
        border: '1px solid var(--primary-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        color: 'var(--primary)'
      }}>
        <Icon size={24} />
      </div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '320px' }}>
        {description}
      </p>
      {action && action}
    </div>
  );
};

export default EmptyState;
