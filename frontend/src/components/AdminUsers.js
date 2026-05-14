import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faUsers, faSearch, faEdit,
  faTrash, faEye, faTimes, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './AdminUsers.css';

const ROLE_COLOR = {
  customer: '#2980b9', provider: '#27ae60', driver: '#e67e22', admin: '#8e44ad',
};

const AdminUsers = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState(location.state?.filter || 'all');
  const [selectedUser, setSelected] = useState(null);
  const [editMode, setEditMode]     = useState(false);
  const [deleteConfirm, setDelConf] = useState(null);
  const [saving, setSaving]         = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (userId) => {
    try {
      const res = await axios.get(`/admin/users/${userId}`);
      setSelected(res.data); setEditMode(false);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`/admin/users/${selectedUser._id}`, selectedUser);
      setSelected(null); setEditMode(false);
      fetchUsers();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      setDelConf(null);
    } catch (err) { console.error(err); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    all:      users.length,
    customer: users.filter(u => u.role === 'customer').length,
    provider: users.filter(u => u.role === 'provider').length,
    driver:   users.filter(u => u.role === 'driver').length,
    admin:    users.filter(u => u.role === 'admin').length,
  };

  if (loading) return <div className="au-loading"><div className="au-spinner" /><p>Loading users...</p></div>;
  if (error)   return <div className="au-loading"><p className="au-err">{error}</p></div>;

  return (
    <div className="au-page">
      <div className="au-container">

        <button className="au-back-btn" onClick={() => navigate('/admin-dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>

        <div className="au-header">
          <div>
            <h1>Manage Users</h1>
            <p>{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
          </div>
          <FontAwesomeIcon icon={faUsers} className="au-header-icon" />
        </div>

        {/* Search + Filter */}
        <div className="au-controls">
          <div className="au-search-wrap">
            <FontAwesomeIcon icon={faSearch} className="au-search-icon" />
            <input className="au-search" placeholder="Search by name or email..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="au-role-tabs">
            {['all', 'customer', 'provider', 'driver', 'admin'].map(r => (
              <button key={r} className={`au-role-tab ${roleFilter === r ? 'active' : ''}`}
                style={roleFilter === r && r !== 'all'
                  ? { borderColor: ROLE_COLOR[r], color: ROLE_COLOR[r], background: ROLE_COLOR[r] + '12' }
                  : {}}
                onClick={() => setRoleFilter(r)}
              >
                {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                <span className="au-role-count">{counts[r]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="au-table-wrap">
          <table className="au-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="5" className="au-empty-row">No users found.</td></tr>
              ) : (
                filtered.map(user => (
                  <tr key={user._id}>
                    <td className="au-td-name">{user.name}</td>
                    <td className="au-td-email">{user.email}</td>
                    <td>
                      <span className="au-role-badge" style={{ background: (ROLE_COLOR[user.role] || '#888') + '18', color: ROLE_COLOR[user.role] || '#888' }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`au-status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="au-actions-row">
                        <button className="au-btn-view"   onClick={() => handleView(user._id)}><FontAwesomeIcon icon={faEye} /></button>
                        <button className="au-btn-edit"   onClick={() => { setSelected({ ...user }); setEditMode(true); }}><FontAwesomeIcon icon={faEdit} /></button>
                        <button className="au-btn-delete" onClick={() => setDelConf(user._id)}><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* View/Edit Modal */}
        {selectedUser && (
          <div className="au-modal-overlay">
            <div className="au-modal">
              <div className="au-modal-header">
                <h3>{editMode ? 'Edit User' : 'User Details'}</h3>
                <button className="au-modal-close" onClick={() => setSelected(null)}><FontAwesomeIcon icon={faTimes} /></button>
              </div>
              <div className="au-modal-body">
                <div className="au-modal-field">
                  <label>Name</label>
                  <input type="text" value={selectedUser.name || ''} readOnly={!editMode}
                    className={!editMode ? 'readonly' : ''}
                    onChange={e => setSelected({ ...selectedUser, name: e.target.value })} />
                </div>
                <div className="au-modal-field">
                  <label>Email</label>
                  <input type="email" value={selectedUser.email || ''} readOnly={!editMode}
                    className={!editMode ? 'readonly' : ''}
                    onChange={e => setSelected({ ...selectedUser, email: e.target.value })} />
                </div>
                <div className="au-modal-field">
                  <label>Role</label>
                  {editMode ? (
                    <select value={selectedUser.role || ''} onChange={e => setSelected({ ...selectedUser, role: e.target.value })}>
                      <option value="customer">Customer</option>
                      <option value="provider">Provider</option>
                      <option value="driver">Driver</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <input value={selectedUser.role || ''} readOnly className="readonly" />
                  )}
                </div>
                {selectedUser.contactNumber && (
                  <div className="au-modal-field">
                    <label>Phone</label>
                    <input value={selectedUser.contactNumber} readOnly className="readonly" />
                  </div>
                )}
              </div>
              <div className="au-modal-footer">
                <button className="au-modal-cancel" onClick={() => setSelected(null)}>
                  {editMode ? 'Cancel' : 'Close'}
                </button>
                {editMode ? (
                  <button className="au-modal-save" onClick={handleSave} disabled={saving}>
                    {saving ? <span className="au-spinner-sm" /> : <><FontAwesomeIcon icon={faCheckCircle} /> Save</>}
                  </button>
                ) : (
                  <button className="au-modal-save" onClick={() => setEditMode(true)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {deleteConfirm && (
          <div className="au-modal-overlay">
            <div className="au-modal small">
              <h3>Delete User?</h3>
              <p>This action cannot be undone.</p>
              <div className="au-modal-footer">
                <button className="au-modal-cancel" onClick={() => setDelConf(null)}>Cancel</button>
                <button className="au-modal-delete" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminUsers;