import React, { useEffect, useState } from 'react';
import { FiDownload, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import FilterBar from '../../components/ui/FilterBar';
import Pagination from '../../components/ui/Pagination';
import Loader from '../../components/ui/Loader';
import documentService from '../../services/document.service';
import { COMPANY_DOCUMENT_TYPES, isCompanyDocument } from '../../utils/documentTypes';

const DOCUMENT_OPTIONS = [
  { value: '', label: 'All Document Types' },
  ...COMPANY_DOCUMENT_TYPES.map(t => ({ value: t, label: t }))
];

const DocumentsList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [docType, setDocType] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await documentService.getList({
        page,
        limit: 10,
        search,
        documentType: docType
      });
      setDocuments((res.documentList || []).filter((doc) => isCompanyDocument(doc, doc.employee)));
      setTotalPages(res.totalPages || 1);
      setTotalDocs(res.totalDocuments || 0);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [page, docType]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchDocuments();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Handle Document Download
  const handleDownload = async (documentId) => {
    try {
      const res = await documentService.download(documentId);

      window.open(res.downloadUrl, "_blank");
    } catch (err) {
      alert(err.message || "Failed to download document.");
    }
  };

  // Handle delete Documents
  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document? This action is permanent.')) return;
    setLoading(true);
    try {
      await documentService.delete(docId);
      alert('Document deleted successfully.');
      fetchDocuments();
    } catch (err) {
      alert(err.message || 'Failed to delete document.');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Employee details',
      key: 'employee',
      render: (row) => row.employee ? (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{row.employee.name}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {row.employee.employeeId}</span>
        </div>
      ) : (
        <span style={{ color: 'var(--text-muted)' }}>Unknown Employee</span>
      )
    },
    {
      header: 'Document Type',
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
      render: (row) => (
        <span style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{row.fileName}</span>
      )
    },
    {
      header: 'File Size',
      key: 'fileSize',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {Math.round(row.fileSize / 1024)} KB
        </span>
      )
    },
    {
      header: 'Uploaded Date',
      key: 'createdAt',
      render: (row) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
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
            title="Delete Document"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '32px' }}>
      <PageHeader
        title="HR Company Documents"
        subtitle={`Company documents uploaded for employees: ${documents.length}`}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or ID..." />
        
        <FilterBar
          options={DOCUMENT_OPTIONS}
          value={docType}
          onChange={(val) => { setDocType(val); setPage(1); }}
          label="Document Type"
        />
      </div>

      <Table
        columns={columns}
        data={documents}
        isLoading={loading}
        emptyTitle="No Company Documents Found"
        emptyDescription="Offer letters, appointment letters, joining letters, and NDA files uploaded by HR will show up here."
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default DocumentsList;
