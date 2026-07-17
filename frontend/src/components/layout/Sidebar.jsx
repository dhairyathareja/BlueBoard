import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser, selectIsHR } from '../../context/authSlice';
import {
  FiGrid,
  FiUsers,
  FiAward,
  FiCloud,
  FiFileText,
  FiSettings,
  FiUser,
  FiLogOut,
  FiShield
} from 'react-icons/fi';

const Sidebar = ({ portal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isHR = useSelector(selectIsHR);
  const activePortal = portal || (isHR ? 'hr' : 'employee');

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/login');
    });
  };

  const hrLinks = [
    { name: 'Dashboard', path: '/hr/dashboard', icon: FiGrid },
    { name: 'Employees', path: '/hr/employees', icon: FiUsers },
    { name: 'Roles', path: '/hr/roles', icon: FiShield },
    { name: 'AWS Profiles', path: '/hr/aws-profiles', icon: FiCloud },
    { name: 'Documents', path: '/hr/documents', icon: FiFileText },
    { name: 'Settings', path: '/hr/settings', icon: FiSettings },
  ];

  const employeeLinks = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: FiGrid },
    { name: 'My Documents', path: '/employee/documents', icon: FiFileText },
    { name: 'AWS Details', path: '/employee/aws-details', icon: FiCloud },
    { name: 'Profile', path: '/employee/profile', icon: FiUser },
  ];

  const links = activePortal === 'hr' ? hrLinks : employeeLinks;

  return (
    <div style={{
      width: '260px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      zIndex: 100
    }}>
      {/* Top Section */}
      <div>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 8px', marginBottom: '32px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '1.2rem',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
          }}>
            B
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '-0.02em' }}>
              BlueBoard
            </h1>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.1em', fontWeight: 600, display: 'block' }}>
              {activePortal === 'hr' ? 'HR Portal' : 'Employee Desk'}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'linear-gradient(90deg, var(--primary-light) 0%, rgba(139, 92, 246, 0.02) 100%)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)'
                })}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.classList.contains('active')) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={18} />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Section */}
      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '0 8px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            border: '1px solid var(--primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            fontWeight: 600,
            fontSize: '0.95rem'
          }}>
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {user?.designation || (activePortal === 'hr' ? 'HR Manager' : 'Employee')}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            color: '#f87171',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <FiLogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
