import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faReceipt, faUtensils, faBell,
  faCalendarCheck, faTruck, faStar, faArrowRight,
  faCheckCircle, faClock, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders]         = useState([]);
  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);

  const userName = sessionStorage.getItem('userName') || 'Customer';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.allSettled([
          axios.get('/customer/profile'),
          axios.get('/customer/orders'),
        ]);
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
        if (ordersRes.status  === 'fulfilled') setOrders(ordersRes.value.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeOrders    = orders.filter(o => o.status === 'pending' || o.status === 'assigned');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const stats = [
    { icon: faCalendarCheck, label: 'Active Orders',    value: activeOrders.length,    color: '#e67e22' },
    { icon: faCheckCircle,   label: 'Completed Orders', value: completedOrders.length, color: '#27ae60' },
    { icon: faReceipt,       label: 'Total Orders',     value: orders.length,          color: '#2980b9' },
    { icon: faStar,          label: 'Loyalty Points',   value: completedOrders.length * 10, color: '#8e44ad' },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return faCheckCircle;
      case 'assigned':  return faTruck;
      default:          return faClock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#27ae60';
      case 'assigned':  return '#2980b9';
      default:          return '#e67e22';
    }
  };

  if (loading) {
    return (
      <div className="cd-loading">
        <div className="cd-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="cd-page">

      {/* ── HEADER ── */}
      <div className="cd-header">
        <div className="cd-header-left">
          <div className="cd-avatar">
            {profile?.profilePicture
              ? <img src={`http://localhost:5000/${profile.profilePicture}`} alt="avatar" />
              : <FontAwesomeIcon icon={faUser} />
            }
          </div>
          <div>
            <p className="cd-greeting">Good day 👋</p>
            <h1 className="cd-name">{profile?.name || userName}</h1>
          </div>
        </div>
        <button className="cd-notify-btn">
          <FontAwesomeIcon icon={faBell} />
          <span className="cd-notify-dot" />
        </button>
      </div>

      {/* ── STATS ── */}
      <div className="cd-stats">
        {stats.map((s, i) => (
          <div className="cd-stat-card" key={i}>
            <div className="cd-stat-icon" style={{ background: s.color + '18', color: s.color }}>
              <FontAwesomeIcon icon={s.icon} />
            </div>
            <div className="cd-stat-value">{s.value}</div>
            <div className="cd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── QUICK ACTIONS ── */}
      <div className="cd-section">
        <h2 className="cd-section-title">Quick Actions</h2>
        <div className="cd-actions">
          <button className="cd-action-btn primary" onClick={() => navigate('/subscription-process')}>
            <FontAwesomeIcon icon={faUtensils} />
            <span>Browse Tiffins</span>
            <FontAwesomeIcon icon={faArrowRight} className="cd-action-arrow" />
          </button>
          <button className="cd-action-btn" onClick={() => navigate('/customer-orders')}>
            <FontAwesomeIcon icon={faReceipt} />
            <span>Order History</span>
            <FontAwesomeIcon icon={faArrowRight} className="cd-action-arrow" />
          </button>
          <button className="cd-action-btn" onClick={() => navigate('/customer-profile')}>
            <FontAwesomeIcon icon={faUser} />
            <span>My Profile</span>
            <FontAwesomeIcon icon={faArrowRight} className="cd-action-arrow" />
          </button>
        </div>
      </div>

      {/* ── RECENT ORDERS ── */}
      <div className="cd-section">
        <div className="cd-section-header">
          <h2 className="cd-section-title">Recent Orders</h2>
          <button className="cd-see-all" onClick={() => navigate('/customer-orders')}>
            See all <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="cd-empty">
            <FontAwesomeIcon icon={faUtensils} />
            <p>No orders yet. Start by browsing available tiffins!</p>
            <button className="cd-empty-btn" onClick={() => navigate('/subscription-process')}>
              Browse Tiffins
            </button>
          </div>
        ) : (
          <div className="cd-orders-list">
            {orders.slice(0, 4).map((order) => (
              <div className="cd-order-card" key={order._id}>
                <div className="cd-order-icon" style={{ color: getStatusColor(order.status) }}>
                  <FontAwesomeIcon icon={getStatusIcon(order.status)} />
                </div>
                <div className="cd-order-info">
                  <div className="cd-order-provider">
                    {order.providerId?.restaurantName || 'Provider'}
                  </div>
                  <div className="cd-order-plan">
                    {order.subscriptionPlanId?.planName || 'Subscription Plan'}
                  </div>
                  <div className="cd-order-dates">
                    {new Date(order.startDate).toLocaleDateString()} →{' '}
                    {new Date(order.endDate).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className="cd-order-status"
                  style={{
                    background: getStatusColor(order.status) + '18',
                    color: getStatusColor(order.status),
                  }}
                >
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── NOTIFICATIONS ── */}
      <div className="cd-section">
        <h2 className="cd-section-title">Notifications</h2>
        <div className="cd-notifications">
          <div className="cd-notif-item">
            <div className="cd-notif-icon orange">
              <FontAwesomeIcon icon={faBell} />
            </div>
            <div>
              <div className="cd-notif-text">Welcome to Tiffin Connect! Start by browsing tiffins.</div>
              <div className="cd-notif-time">Just now</div>
            </div>
          </div>
          {activeOrders.length > 0 && (
            <div className="cd-notif-item">
              <div className="cd-notif-icon green">
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <div>
                <div className="cd-notif-text">You have {activeOrders.length} active order(s) in progress.</div>
                <div className="cd-notif-time">Today</div>
              </div>
            </div>
          )}
          {completedOrders.length === 0 && (
            <div className="cd-notif-item">
              <div className="cd-notif-icon blue">
                <FontAwesomeIcon icon={faExclamationCircle} />
              </div>
              <div>
                <div className="cd-notif-text">Complete your first order to start earning loyalty points!</div>
                <div className="cd-notif-time">Tip</div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default CustomerDashboard;