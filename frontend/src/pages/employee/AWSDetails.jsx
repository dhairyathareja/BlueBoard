import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiCloud, FiCopy } from 'react-icons/fi';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/ui/Loader';
import StatusBadge from '../../components/ui/StatusBadge';
import authService from '../../services/auth.service';

const AWSDetails = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfileInfo = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await authService.getProfileInfo(user._id);
      setProfile(res.user || null);
    } catch (err) {
      console.error('Error fetching employee AWS profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileInfo();
  }, [user]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  if (loading) {
    return <Loader />;
  }

  const awsProfile = profile?.awsProfile;

  return (
    <div style={{ padding: '32px' }}>
      <PageHeader
        title="AWS Details"
        subtitle="View the AWS IAM access provisioned by HR."
      />

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {awsProfile ? (
          <div className="glass-card" style={{ padding: '32px', textAlign: 'left' }}>
            
            {/* Header section with Icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--secondary-light)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                <FiCloud size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
                  Provisioned AWS Access
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Provisioned Region: {awsProfile.region}
                </span>
              </div>
            </div>

            {/* Account Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>IAM Username</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{awsProfile.iamUserName}</span>
                </div>
                <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => copyToClipboard(awsProfile.iamUserName, 'IAM Username')}>
                  <FiCopy />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>AWS Account ID</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{awsProfile.awsAccountId}</span>
                </div>
                <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => copyToClipboard(awsProfile.awsAccountId, 'AWS Account ID')}>
                  <FiCopy />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, padding: '12px 16px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>IAM Group</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{awsProfile.iamGroup}</span>
                </div>
                <div style={{ flex: 1, padding: '12px 16px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Region</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{awsProfile.region}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Status</span>
                  <StatusBadge status={awsProfile.status} />
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
            <FiCloud size={48} style={{ color: 'var(--text-muted)', display: 'block', margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>
              IAM Profile Inactive
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
              AWS access has not been provisioned yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AWSDetails;
