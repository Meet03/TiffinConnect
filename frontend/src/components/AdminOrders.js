import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faReceipt, faTruck, faCheckCircle,
  faClock, faUser, faStore, faTrash, faUserCheck,
  faClipboardList, faTimes
} from '@fortawesome/free-solid-svg-icons';
import './AdminOrders.css';

const STATUS_CONFIG = {
  pending:   { icon: faClock,       color: '#e67e22', label: 'Pending'   },
  assigned:  { icon: faTruck,       color: '#2980b9', label: 'Assigned'  },
  completed: { icon: faCheckCircle, color: '#27ae60', label: 'Completed' },
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders]         = useState([]);
  const [drivers, setDrivers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filter, setFilter]         = useState('all');
  const [deleteConfirm, setDelConf] = useState(null);
  const [assigning, setAssigning]   = useState({});
  const [assignSuccess, setSuccess] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [o, d] = await Promise.all([
          axios.get('/admin/orders'),
          axios.get('/admin/drivers'),
        ]);
        setOrders(o.data);
        setDrivers(d.data);
      } catch (err) {
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleAssign = async (orderId, driverId) => {
    if (!driverId) return;
    setAssigning(prev => ({ ...prev, [orderId]: true }));
    try {
      await axios.post('/admin/assignOrder', { orderId, driverId });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, driverId } : o));
      setSuccess(orderId);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error('Error assigning order:', err);
    } finally {
      setAssigning(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDelete = async (orderId) => {
    try {
      await axios.delete(`/admin/orders/${orderId}`);
      setOrders(prev => prev.filter(o => o._id !== orderId));
      setDelConf(null);
    } catch (err) {
      console.error('Error deleting order:', err);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts = {
    all: orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    assigned:  orders.filter(o => o.status === 'assigned').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  const getDriverName = (driverId) => {
    const d = drivers.find(d => d._id === driverId);
    return d?.userId?.name || 'Unknown';
  };

  if (loading) return <div className="ao-loading"><div className="ao-spinner" /><p>Loading orders...</p></div>;
  if (error)   return <div className="ao-loading"><p className="ao-err">{error}</p></div>;

  return (
    <div className="ao-page">
      <div className="ao-container">

        <button className="ao-back-btn" onClick={() => navigate('/admin-dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>

        <div className="ao-header">
          <div>
            <h1>Manage Orders</h1>
            <p>{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
          </div>
          <FontAwesomeIcon icon={faReceipt} className="ao-header-icon" />
        </div>

        {/* Filters */}
        <div className="ao-filters">
          {['all','pending','assigned','completed'].map(f => (
            <button key={f} className={`ao-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}
              style={filter === f && f !== 'all' ? { borderColor: STATUS_CONFIG[f]?.color, color: STATUS_CONFIG[f]?.color, background: STATUS_CONFIG[f]?.color + '12' } : {}}
            >
              {f === 'all' ? <><FontAwesomeIcon icon={faClipboardList} /> All</> : <><FontAwesomeIcon icon={STATUS_CONFIG[f].icon} /> {STATUS_CONFIG[f].label}</>}
              <span className="ao-count">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <div className="ao-empty">
            <FontAwesomeIcon icon={faReceipt} />
            <h3>No orders found</h3>
            <p>{filter === 'all' ? 'No orders in the system yet.' : `No ${filter} orders.`}</p>
          </div>
        ) : (
          <div className="ao-list">
            {filtered.map(order => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const isAssigned = assignSuccess === order._id;
              return (
                <div className="ao-card" key={order._id}>
                  <div className="ao-accent" style={{ background: st.color }} />
                  <div className="ao-body">
                    <div className="ao-top">
                      <div className="ao-icon" style={{ background: st.color + '18', color: st.color }}>
                        <FontAwesomeIcon icon={st.icon} />
                      </div>
                      <div className="ao-info">
                        <div className="ao-customer"><FontAwesomeIcon icon={faUser} />{order.customerId?.name || 'Customer'}</div>
                        <div className="ao-provider"><FontAwesomeIcon icon={faStore} />{order.providerId?.restaurantName || 'Provider'}</div>
                      </div>
                      <span className="ao-badge" style={{ background: st.color + '18', color: st.color }}>{st.label}</span>
                    </div>

                    <div className="ao-divider" />

                    {/* Driver assignment */}
                    <div className="ao-assign-row">
                      <div className="ao-driver-info">
                        <FontAwesomeIcon icon={faTruck} />
                        <span>
                          {order.driverId
                            ? <><strong>Driver:</strong> {getDriverName(order.driverId)}</>
                            : 'No driver assigned'
                          }
                        </span>
                      </div>
                      <div className="ao-assign-controls">
                        <select
                          className={`ao-driver-select ${isAssigned ? 'success' : ''}`}
                          onChange={e => handleAssign(order._id, e.target.value)}
                          value={order.driverId || ''}
                          disabled={assigning[order._id]}
                        >
                          <option value="" disabled>{order.driverId ? 'Reassign Driver' : 'Assign Driver'}</option>
                          {drivers.map(d => (
                            <option key={d._id} value={d._id}>{d.userId?.name || 'Driver'}</option>
                          ))}
                        </select>
                        {isAssigned && <span className="ao-assign-success"><FontAwesomeIcon icon={faCheckCircle} /> Assigned!</span>}
                        <button className="ao-delete-btn" onClick={() => setDelConf(order._id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </div>

                    <div className="ao-order-id">Order ID: <span>{order._id}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete modal */}
        {deleteConfirm && (
          <div className="ao-modal-overlay">
            <div className="ao-modal">
              <button className="ao-modal-x" onClick={() => setDelConf(null)}><FontAwesomeIcon icon={faTimes} /></button>
              <h3>Delete Order?</h3>
              <p>This cannot be undone.</p>
              <div className="ao-modal-actions">
                <button className="ao-modal-cancel" onClick={() => setDelConf(null)}>Cancel</button>
                <button className="ao-modal-confirm" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminOrders;