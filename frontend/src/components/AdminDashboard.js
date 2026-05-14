import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers, faUtensils, faReceipt, faTruck,
  faArrowRight, faBell, faUserShield, faEdit,
  faTrash, faEye, faTimes, faCheckCircle, faSearch
} from '@fortawesome/free-solid-svg-icons';
import './AdminDashboard.css';

const ROLE_COLOR = {
  customer: '#2980b9', provider: '#27ae60', driver: '#e67e22', admin: '#8e44ad',
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [users, setUsers]           = useState([]);
  const [providers, setProviders]   = useState([]);
  const [orders, setOrders]         = useState([]);
  const [drivers, setDrivers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [selectedUser, setSelected] = useState(null);
  const [editMode, setEditMode]     = useState(false);
  const [deleteConfirm, setDelConf] = useState(null);
  const [saving, setSaving]         = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [u, p, o, d] = await Promise.allSettled([
        axios.get('/admin/users'),
        axios.get('/admin/providers'),
        axios.get('/admin/orders'),
        axios.get('/admin/drivers'),
      ]);
      if (u.status === 'fulfilled') setUsers(u.value.data);
      if (p.status === 'fulfilled') setProviders(p.value.data);
      if (o.status === 'fulfilled') setOrders(o.value.data);
      if (d.status === 'fulfilled') setDrivers(d.value.data);
    } catch (err) {
      console.error('fetchAll error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await axios.get('/admin/users');
    setUsers(res.data);
  };

  const handleView = async (userId) => {
    try {
      const res = await axios.get(`/admin/users/${userId}`);
      setSelected(res.data); setEditMode(false);
    } catch (err) { console.error(err); }
  };

  const handleEdit = (user) => { setSelected({ ...user }); setEditMode(true); };

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

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { icon: faUsers,    label: 'Total Users',  value: users.length,     color: '#2980b9', path: '/admin/users',  filter: 'all'      },
    { icon: faUtensils, label: 'Providers',     value: providers.length, color: '#27ae60', path: '/admin/users',  filter: 'provider' },
    { icon: faReceipt,  label: 'Total Orders',  value: orders.length,    color: '#e67e22', path: '/admin/orders', filter: null       },
    { icon: faTruck,    label: 'Drivers',       value: drivers.length,   color: '#8e44ad', path: '/admin/users',  filter: 'driver'   },
  ];

  if (loading) return (
    <div className="ad-loading"><div className="ad-spinner" /><p>Loading admin dashboard...</p></div>
  );

  return (
    <div className="ad-page">

      {/* Header */}
      <div className="ad-header">
        <div className="ad-header-left">
          <div className="ad-avatar"><FontAwesomeIcon icon={faUserShield} /></div>
          <div>
            <p className="ad-greeting">Admin Panel ⚙️</p>
            <h1 className="ad-name">Tiffin Connect</h1>
          </div>
        </div>
        <button className="ad-notify-btn"><FontAwesomeIcon icon={faBell} /></button>
      </div>

      {/* Stats */}
      <div className="ad-stats">
        {stats.map((s, i) => (
          <div
            className="ad-stat-card clickable"
            key={i}
            onClick={() => navigate(s.path, { state: { filter: s.filter } })}
          >
            <div className="ad-stat-icon" style={{ background: s.color + '18', color: s.color }}>
              <FontAwesomeIcon icon={s.icon} />
            </div>
            <div className="ad-stat-value">{s.value}</div>
            <div className="ad-stat-label">{s.label}</div>
            <FontAwesomeIcon icon={faArrowRight} className="ad-stat-arrow" />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="ad-section">
        <h2 className="ad-section-title">Quick Actions</h2>
        <div className="ad-quick-actions">
          <button className="ad-quick-btn primary" onClick={() => navigate('/admin/orders')}>
            <FontAwesomeIcon icon={faReceipt} />
            <div><span>Manage Orders</span><span>Assign drivers, view all orders</span></div>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
          <button className="ad-quick-btn" onClick={() => navigate('/admin/users')}>
            <FontAwesomeIcon icon={faUsers} />
            <div><span>Manage Users</span><span>View and edit all users</span></div>
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="ad-section">
        <div className="ad-section-header">
          <h2 className="ad-section-title">All Users</h2>
          <div className="ad-search-wrap">
            <FontAwesomeIcon icon={faSearch} className="ad-search-icon" />
            <input className="ad-search" placeholder="Search users..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="ad-empty-row">No users found.</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td className="ad-td-name">{user.name}</td>
                    <td className="ad-td-email">{user.email}</td>
                    <td>
                      <span className="ad-role-badge" style={{ background: (ROLE_COLOR[user.role] || '#888') + '18', color: ROLE_COLOR[user.role] || '#888' }}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="ad-actions-row">
                        <button className="ad-btn-view"   onClick={() => handleView(user._id)}><FontAwesomeIcon icon={faEye} /></button>
                        <button className="ad-btn-edit"   onClick={() => handleEdit(user)}><FontAwesomeIcon icon={faEdit} /></button>
                        <button className="ad-btn-delete" onClick={() => setDelConf(user._id)}><FontAwesomeIcon icon={faTrash} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View/Edit Modal */}
      {selectedUser && (
        <div className="ad-modal-overlay">
          <div className="ad-modal">
            <div className="ad-modal-header">
              <h3>{editMode ? 'Edit User' : 'User Details'}</h3>
              <button className="ad-modal-close" onClick={() => setSelected(null)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="ad-modal-body">
              <div className="ad-modal-field">
                <label>Name</label>
                <input type="text" value={selectedUser.name || ''}
                  onChange={e => setSelected({ ...selectedUser, name: e.target.value })}
                  readOnly={!editMode} className={editMode ? '' : 'readonly'} />
              </div>
              <div className="ad-modal-field">
                <label>Email</label>
                <input type="email" value={selectedUser.email || ''}
                  onChange={e => setSelected({ ...selectedUser, email: e.target.value })}
                  readOnly={!editMode} className={editMode ? '' : 'readonly'} />
              </div>
              <div className="ad-modal-field">
                <label>Role</label>
                {editMode ? (
                  <select value={selectedUser.role || ''} onChange={e => setSelected({ ...selectedUser, role: e.target.value })}>
                    <option value="customer">Customer</option>
                    <option value="provider">Provider</option>
                    <option value="driver">Driver</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <input type="text" value={selectedUser.role || ''} readOnly className="readonly" />
                )}
              </div>
            </div>
            <div className="ad-modal-footer">
              {editMode ? (
                <>
                  <button className="ad-modal-cancel" onClick={() => setSelected(null)}>Cancel</button>
                  <button className="ad-modal-save" onClick={handleSave} disabled={saving}>
                    {saving ? <span className="ad-spinner-sm" /> : <><FontAwesomeIcon icon={faCheckCircle} /> Save</>}
                  </button>
                </>
              ) : (
                <>
                  <button className="ad-modal-cancel" onClick={() => setSelected(null)}>Close</button>
                  <button className="ad-modal-save" onClick={() => setEditMode(true)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="ad-modal-overlay">
          <div className="ad-modal small">
            <h3>Delete User?</h3>
            <p>This action cannot be undone.</p>
            <div className="ad-modal-footer">
              <button className="ad-modal-cancel" onClick={() => setDelConf(null)}>Cancel</button>
              <button className="ad-modal-delete" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;