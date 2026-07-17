import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiUser, FiMail, FiPhone, FiCalendar, FiBriefcase, FiAward, FiShield } from 'react-icons/fi';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/ui/Loader';
import authService from '../../services/auth.service';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const res = await authService.getProfileInfo(user._id);
        setProfile(res.user);
      } catch (err) {
        console.error('Error loading employee profile details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={{ padding: '32px' }}>
      <PageHeader
        title="My Corporate Profile"
        subtitle="Manage and review your corporate identity and system assignments."
      />

      <div style={{ maxWidth: '800px', margin: '0 auto' }} className="glass-card">
        {/* Profile Card Header */}
        <div style={{
          padding: '40px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          background: 'rgba(255, 255, 255, 0.01)',
          flexWrap: 'wrap'
        }}>
          {/* Avatar circle */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '2rem',
            boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)'
          }}>
            {profile?.name ? profile.name[0].toUpperCase() : 'U'}
          </div>

          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
              {profile?.name}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {profile?.designation} • {profile?.department}
            </p>
            <span style={{
              display: 'inline-flex',
              marginTop: '12px',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              border: '1px solid var(--primary-border)'
            }}>
              Onboarding Status: {profile?.onboardingStatus}
            </span>
          </div>
        </div>

        {/* Profile Body Fields */}
        <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          
          {/* Contact Details */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUser size={18} style={{ color: 'var(--primary)' }} /> Personal Information
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <FiMail style={{ color: 'var(--text-muted)' }} /> {profile?.email}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Phone Contact</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <FiPhone style={{ color: 'var(--text-muted)' }} /> {profile?.phone || 'Not provided'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Employee ID</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, marginTop: '4px', display: 'block' }}>
                  {profile?.employeeId}
                </span>
              </div>
            </div>
          </div>

          {/* Job Details */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiBriefcase size={18} style={{ color: 'var(--primary)' }} /> Employment Assignments
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Corporate Role Profile</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <FiAward style={{ color: 'var(--text-muted)' }} /> {profile?.role?.roleName || 'No Role Assigned'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>AWS IAM Policy Group</span>
                <span style={{ fontSize: '0.9rem', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontFamily: 'monospace' }}>
                  <FiShield /> {profile?.role?.awsGroupName || 'None'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Corporate Joining Date</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <FiCalendar style={{ color: 'var(--text-muted)' }} /> {new Date(profile?.joiningDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;
