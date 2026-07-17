import React, { useEffect, useState } from 'react';
import { FiCloud, FiLock, FiAlertTriangle, FiCheckCircle, FiCopy, FiSlash } from 'react-icons/fi';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import FilterBar from '../../components/ui/FilterBar';
import Pagination from '../../components/ui/Pagination';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import awsService from '../../services/aws.service';

const REGIONS = [
  { value: '', label: 'All Regions' },
  { value: 'ap-south-1', label: 'Mumbai (ap-south-1)' },
  { value: 'us-east-1', label: 'N. Virginia (us-east-1)' },
  { value: 'us-west-2', label: 'Oregon (us-west-2)' },
  { value: 'eu-west-1', label: 'Ireland (eu-west-1)' }
];

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Disabled', label: 'Disabled' }
];

const AWSProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProfiles, setTotalProfiles] = useState(0);

  // Password reset success modal
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetCredentials, setResetCredentials] = useState(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await awsService.getList({
        page,
        limit: 10,
        search,
        region,
        status
      });
      setProfiles(res.awsProfiles || []);
      setTotalPages(res.totalPages || 1);
      setTotalProfiles(res.totalProfiles || 0);
    } catch (err) {
      console.error('Error fetching AWS profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [page, region, status]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchProfiles();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleResetPassword = async (profileId) => {
    if (!window.confirm('Are you sure you want to reset the password for this IAM account?')) return;
    setLoading(true);
    try {
      const res = await awsService.resetPassword(profileId);
      setResetCredentials(res.credentials);
      setIsResetOpen(true);
      fetchProfiles();
    } catch (err) {
      alert(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableAccess = async (profileId) => {
    if (!window.confirm('Are you sure you want to disable AWS console access for this account? This will revoke IAM Group privileges.')) return;
    setLoading(true);
    try {
      await awsService.disableAccess(profileId);
      alert('AWS console access disabled successfully.');
      fetchProfiles();
    } catch (err) {
      alert(err.message || 'Failed to disable access.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const columns = [
    {
      header: 'IAM Username',
      key: 'iamUserName',
      render: (row) => (
        <span style={{ fontWeight: 600, color: '#06b6d4', fontFamily: 'monospace' }}>
          {row.iamUserName}
        </span>
      )
    },
    {
      header: 'Assigned Employee',
      key: 'employee',
      render: (row) => row.employee ? (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{row.employee.name}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {row.employee.employeeId}</span>
        </div>
      ) : (
        <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
      )
    },
    {
      header: 'IAM Group',
      key: 'iamGroup',
      render: (row) => <span style={{ fontSize: '0.85rem' }}>{row.iamGroup}</span>
    },
    {
      header: 'Region',
      key: 'region',
      render: (row) => <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{row.region}</span>
    },
    {
      header: 'Console Sign-In',
      key: 'consoleUrl',
      render: (row) => (
        <a
          href={row.consoleUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'underline' }}
        >
          Console URL
        </a>
      )
    },
    {
      header: 'Access Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {row.status === 'Active' && (
            <>
              <button
                onClick={() => handleResetPassword(row._id)}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', height: '32px' }}
                title="Reset password"
              >
                <FiLock size={14} />
              </button>
              <button
                onClick={() => handleDisableAccess(row._id)}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', height: '32px', color: '#ef4444' }}
                title="Disable console access"
              >
                <FiSlash size={14} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '32px' }}>
      <PageHeader
        title="AWS Account Management"
        subtitle={`Provisioned IAM accounts: ${totalProfiles}`}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by IAM username..." />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <FilterBar
            options={REGIONS}
            value={region}
            onChange={(val) => { setRegion(val); setPage(1); }}
            label="Region"
          />
          <FilterBar
            options={STATUSES}
            value={status}
            onChange={(val) => { setStatus(val); setPage(1); }}
            label="Status"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={profiles}
        isLoading={loading}
        emptyTitle="No AWS Profiles Active"
        emptyDescription="Create console profiles from the employee directory."
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* MODAL: Password Reset Details */}
      <Modal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} title="AWS Password Reset Done">
        <div>
          <div className="alert alert-success" style={{ marginBottom: '24px' }}>
            <span>Temporary login credentials have been updated for user: {resetCredentials?.iamUserName}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>IAM Username</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{resetCredentials?.iamUserName}</span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => copyToClipboard(resetCredentials?.iamUserName, 'IAM Username')}>
                <FiCopy />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Temporary Password</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace' }}>{resetCredentials?.temporaryPassword}</span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => copyToClipboard(resetCredentials?.temporaryPassword, 'Temporary Password')}>
                <FiCopy />
              </button>
            </div>

          </div>

          <button onClick={() => setIsResetOpen(false)} className="btn btn-primary" style={{ width: '100%', height: '44px', marginTop: '24px' }}>
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AWSProfiles;
