import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ fullPage = false }) => {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '4px solid var(--border-color)',
          borderTopColor: 'var(--primary)',
        }}
      />
      <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.9rem' }}>
        Loading BlueBoard...
      </span>
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'var(--glass-blur)'
      }}>
        {spinner}
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
      {spinner}
    </div>
  );
};

export default Loader;
