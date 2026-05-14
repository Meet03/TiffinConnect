import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faReceipt, faCheckCircle,
  faClock, faTruck, faUtensils, faCalendar,
  faStore, faClipboardList, faFilter
} from '@fortawesome/free-solid-svg-icons';
import './CustomerOrders.css';

const STATUS_CONFIG = {
  pending:   { icon: faClock,        color: '#e67e22', label: 'Pending'   },
  assigned:  { icon: faTruck,        color: '#2980b9', label: 'Assigned'  },
  completed: { icon: faCheckCircle,  color: '#27ae60', label: 'Completed' },
};

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [filter, setFilter]     = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/customer/orders');
        setOrders(response.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to fetch order history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    assigned:  orders.filter(o => o.status === 'assigned').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="co-loading">
        <div className="co-spinner" />
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="co-loading">
        <p className="co-error-msg">{error}</p>
        <button className="co-retry-btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="co-page">
      <div className="co-container">

        {/* Back */}
        <button className="co-back-btn" onClick={() => navigate('/customer-dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="co-header">
          <div>
            <h1>Order History</h1>
            <p>{orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
          </div>
          <FontAwesomeIcon icon={faReceipt} className="co-header-icon" />
        </div>

        {/* Filter tabs */}
        <div className="co-filters">
          {['all', 'pending', 'assigned', 'completed'].map((f) => (
            <button
              key={f}
              className={`co-filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
              style={filter === f && f !== 'all'
                ? { borderColor: STATUS_CONFIG[f]?.color, color: STATUS_CONFIG[f]?.color, background: STATUS_CONFIG[f]?.color + '12' }
                : {}
              }
            >
              {f === 'all' ? (
                <><FontAwesomeIcon icon={faClipboardList} /> All</>
              ) : (
                <><FontAwesomeIcon icon={STATUS_CONFIG[f].icon} /> {STATUS_CONFIG[f].label}</>
              )}
              <span className="co-filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="co-empty">
            <FontAwesomeIcon icon={faUtensils} />
            <h3>{filter === 'all' ? 'No orders yet' : `No ${filter} orders`}</h3>
            <p>
              {filter === 'all'
                ? 'Start by browsing available tiffin plans!'
                : `You don't have any ${filter} orders right now.`
              }
            </p>
            {filter === 'all' && (
              <button className="co-browse-btn" onClick={() => navigate('/subscription-process')}>
                Browse Tiffins
              </button>
            )}
          </div>
        ) : (
          <div className="co-list">
            {filteredOrders.map((order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <div className="co-card" key={order._id}>

                  {/* Left accent */}
                  <div className="co-card-accent" style={{ background: status.color }} />

                  <div className="co-card-body">

                    {/* Top row */}
                    <div className="co-card-top">
                      <div className="co-card-status-icon" style={{ background: status.color + '18', color: status.color }}>
                        <FontAwesomeIcon icon={status.icon} />
                      </div>
                      <div className="co-card-info">
                        <div className="co-card-provider">
                          <FontAwesomeIcon icon={faStore} />
                          {order.providerId?.restaurantName || 'Provider'}
                        </div>
                        <div className="co-card-plan">
                          <FontAwesomeIcon icon={faUtensils} />
                          {order.subscriptionPlanId?.planName || 'Subscription Plan'}
                        </div>
                      </div>
                      <span
                        className="co-status-badge"
                        style={{ background: status.color + '18', color: status.color }}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="co-card-divider" />

                    {/* Dates */}
                    <div className="co-card-dates">
                      <div className="co-date-item">
                        <FontAwesomeIcon icon={faCalendar} />
                        <div>
                          <span className="co-date-label">Start Date</span>
                          <span className="co-date-value">
                            {new Date(order.startDate).toLocaleDateString('en-CA', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="co-date-arrow">→</div>
                      <div className="co-date-item">
                        <FontAwesomeIcon icon={faCalendar} />
                        <div>
                          <span className="co-date-label">End Date</span>
                          <span className="co-date-value">
                            {new Date(order.endDate).toLocaleDateString('en-CA', {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order ID */}
                    <div className="co-order-id">
                      Order ID: <span>{order._id}</span>
                    </div>

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

export default CustomerOrders;