import React, { useEffect, useState } from 'react';
import { FiSun, FiMoon, FiBell } from 'react-icons/fi';
import { useSelector } from 'react-redux';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const [isLight, setIsLight] = useState(
    localStorage.getItem('bb_theme') === 'light'
  );

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('theme-light');
      localStorage.setItem('bb_theme', 'light');
    } else {
      document.body.classList.remove('theme-light');
      localStorage.setItem('bb_theme', 'dark');
    }
  }, [isLight]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(8, 12, 20, 0.4)',
      backdropFilter: 'var(--glass-blur)',
      WebkitBackdropFilter: 'var(--glass-blur)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 99
    }} className="navbar-glass">
      
      {/* Welcome Message */}
      <div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {getFormattedDate()}
        </span>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
          {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
        </h2>
      </div>

      {/* Quick Actions / Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        {/* Theme Toggle */}
        <button
          onClick={() => setIsLight(!isLight)}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--border-color)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
          title="Toggle Theme"
        >
          {isLight ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>

        {/* Notifications Icon (Mocked) */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            position: 'relative'
          }}
        >
          <FiBell size={18} />
          <span style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            background: 'var(--primary)',
            borderRadius: '50%',
            boxShadow: '0 0 6px var(--primary)'
          }} />
        </div>

        {/* Small User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderLeft: '1px solid var(--border-color)',
          paddingLeft: '16px',
          height: '24px'
        }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-display)'
          }}>
            {user?.employeeId || 'EMP'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
