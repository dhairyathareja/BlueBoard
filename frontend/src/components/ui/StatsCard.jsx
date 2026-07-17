import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, icon: Icon, description, trend, trendType = 'positive' }) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '140px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-display)' }}>
            {title}
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px', marginBottom: '4px', fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
            {value}
          </h2>
        </div>
        {Icon && (
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--primary-light)',
            border: '1px solid var(--primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
        {trend && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: trendType === 'positive' ? '#10b981' : '#ef4444',
            background: trendType === 'positive' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            {trend}
          </span>
        )}
        {description && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {description}
          </span>
        )}
      </div>

      {/* Modern floating decorative blob inside card */}
      <div style={{
        position: 'absolute',
        width: '60px',
        height: '60px',
        background: 'radial-gradient(circle, var(--primary-light) 0%, rgba(255,255,255,0) 70%)',
        bottom: '-20px',
        right: '-20px',
        pointerEvents: 'none'
      }} />
    </motion.div>
  );
};

export default StatsCard;
