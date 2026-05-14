import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faReceipt, faCheckCircle,
  faClock, faTruck, faUtensils,
  faCalendar, faUser, faClipboardList, faFilter
} from '@fortawesome/free-solid-svg-icons';
import './ProviderOrders.css';

const STATUS_CONFIG = {
  pending:   { icon: faClock,       color: '#e67e22', label: 'Pending'   },
  assigned:  { icon: faTruck,       color: '#2980b9', label: 'Assigned'  },
  completed: { icon: faCheckCircle, color: '#27ae60', label: 'Completed' },
};

const ProviderOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/provider/orders');
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    assigned:  orders.filter(o => o.status === 'assigned').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="po-loading">
        <div className="po-spinner" />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="po-loading">
        <p className="po-error-msg">{error}</p>
        <button className="po-retry-btn" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="po-page">
      <div className="po-container">

        <button className="po-back-btn" onClick={() => navigate('/provider-dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>

        <div className="po-header">
          <div>
            <h1>Manage Orders</h1>
            <p>{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
          </div>
          <FontAwesomeIcon icon={faReceipt} className="po-header-icon" />
        </div>

        {/* Filter tabs */}
        <div className="po-filters">
          {['all', 'pending', 'assigned', 'completed'].map((f) => (
            <button
              key={f}
              className={`po-filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              style={filter === f && f !== 'all'
                ? { borderColor: STATUS_CONFIG[f]?.color, color: STATUS_CONFIG[f]?.color, background: STATUS_CONFIG[f]?.color + '12' }
                : {}
              }
            >
              {f === 'all'
                ? <><FontAwesomeIcon icon={faClipboardList} /> All</>
                : <><FontAwesomeIcon icon={STATUS_CONFIG[f].icon} /> {STATUS_CONFIG[f].label}</>
              }
              <span className="po-filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="po-empty">
            <FontAwesomeIcon icon={faUtensils} />
            <h3>{filter === 'all' ? 'No orders yet' : `No ${filter} orders`}</h3>
            <p>{filter === 'all'
              ? 'Orders will appear here once customers subscribe to your plans.'
              : `You don't have any ${filter} orders right now.`}
            </p>
          </div>
        ) : (
          <div className="po-list">
            {filteredOrders.map((order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <div className="po-card" key={order._id}>
                  <div className="po-card-accent" style={{ background: status.color }} />
                  <div className="po-card-body">
                    <div className="po-card-top">
                      <div className="po-card-icon" style={{ background: status.color + '18', color: status.color }}>
                        <FontAwesomeIcon icon={status.icon} />
                      </div>
                      <div className="po-card-info">
                        <div className="po-customer">
                          <FontAwesomeIcon icon={faUser} />
                          {order.customerId?.name || 'Customer'}
                        </div>
                        <div className="po-plan">
                          <FontAwesomeIcon icon={faUtensils} />
                          {order.subscriptionPlanId?.planName || 'Subscription Plan'}
                        </div>
                      </div>
                      <span className="po-status-badge" style={{ background: status.color + '18', color: status.color }}>
                        {status.label}
                      </span>
                    </div>
                    <div className="po-card-divider" />
                    <div className="po-card-dates">
                      <div className="po-date-item">
                        <FontAwesomeIcon icon={faCalendar} />
                        <div>
                          <span className="po-date-label">Start</span>
                          <span className="po-date-value">{new Date(order.startDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className="po-date-arrow">→</div>
                      <div className="po-date-item">
                        <FontAwesomeIcon icon={faCalendar} />
                        <div>
                          <span className="po-date-label">End</span>
                          <span className="po-date-value">{new Date(order.endDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="po-order-id">Order ID: <span>{order._id}</span></div>
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

export default ProviderOrders;