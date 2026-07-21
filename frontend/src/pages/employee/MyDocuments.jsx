import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiFileText, FiPlus, FiDownload, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import documentService from '../../services/document.service';
import employeeService from '../../services/employee.service';
import authService from '../../services/auth.service';
import { EMPLOYEE_DOCUMENT_TYPES, isCompanyDocument, isEmployeeUploadedDocument } from '../../utils/documentTypes';

const MyDocuments = () => {
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [employeeDocuments, setEmployeeDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState(EMPLOYEE_DOCUMENT_TYPES[0]);
  const [replaceDocument, setReplaceDocument] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchProfileAndDocs = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const profileRes = await authService.getProfileInfo(user._id);
      const userDetails = profileRes.user;
      setProfile(userDetails);

      if (userDetails?.employeeId) {
        const docsRes = await documentService.getEmployeeDocuments(userDetails.employeeId);
        const allDocs = docsRes.documents || [];
        setCompanyDocuments(allDocs.filter((doc) => isCompanyDocument(doc, userDetails)));
        setEmployeeDocuments(allDocs.filter((doc) => isEmployeeUploadedDocument(doc, userDetails)));
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndDocs();
  }, [user]);

  // Handle Document Download
  const handleDownload = async (documentId) => {
    try {
      const res = await documentService.download(documentId);

      window.open(res.downloadUrl, "_blank");
    } catch (err) {
      alert(err.message || "Failed to download document.");
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please choose a file to upload.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('employeeId', profile.employeeId);
      formData.append('documentType', replaceDocument?.documentType || uploadType);
      formData.append('uploadedBy', profile._id);
      formData.append('document', selectedFile);

      if (replaceDocument?._id) {
        await documentService.delete(replaceDocument._id);
      }

      await documentService.upload(formData);

      // Update onboardingStatus to "Documents Pending" if it's currently "Pending"
      if (profile.onboardingStatus === 'Pending') {
        await employeeService.update({
          employeeId: profile.employeeId,
          department: profile.department,
          designation: profile.designation,
          status: profile.status,
          onboardingStatus: 'Documents Pending'
        });
      }

      setIsUploadOpen(false);
      setSelectedFile(null);
      setReplaceDocument(null);
      fetchProfileAndDocs();
      alert(replaceDocument ? 'Document replaced successfully.' : 'Document uploaded successfully.');
    } catch (err) {
      alert(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setLoading(true);
    try {
      await documentService.delete(docId);
      fetchProfileAndDocs();
      alert('Document deleted successfully.');
    } catch (err) {
      alert(err.message || 'Failed to delete document.');
    } finally {
      setLoading(false);
    }
  };

  const openUploadModal = (document = null) => {
    setReplaceDocument(document);
    setUploadType(document?.documentType || EMPLOYEE_DOCUMENT_TYPES[0]);
    setSelectedFile(null);
    setIsUploadOpen(true);
  };

  const columns = [
    {
      header: 'Document Category',
      key: 'documentType',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>
          {row.documentType}
        </span>
      )
    },
    {
      header: 'File Name',
      key: 'fileName',
      render: (row) => <span style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{row.fileName}</span>
    },
    {
      header: 'Size',
      key: 'fileSize',
      render: (row) => <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{Math.round(row.fileSize / 1024)} KB</span>
    },
    {
      header: 'Uploaded Date',
      key: 'createdAt',
      render: (row) => <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(row.createdAt).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          
          <button
            onClick={() => handleDownload(row._id)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', height: '32px' }}
            title="Download Document"
          >
            <FiDownload size={14} />
          </button>
          
          <button
            onClick={() => handleDeleteDoc(row._id)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', height: '32px', color: '#ef4444' }}
            title="Delete file"
          >
            <FiTrash2 size={14} />
          </button>
          <button
            onClick={() => openUploadModal(row)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', height: '32px', color: 'var(--primary)' }}
            title="Replace file"
          >
            <FiRefreshCw size={14} />
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div style={{ padding: '32px' }}>
      <PageHeader
        title="My Documents Vault"
        subtitle="Upload personal onboarding documents and download company documents shared by HR."
        actions={
          <button onClick={() => openUploadModal()} className="btn btn-primary">
            <FiPlus size={16} /> Upload New File
          </button>
        }
      />

      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <FiDownload style={{ color: 'var(--secondary)' }} />
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Company Documents
          </h3>
        </div>
        <Table
          columns={columns.filter((column) => column.key !== 'actions').concat({
            header: 'Actions',
            key: 'downloadOnly',
            render: (row) => (
              // <a
              //   href={row.fileUrl}
              //   target="_blank"
              //   rel="noopener noreferrer"
              //   className="btn btn-secondary"
              //   style={{ padding: '6px 10px', height: '32px' }}
              //   title="Download company document"
              // >
              //   <FiDownload size={14} />
              // </a>
              
              <button
                onClick={() => handleDownload(row._id)}
                className="btn btn-secondary"
                style={{ padding: '6px 10px', height: '32px' }}
                title="Download Document"
              >
                <FiDownload size={14} />
              </button>

            )
          })}
          data={companyDocuments}
          isLoading={false}
          emptyTitle="No Company Documents"
          emptyDescription="Offer letters, appointment letters, joining letters, and NDA files uploaded by HR will appear here."
        />
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <FiFileText style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Employee Documents
          </h3>
        </div>
      <Table
        columns={columns}
        data={employeeDocuments}
        isLoading={false}
        emptyTitle="No Verification Documents Found"
        emptyDescription="Please upload required onboarding files such as Government ID, Address Proof, PAN, Passport, Resume, or Experience Certificate."
      />
      </div>

      {/* UPLOAD MODAL */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
          setReplaceDocument(null);
        }}
        title={replaceDocument ? `Replace ${replaceDocument.documentType}` : 'Upload Onboarding File'}
      >
        <form onSubmit={handleUploadSubmit}>
          {!replaceDocument && (
            <div className="form-group">
            <label className="form-label">Document Category</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              className="form-control"
            >
              {EMPLOYEE_DOCUMENT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          )}

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Select File (PDF, PNG, JPEG or DOCX)</label>
            <input
              type="file"
              required
              className="form-control"
              style={{ padding: '8px' }}
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </div>

          <button type="submit" disabled={uploading} className="btn btn-primary" style={{ width: '100%', height: '44px' }}>
            {uploading ? 'Uploading File to AWS S3...' : 'Upload File'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MyDocuments;
