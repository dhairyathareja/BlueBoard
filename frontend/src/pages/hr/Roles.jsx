import React, { useEffect, useState } from 'react';
import { FiAward, FiPlus, FiEdit, FiTrash2, FiShield } from 'react-icons/fi';
import PageHeader from '../../components/layout/PageHeader';
import Table from '../../components/ui/Table';
import SearchBar from '../../components/ui/SearchBar';
import Drawer from '../../components/ui/Drawer';
import Loader from '../../components/ui/Loader';
import roleService from '../../services/role.service';
import { PERMISSIONS } from '../../utils/permissions';

const PERMISSION_OPTIONS = Object.values(PERMISSIONS);

const RolesList = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Form states
  const [addForm, setAddForm] = useState({
    roleName: '',
    awsGroupName: '',
    description: '',
    permissions: []
  });

  const [selectedRole, setSelectedRole] = useState(null);
  const [editForm, setEditForm] = useState({
    roleId: '',
    awsGroupName: '',
    description: '',
    permissions: []
  });

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await roleService.getList({ search, limit: 100 });
      setRoles(res.roleList || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRoles();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleOpenAdd = () => {
    setAddForm({
      roleName: '',
      awsGroupName: '',
      description: '',
      permissions: []
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
      await roleService.add(addForm);
      setFormSuccess('Role created successfully!');
      setTimeout(() => {
        setIsAddOpen(false);
        fetchRoles();
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (roleItem) => {
    setSelectedRole(roleItem);
    setEditForm({
      roleId: roleItem._id,
      awsGroupName: roleItem.awsGroupName,
      description: roleItem.description || '',
      permissions: roleItem.permissions || []
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
      await roleService.update(editForm);
      setFormSuccess('Role updated successfully!');
      setTimeout(() => {
        setIsEditOpen(false);
        fetchRoles();
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role? This cannot be undone.')) return;
    try {
      await roleService.delete(roleId);
      fetchRoles();
      alert('Role deleted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to delete role.');
    }
  };

  const handlePermissionChange = (perm, type) => {
    const form = type === 'add' ? addForm : editForm;
    const setForm = type === 'add' ? setAddForm : setEditForm;
    
    let updatedPerms;
    if (form.permissions.includes(perm)) {
      updatedPerms = form.permissions.filter(p => p !== perm);
    } else {
      updatedPerms = [...form.permissions, perm];
    }
    
    setForm({ ...form, permissions: updatedPerms });
  };

  const columns = [
    {
      header: 'Role Name',
      key: 'roleName',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {row.roleName}
        </span>
      )
    },
    {
      header: 'AWS IAM Group',
      key: 'awsGroupName',
      render: (row) => (
        <span style={{ color: '#06b6d4', fontWeight: 500, fontFamily: 'monospace' }}>
          {row.awsGroupName}
        </span>
      )
    },
    { header: 'Description', key: 'description' },
    {
      header: 'Granted Permissions',
      key: 'permissions',
      render: (row) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {row.permissions && row.permissions.length > 0 ? (
            row.permissions.map(p => (
              <span key={p} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', color: 'var(--primary)', borderRadius: '4px' }}>
                {p}
              </span>
            ))
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No Permissions</span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleOpenEdit(row)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', height: '32px' }}
            title="Edit Role"
          >
            <FiEdit size={14} />
          </button>
          <button
            onClick={() => handleDeleteRole(row._id)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', height: '32px', color: '#ef4444' }}
            title="Delete Role"
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
        title="Access Roles & Policies"
        subtitle="Configure enterprise permissions mapping to AWS IAM Group Policies."
        actions={
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <FiPlus size={16} /> Create Role
          </button>
        }
      />

      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'flex-start' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Search by role name..." />
      </div>

      <Table
        columns={columns}
        data={roles}
        isLoading={loading}
        emptyTitle="No Roles Configured"
        emptyDescription="Create authorization profiles to assign to employees."
      />

      {/* DRAWER: Add Role */}
      <Drawer isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Role">
        <form onSubmit={handleAddSubmit}>
          {formError && <div className="alert alert-danger">{formError}</div>}
          {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

          <div className="form-group">
            <label className="form-label">Role Name</label>
            <input
              type="text"
              required
              value={addForm.roleName}
              onChange={(e) => setAddForm({ ...addForm, roleName: e.target.value })}
              className="form-control"
              placeholder="Engineering Manager"
            />
          </div>

          <div className="form-group">
            <label className="form-label">AWS IAM Group Name</label>
            <input
              type="text"
              required
              value={addForm.awsGroupName}
              onChange={(e) => setAddForm({ ...addForm, awsGroupName: e.target.value })}
              className="form-control"
              placeholder="bb-engineering-managers"
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Must match an existing group policy configured in AWS IAM.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Role Description</label>
            <textarea
              required
              value={addForm.description}
              onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
              className="form-control"
              placeholder="Access level for core developers"
              rows={3}
              style={{ resize: 'none' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Granular Permissions</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {PERMISSION_OPTIONS.map(perm => (
                <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={addForm.permissions.includes(perm)}
                    onChange={() => handlePermissionChange(perm, 'add')}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  {perm.replace('_', ' ')}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', height: '44px' }}>
            {submitting ? 'Creating Role...' : 'Create Role'}
          </button>
        </form>
      </Drawer>

      {/* DRAWER: Edit Role */}
      <Drawer isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit: ${selectedRole?.roleName}`}>
        <form onSubmit={handleEditSubmit}>
          {formError && <div className="alert alert-danger">{formError}</div>}
          {formSuccess && <div className="alert alert-success">{formSuccess}</div>}

          <div className="form-group">
            <label className="form-label">Role Name</label>
            <input type="text" disabled value={selectedRole?.roleName} className="form-control" style={{ opacity: 0.6 }} />
          </div>

          <div className="form-group">
            <label className="form-label">AWS IAM Group Name</label>
            <input
              type="text"
              required
              value={editForm.awsGroupName}
              onChange={(e) => setEditForm({ ...editForm, awsGroupName: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Description</label>
            <textarea
              required
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="form-control"
              rows={3}
              style={{ resize: 'none' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label className="form-label">Granular Permissions</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {PERMISSION_OPTIONS.map(perm => (
                <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editForm.permissions.includes(perm)}
                    onChange={() => handlePermissionChange(perm, 'edit')}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                  />
                  {perm.replace('_', ' ')}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', height: '44px' }}>
            {submitting ? 'Updating Role...' : 'Save Role details'}
          </button>
        </form>
      </Drawer>
    </div>
  );
};

export default RolesList;
