import React, { useState } from 'react';
import { FiSettings, FiSliders, FiLock, FiCloud, FiFileText, FiSave } from 'react-icons/fi';
import PageHeader from '../../components/layout/PageHeader';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const [generalConfig, setGeneralConfig] = useState({
    companyName: 'BlueBoard Corp',
    supportEmail: 'hr-support@blueboard.com',
    sessionTimeout: '60',
    requireTwoFactor: false
  });

  const [awsConfig, setAwsConfig] = useState({
    defaultRegion: 'ap-south-1',
    iamPath: '/blueboard/',
    enableCloudTrail: true,
    maxUserAccessDays: '365'
  });

  const [docConfig, setDocConfig] = useState({
    maxFileSize: '5', // MB
    allowedFormats: ['PDF', 'PNG', 'JPEG', 'DOCX'],
    requireVerification: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Settings updated successfully!');
    }, 1000);
  };

  const tabs = [
    { id: 'general', name: 'General Config', icon: FiSliders },
    { id: 'aws', name: 'AWS Provisioning', icon: FiCloud },
    { id: 'documents', name: 'Document Policies', icon: FiFileText },
  ];

  return (
    <div style={{ padding: '32px' }}>
      <PageHeader
        title="System Settings"
        subtitle="Manage HR platform defaults, S3 storage limits, and AWS IAM user provisioning rules."
      />

      <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left Side Tab Selector */}
        <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  fontFamily: 'var(--font-display)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.02)',
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  boxShadow: isActive ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Right Side Settings Panel */}
        <div className="glass-card" style={{ flex: 1, minWidth: '320px', padding: '32px' }}>
          <form onSubmit={handleSave}>
            
            {activeTab === 'general' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiSliders size={18} style={{ color: 'var(--primary)' }} /> General Configurations
                </h3>
                
                <div className="form-group">
                  <label className="form-label">Enterprise Company Name</label>
                  <input
                    type="text"
                    value={generalConfig.companyName}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, companyName: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">HR Support Email</label>
                  <input
                    type="email"
                    value={generalConfig.supportEmail}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, supportEmail: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Session Idle Timeout (minutes)</label>
                  <input
                    type="number"
                    value={generalConfig.sessionTimeout}
                    onChange={(e) => setGeneralConfig({ ...generalConfig, sessionTimeout: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={generalConfig.requireTwoFactor}
                      onChange={(e) => setGeneralConfig({ ...generalConfig, requireTwoFactor: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                    Require 2FA for all HR Managers
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'aws' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiCloud size={18} style={{ color: '#06b6d4' }} /> AWS Provisioning Variables
                </h3>

                <div className="form-group">
                  <label className="form-label">Default Region for IAM Users</label>
                  <select
                    value={awsConfig.defaultRegion}
                    onChange={(e) => setAwsConfig({ ...awsConfig, defaultRegion: e.target.value })}
                    className="form-control"
                  >
                    <option value="ap-south-1">Mumbai (ap-south-1)</option>
                    <option value="us-east-1">N. Virginia (us-east-1)</option>
                    <option value="us-west-2">Oregon (us-west-2)</option>
                    <option value="eu-west-1">Ireland (eu-west-1)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">IAM User Path Prefix</label>
                  <input
                    type="text"
                    value={awsConfig.iamPath}
                    onChange={(e) => setAwsConfig({ ...awsConfig, iamPath: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Password Validity (days)</label>
                  <input
                    type="number"
                    value={awsConfig.maxUserAccessDays}
                    onChange={(e) => setAwsConfig({ ...awsConfig, maxUserAccessDays: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={awsConfig.enableCloudTrail}
                      onChange={(e) => setAwsConfig({ ...awsConfig, enableCloudTrail: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                    Enable AWS CloudTrail Audit logging for new IAM User activity
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FiFileText size={18} style={{ color: 'var(--primary)' }} /> Document Submission Rules
                </h3>

                <div className="form-group">
                  <label className="form-label">Maximum Allowed File Size (MB)</label>
                  <input
                    type="number"
                    value={docConfig.maxFileSize}
                    onChange={(e) => setDocConfig({ ...docConfig, maxFileSize: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Allowed File Extensions</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['PDF', 'PNG', 'JPEG', 'DOCX', 'XLSX'].map(format => {
                      const isChecked = docConfig.allowedFormats.includes(format);
                      return (
                        <label key={format} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const updated = isChecked
                                ? docConfig.allowedFormats.filter(f => f !== format)
                                : [...docConfig.allowedFormats, format];
                              setDocConfig({ ...docConfig, allowedFormats: updated });
                            }}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                          />
                          {format}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    <input
                      type="checkbox"
                      checked={docConfig.requireVerification}
                      onChange={(e) => setDocConfig({ ...docConfig, requireVerification: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                    Require manual review for all uploaded documents
                  </label>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ height: '44px', minWidth: '160px' }}>
                {loading ? 'Saving...' : (
                  <>
                    <FiSave size={18} /> Save Settings
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
