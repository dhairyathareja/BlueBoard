import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FiUserPlus,
  FiEye,
  FiEdit,
  FiCloud,
  FiFileText,
  FiCheckCircle,
  FiChevronRight,
  FiCopy
} from 'react-icons/fi';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import FilterBar from '../../components/ui/FilterBar';
import Pagination from '../../components/ui/Pagination';
import StatusBadge from '../../components/ui/StatusBadge';
import Drawer from '../../components/ui/Drawer';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import employeeService from '../../services/employee.service';
import roleService from '../../services/role.service';
import awsService from '../../services/aws.service';
import authService from '../../services/auth.service';
import departmentService from '../../services/department.service';

const STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Inactive', label: 'Inactive' }
];

const EmployeesList = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Listing state
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);

  // Role list (for selects)
  const [roles, setRoles] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);

  // Drawers / Modals states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAwsModalOpen, setIsAwsModalOpen] = useState(false);

  // Form states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [awsCredentials, setAwsCredentials] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Add form fields
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    designation: '',
  });

  // Edit form fields
  const [editForm, setEditForm] = useState({
    employeeId: '',
    phone: '',
    department: '',
    designation: '',
    manager: '',
    role: '',
    status: '',
    onboardingStatus: ''
  });

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeeService.getList({
        page,
        limit: 10,
        search,
        department,
        status
      });
      setEmployees(res.employeeList || []);
      setTotalPages(res.totalPages || 1);
      setTotalEmployees(res.totalEmployee || 0);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles list
  const fetchRoles = async () => {
    try {
      const res = await roleService.getList({ limit: 100 });
      setRoles(res.roleList || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const options = await departmentService.getOptions();
      setDepartmentOptions(options);
      setAddForm((current) => ({
        ...current,
        department: current.department || options[0]?.value || ''
      }));
    } catch (err) {
      console.error('Error fetching departments:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, department, status]);

  // Handle Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchEmployees();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
  }, []);

  // Actions
  const handleOpenAdd = () => {
    setAddForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      department: departmentOptions[0]?.value || '',
      designation: '',
    });
    setFormError('');
    setFormSuccess('');
    setIsAddOpen(true);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        ...addForm,
        createdBy: user?.name || 'HR'
      };
      await authService.addEmployee(payload);
      setFormSuccess('Employee added successfully!');
      setTimeout(() => {
        setIsAddOpen(false);
        fetchEmployees();
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (emp) => {
    setSelectedEmployee(emp);
    setEditForm({
      employeeId: emp.employeeId,
      phone: emp.phone || '',
      department: emp.department || '',
      designation: emp.designation || '',
      manager: emp.manager || '',
      role: typeof emp.role === 'object' ? emp.role?._id : emp.role || '',
      status: emp.status || 'Pending',
      onboardingStatus: emp.onboardingStatus || 'Pending'
    });
    setFormError('');
    setFormSuccess('');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      // Clean up empty fields that backend doesn't require or might fail on
      const payload = {
        ...editForm,
        role: editForm.role || undefined,
        manager: editForm.manager || undefined
      };
      await employeeService.update(payload);
      setFormSuccess('Employee updated successfully!');
      setTimeout(() => {
        setIsEditOpen(false);
        fetchEmployees();
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProvisionAWS = async (emp) => {
    if (!emp.role) {
      alert('Please assign an employee role in Edit Details before provisioning AWS Console access.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await awsService.provisionAccess(emp.employeeId);
      setAwsCredentials(res.credentials);
      setIsAwsModalOpen(true);
      fetchEmployees(); // reload
    } catch (err) {
      alert(err.message || 'AWS Provisioning failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  // Columns definition for Table component
  const columns = [
    {
      header: 'Employee ID',
      key: 'employeeId',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>
          {row.employeeId}
        </span>
      )
    },
    {
      header: 'Name',
      key: 'name',
      render: (row) => (
        <div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>{row.name}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</span>
        </div>
      )
    },
    { header: 'Department', key: 'department' },
    { header: 'Designation', key: 'designation' },
    {
      header: 'AWS Account',
      key: 'awsProfile',
      render: (row) => row.awsProfile ? (
        <span style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 500 }}>
          <FiCheckCircle style={{ color: '#10b981' }} /> Provisioned
        </span>
      ) : (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Onboarding',
      key: 'onboardingStatus',
      render: (row) => <StatusBadge status={row.onboardingStatus} />
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate(`/hr/employees/${row._id}`)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', height: '32px' }}
            title="View Details"
          >
            <FiEye size={14} />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', height: '32px' }}
            title="Edit Details"
          >
            <FiEdit size={14} />
          </button>
          {!row.awsProfile && (
            <button
              onClick={() => handleProvisionAWS(row)}
              className="btn btn-primary"
              style={{ padding: '6px 10px', height: '32px', background: '#097969' }}
              title="Provision AWS IAM"
            >
              <FiCloud size={14} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '32px' }}>
      <PageHeader
        title="Directory & Onboarding Status"
        subtitle={`Total hires: ${totalEmployees}`}
        actions={
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <FiUserPlus size={16} /> Add Employee
          </button>
        }
      />

      {/* Filter and Search controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, ID or email..." />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <FilterBar
            options={[{ value: '', label: 'All Departments' }, ...departmentOptions]}
            value={department}
            onChange={(val) => { setDepartment(val); setPage(1); }}
            label="Department"
          />
          <FilterBar
            options={STATUSES}
            value={status}
            onChange={(val) => { setStatus(val); setPage(1); }}
            label="Status"
          />
        </div>
      </div>

      {/* Reusable Data Table */}
      <Table
        columns={columns}
        data={employees}
        isLoading={loading}
        emptyTitle="No Employees Found"
        emptyDescription="Try adjusting your search terms or filters to find records."
      />

      {/* Pagination component */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* DRAWER: Add Employee */}
      <Drawer isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Register New Hire">
        <form onSubmit={handleAddSubmit}>
          {formError && <div className="alert alert-danger">{formError}</div>}
          {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              className="form-control"
              placeholder="Alice Johnson"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              className="form-control"
              placeholder="alice.johnson@company.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Temporary Password</label>
            <input
              type="password"
              required
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              className="form-control"
              placeholder="Create secure password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="number"
              value={addForm.phone}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
              className="form-control"
              placeholder="9876543210"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              value={addForm.department}
              onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
              className="form-control"
            >
              {departmentOptions.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            {departmentOptions.length === 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                No departments exist in the database yet.
              </span>
            )}
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Job Designation</label>
            <input
              type="text"
              required
              value={addForm.designation}
              onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
              className="form-control"
              placeholder="Software Engineer II"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', height: '44px' }}>
            {submitting ? 'Creating Profile...' : 'Create Employee Profile'}
          </button>
        </form>
      </Drawer>

      {/* DRAWER: Edit Employee */}
      <Drawer isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit: ${selectedEmployee?.name}`}>
        <form onSubmit={handleEditSubmit}>
          {formError && <div className="alert alert-danger">{formError}</div>}
          {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <input type="text" disabled value={editForm.employeeId} className="form-control" style={{ opacity: 0.6 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="number"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <select
              value={editForm.department}
              onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
              className="form-control"
            >
              {departmentOptions.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Job Designation</label>
            <input
              type="text"
              required
              value={editForm.designation}
              onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Employee Role Name</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="form-control"
            >
              <option value="">No Role Assigned</option>
              {roles.map(r => (
                <option key={r._id} value={r._id}>{r.roleName} ({r.awsGroupName})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Employment Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              className="form-control"
            >
              <option value="Pending">Pending</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Onboarding Status</label>
            <select
              value={editForm.onboardingStatus}
              onChange={(e) => setEditForm({ ...editForm, onboardingStatus: e.target.value })}
              className="form-control"
            >
              <option value="Pending">Pending</option>
              <option value="Documents Pending">Documents Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', height: '44px' }}>
            {submitting ? 'Saving Details...' : 'Save Employee Details'}
          </button>
        </form>
      </Drawer>

      {/* MODAL: AWS Credentials */}
      <Modal isOpen={isAwsModalOpen} onClose={() => setIsAwsModalOpen(false)} title="AWS IAM Account Created">
        <div>
          <div className="alert alert-success" style={{ marginBottom: '24px' }}>
            <span>AWS IAM Console access has been provisioned. Please copy the credentials below.</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Console URL</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{awsCredentials?.consoleUrl}</span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => copyToClipboard(awsCredentials?.consoleUrl, 'Console URL')}>
                <FiCopy />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>IAM User Name</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{awsCredentials?.iamUserName}</span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => copyToClipboard(awsCredentials?.iamUserName, 'IAM Username')}>
                <FiCopy />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Temporary Password</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace' }}>{awsCredentials?.temporaryPassword}</span>
              </div>
              <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => copyToClipboard(awsCredentials?.temporaryPassword, 'Temporary Password')}>
                <FiCopy />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>IAM Group Name</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{awsCredentials?.iamGroup}</span>
              </div>
              <div style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Region</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{awsCredentials?.region}</span>
              </div>
            </div>

          </div>

          <button onClick={() => setIsAwsModalOpen(false)} className="btn btn-primary" style={{ width: '100%', height: '44px', marginTop: '24px' }}>
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeesList;
