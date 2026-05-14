import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faReceipt, faTruck, faCheckCircle,
  faClock, faUser, faStore, faCalendar, faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import './DriverOrders.css';

const STATUS_CONFIG = {
  pending:   { icon: faClock,        color: '#e67e22', label: 'Pending'   },
  assigned:  { icon: faTruck,        color: '#2980b9', label: 'Assigned'  },
  completed: { icon: faCheckCircle,  color: '#27ae60', label: 'Completed' },
};

const DriverOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/driver/orders');
        setOrders(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    assigned:  orders.filter(o => o.status === 'assigned').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  if (loading) return <div className="do-loading"><div className="do-spinner" /><p>Loading orders...</p></div>;
  if (error)   return <div className="do-loading"><p className="do-err">{error}</p><button className="do-retry" onClick={() => window.location.reload()}>Try Again</button></div>;

  return (
    <div className="do-page">
      <div className="do-container">

        <button className="do-back-btn" onClick={() => navigate('/driver-dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>

        <div className="do-header">
          <div>
            <h1>My Orders</h1>
            <p>{orders.length} order{orders.length !== 1 ? 's' : ''} assigned to you</p>
          </div>
          <FontAwesomeIcon icon={faReceipt} className="do-header-icon" />
        </div>

        {/* Filters */}
        <div className="do-filters">
          {['all','pending','assigned','completed'].map(f => (
            <button key={f} className={`do-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}
              style={filter === f && f !== 'all' ? { borderColor: STATUS_CONFIG[f]?.color, color: STATUS_CONFIG[f]?.color, background: STATUS_CONFIG[f]?.color + '12' } : {}}
            >
              {f === 'all' ? <><FontAwesomeIcon icon={faClipboardList} /> All</> : <><FontAwesomeIcon icon={STATUS_CONFIG[f].icon} /> {STATUS_CONFIG[f].label}</>}
              <span className="do-count">{counts[f]}</span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="do-empty">
            <FontAwesomeIcon icon={faTruck} />
            <h3>{filter === 'all' ? 'No orders yet' : `No ${filter} orders`}</h3>
            <p>Orders assigned to you will appear here.</p>
          </div>
        ) : (
          <div className="do-list">
            {filtered.map(order => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <div className="do-card" key={order._id}>
                  <div className="do-accent" style={{ background: st.color }} />
                  <div className="do-body">
                    <div className="do-top">
                      <div className="do-icon" style={{ background: st.color + '18', color: st.color }}>
                        <FontAwesomeIcon icon={st.icon} />
                      </div>
                      <div className="do-info">
                        <div className="do-customer"><FontAwesomeIcon icon={faUser} />{order.customerId?.name || order.customerId?.userId?.name || 'Customer'}</div>
                        <div className="do-provider"><FontAwesomeIcon icon={faStore} />{order.providerId?.restaurantName || 'Provider'}</div>
                      </div>
                      <span className="do-badge" style={{ background: st.color + '18', color: st.color }}>{st.label}</span>
                    </div>
                    <div className="do-divider" />
                    <div className="do-dates">
                      <div className="do-date"><FontAwesomeIcon icon={faCalendar} /><div><span className="do-dlabel">Start</span><span className="do-dval">{new Date(order.startDate).toLocaleDateString('en-CA', { year:'numeric', month:'short', day:'numeric' })}</span></div></div>
                      <span className="do-arrow">→</span>
                      <div className="do-date"><FontAwesomeIcon icon={faCalendar} /><div><span className="do-dlabel">End</span><span className="do-dval">{new Date(order.endDate).toLocaleDateString('en-CA', { year:'numeric', month:'short', day:'numeric' })}</span></div></div>
                    </div>
                    <div className="do-id">Order ID: <span>{order._id}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverOrders;