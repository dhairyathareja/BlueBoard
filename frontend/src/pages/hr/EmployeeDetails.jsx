import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiArrowLeft,
  FiUser,
  FiAward,
  FiCloud,
  FiFileText,
  FiCalendar,
  FiBriefcase,
  FiActivity,
  FiPlus,
  FiDownload,
  FiTrash2,
  FiCopy
} from 'react-icons/fi';
import PageHeader from '../../components/layout/PageHeader';
import Loader from '../../components/ui/Loader';
import ProgressStepper from '../../components/ui/ProgressStepper';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import employeeService from '../../services/employee.service';
import roleService from '../../services/role.service';
import documentService from '../../services/document.service';
import awsService from '../../services/aws.service';
import { COMPANY_DOCUMENT_TYPES, isCompanyDocument, isEmployeeUploadedDocument } from '../../utils/documentTypes';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [employee, setEmployee] = useState(null);
  const [role, setRole] = useState(null);
  const [awsProfile, setAwsProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [employeeDocuments, setEmployeeDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Document upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState(COMPANY_DOCUMENT_TYPES[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      // 1. Fetch employee details
      const empRes = await employeeService.getDetails(id);
      const emp = empRes.empDetails;
      setEmployee(emp);

      // 2. Fetch employee documents
      if (emp?.employeeId) {
        const docsRes = await documentService.getEmployeeDocuments(emp.employeeId);
        const allDocs = docsRes.documents || [];
        setDocuments(allDocs);
        setCompanyDocuments(allDocs.filter((doc) => isCompanyDocument(doc, emp)));
        setEmployeeDocuments(allDocs.filter((doc) => isEmployeeUploadedDocument(doc, emp)));
      }

      // 3. Fetch role details if assigned
      if (emp?.role) {
        try {
          const rolesRes = await roleService.getList({ limit: 100 });
          const foundRole = (rolesRes.roleList || []).find(r => r._id === (typeof emp.role === 'object' ? emp.role._id : emp.role));
          setRole(foundRole || null);
        } catch (err) {
          console.warn('Failed to load role details:', err);
        }
      }

      // 4. Fetch AWS Profile details if assigned
      if (emp?.awsProfile) {
        try {
          const awsRes = await awsService.getList({ limit: 100 });
          const foundProfile = (awsRes.awsProfiles || []).find(p => p._id === (typeof emp.awsProfile === 'object' ? emp.awsProfile._id : emp.awsProfile));
          setAwsProfile(foundProfile || null);
        } catch (err) {
          console.warn('Failed to load AWS Profile:', err);
        }
      }

    } catch (err) {
      console.error('Error fetching employee details:', err);
      alert('Failed to load employee details.');
      navigate('/hr/employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('employeeId', employee.employeeId);
      formData.append('documentType', uploadType);
      formData.append('uploadedBy', user?._id || '');
      formData.append('document', selectedFile);

      await documentService.upload(formData);
      
      if (employee.onboardingStatus === 'Pending') {
        await employeeService.update({
          employeeId: employee.employeeId,
          department: employee.department,
          designation: employee.designation,
          status: employee.status,
          onboardingStatus: 'Documents Pending'
        });
      }

      setIsUploadOpen(false);
      setSelectedFile(null);
      fetchDetails();
      alert('Document uploaded successfully!');
    } catch (err) {
      alert(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document? This action is permanent.')) return;
    
    try {
      await documentService.delete(docId);
      fetchDetails();
      alert('Document deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete document.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return <Loader />;
  }

  const employeeWithProgress = {
    ...employee,
    companyDocumentsCount: companyDocuments.length,
    employeeDocumentsCount: employeeDocuments.length,
  };

  // Derive Timeline milestones based on employee status
  const timelineMilestones = [
    {
      title: 'Employee Profile Created',
      desc: `Registered by HR on ${new Date(employee?.createdAt || employee?.joiningDate).toLocaleDateString()}`,
      status: 'completed',
      date: new Date(employee?.createdAt || employee?.joiningDate).toLocaleDateString()
    },
    {
      title: 'Corporate Role Assigned',
      desc: role ? `Assigned to role: ${role.roleName} (IAM Group: ${role.awsGroupName})` : 'Awaiting role assignment from HR',
      status: role ? 'completed' : 'pending',
      date: role ? 'Completed' : 'Pending'
    },
    {
      title: 'AWS Cost & Access Provisioned',
      desc: awsProfile ? `IAM Console account active for username: ${awsProfile.iamUserName}` : 'IAM profile provisioning pending',
      status: awsProfile ? 'completed' : 'pending',
      date: awsProfile ? 'Completed' : 'Pending'
    },
    {
      title: 'Company Documents Uploaded',
      desc: companyDocuments.length > 0 ? `${companyDocuments.length} company document(s) shared with employee` : 'Offer letter, appointment letter, joining letter, and NDA files pending',
      status: companyDocuments.length > 0 ? 'completed' : 'pending',
      date: companyDocuments.length > 0 ? 'Completed' : 'Pending'
    },
    {
      title: 'Employee Documents Uploaded',
      desc: employeeDocuments.length > 0 ? `${employeeDocuments.length} onboarding document(s) submitted by employee` : 'Employee has not submitted onboarding files',
      status: employeeDocuments.length > 0 ? 'completed' : 'pending',
      date: employeeDocuments.length > 0 ? 'Completed' : 'Pending'
    },
    {
      title: 'Credentials Issued & Active',
      desc: employee?.onboardingStatus === 'Completed' ? 'Credentials sent to employee. Onboarding complete.' : 'Awaiting final verification check',
      status: employee?.onboardingStatus === 'Completed' ? 'completed' : 'pending',
      date: employee?.onboardingStatus === 'Completed' ? 'Completed' : 'Pending'
    }
  ];

  return (
    <div style={{ padding: '32px' }}>
      {/* Page Header with Back Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/hr/employees')}
          className="btn btn-secondary"
          style={{ padding: '8px 12px', height: '40px', borderRadius: '8px' }}
        >
          <FiArrowLeft size={16} /> Back
        </button>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', textAlign: 'left' }}>
            Employee Details
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
            {employee?.name}
          </h2>
        </div>
      </div>

      {/* Progress Stepper */}
      <ProgressStepper employee={employeeWithProgress} />

      {/* Main Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Personal & Employment Info */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <FiUser size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
              Employment Details
            </h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Employee ID</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{employee?.employeeId}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{employee?.email}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone Number</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{employee?.phone || 'N/A'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Department</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{employee?.department || 'N/A'}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Designation</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{employee?.designation}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Joining Date</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiCalendar size={14} /> {new Date(employee?.joiningDate).toLocaleDateString()}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</span>
              <span><StatusBadge status={employee?.status} /></span>
            </div>
          </div>
        </div>

        {/* AWS IAM Profile Info */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <FiCloud size={20} style={{ color: '#06b6d4' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
              AWS IAM Account Access
            </h3>
          </div>

          {awsProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>IAM Username</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {awsProfile.iamUserName}
                  <FiCopy style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => copyToClipboard(awsProfile.iamUserName)} />
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AWS Account ID</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {awsProfile.awsAccountId}
                  <FiCopy style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => copyToClipboard(awsProfile.awsAccountId)} />
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>IAM Group</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{awsProfile.iamGroup}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Default Region</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{awsProfile.region}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Console URL</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', wordBreak: 'break-all', textDecoration: 'underline' }}>
                  <a href={awsProfile.consoleUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>Sign in Console</a>
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Access Status</span>
                <span><StatusBadge status={awsProfile.status} /></span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
              <FiCloud size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.85rem' }}>No AWS Console Profile provisioned yet.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '4px' }}>Assign an employee role first to configure AWS IAM console permissions.</p>
            </div>
          )}
        </div>

      </div>

      {/* Documents & Onboarding Timeline Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px' }}>
        
        {/* Document Panel */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiFileText size={20} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
                Company Documents ({companyDocuments.length})
              </h3>
            </div>
            <button onClick={() => setIsUploadOpen(true)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', height: '32px' }}>
              <FiPlus size={14} /> Upload Company File
            </button>
          </div>

          {companyDocuments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {companyDocuments.map((doc) => (
                <div key={doc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{doc.documentType}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.fileName} ({Math.round(doc.fileSize / 1024)} KB)</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', height: '32px' }}
                      title="Download Document"
                    >
                      <FiDownload size={14} />
                    </a>
                    <button
                      onClick={() => handleDeleteDoc(doc._id)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 10px', height: '32px', color: '#ef4444' }}
                      title="Delete Document"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              <FiFileText size={36} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Company Documents Uploaded</h4>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Upload offer letter, appointment letter, joining letter, or NDA files for this employee.</p>
            </div>
          )}
        </div>

        {/* Onboarding Timeline Panel */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <FiActivity size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
              Onboarding History Log
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px' }}>
            {/* Connecting Timeline Line */}
            <div style={{
              position: 'absolute',
              left: '7px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              background: 'var(--border-color)'
            }} />

            {timelineMilestones.map((m, idx) => (
              <div key={idx} style={{ position: 'relative', textAlign: 'left' }}>
                {/* Timeline Circle */}
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: m.status === 'completed' ? 'var(--primary)' : 'var(--bg-secondary)',
                  border: m.status === 'completed' ? 'none' : '2px solid var(--border-color)',
                  boxShadow: m.status === 'completed' ? '0 0 6px var(--primary)' : 'none'
                }} />
                
                <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: m.status === 'completed' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {m.title}
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {m.desc}
                </p>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', display: 'block', marginTop: '4px', fontWeight: 500 }}>
                  {m.date}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <FiFileText size={20} style={{ color: 'var(--secondary)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
            Employee Uploaded Documents ({employeeDocuments.length})
          </h3>
        </div>
        {employeeDocuments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {employeeDocuments.map((doc) => (
              <div key={doc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(0,0,0,0.15)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{doc.documentType}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{doc.fileName} ({Math.round(doc.fileSize / 1024)} KB)</span>
                </div>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '6px 10px', height: '32px' }} title="Download employee document">
                  <FiDownload size={14} />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>
            <FiFileText size={32} style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Employee Documents Uploaded</h4>
            <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Employee onboarding uploads will appear here for HR review.</p>
          </div>
        )}
      </div>

      {/* MODAL: Upload Document */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Company Document">
        <form onSubmit={handleUploadSubmit}>
          <div className="form-group">
            <label className="form-label">Document Category</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              className="form-control"
            >
              {COMPANY_DOCUMENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Select File (PDF, DOCX, JPEG, PNG)</label>
            <input
              type="file"
              required
              className="form-control"
              style={{ padding: '8px' }}
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </div>

          <button type="submit" disabled={uploading} className="btn btn-primary" style={{ width: '100%', height: '44px' }}>
            {uploading ? 'Uploading File to AWS S3...' : 'Upload verified File'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeDetails;
