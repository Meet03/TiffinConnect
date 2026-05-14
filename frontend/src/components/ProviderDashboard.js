import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProviderProfile, getMenuItems, getSubscriptionPlans } from '../api';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUtensils, faClipboardList, faReceipt, faUser,
  faArrowRight, faBell, faStar, faTruck,
  faCheckCircle, faClock, faExclamationCircle,
  faStore, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import './ProviderDashboard.css';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile]                 = useState(null);
  const [menuItems, setMenuItems]             = useState([]);
  const [subscriptionPlans, setPlans]         = useState([]);
  const [orders, setOrders]                   = useState([]);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, menuRes, plansRes, ordersRes] = await Promise.allSettled([
          getProviderProfile(),
          getMenuItems(),
          getSubscriptionPlans(),
          axios.get('/provider/orders'),
        ]);
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
        if (menuRes.status   === 'fulfilled') setMenuItems(menuRes.value.data);
        if (plansRes.status  === 'fulfilled') setPlans(plansRes.value.data);
        if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data);
      } catch (err) {
        if (err.response?.status === 401) {
          sessionStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const pendingOrders   = orders.filter(o => o.status === 'pending');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const stats = [
    { icon: faUtensils,     label: 'Menu Items',       value: menuItems.length,         color: '#e67e22' },
    { icon: faClipboardList,label: 'Active Plans',     value: subscriptionPlans.length, color: '#2980b9' },
    { icon: faReceipt,      label: 'Total Orders',     value: orders.length,            color: '#8e44ad' },
    { icon: faCheckCircle,  label: 'Completed Orders', value: completedOrders.length,   color: '#27ae60' },
  ];

  const actions = [
    { icon: faUser,          label: 'My Profile',        desc: 'Update restaurant info',   path: '/provider-profile',    primary: false },
    { icon: faUtensils,      label: 'Manage Menu',       desc: 'Add or edit menu items',   path: '/menu-items',          primary: true  },
    { icon: faClipboardList, label: 'Subscription Plans',desc: 'Manage your meal plans',   path: '/subscription-plans',  primary: false },
    { icon: faReceipt,       label: 'View Orders',       desc: 'See incoming orders',      path: '/provider-orders',     primary: false },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#27ae60';
      case 'assigned':  return '#2980b9';
      default:          return '#e67e22';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return faCheckCircle;
      case 'assigned':  return faTruck;
      default:          return faClock;
    }
  };

  if (loading) {
    return (
      <div className="pd-loading">
        <div className="pd-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="pd-page">

      {/* Header */}
      <div className="pd-header">
        <div className="pd-header-left">
          <div className="pd-avatar">
            <FontAwesomeIcon icon={faStore} />
          </div>
          <div>
            <p className="pd-greeting">Provider Dashboard 👨‍🍳</p>
            <h1 className="pd-name">{profile?.restaurantName || 'Your Restaurant'}</h1>
          </div>
        </div>
        <button className="pd-notify-btn">
          <FontAwesomeIcon icon={faBell} />
          {pendingOrders.length > 0 && <span className="pd-notify-dot" />}
        </button>
      </div>

      {/* Stats */}
      <div className="pd-stats">
        {stats.map((s, i) => (
          <div className="pd-stat-card" key={i}>
            <div className="pd-stat-icon" style={{ background: s.color + '18', color: s.color }}>
              <FontAwesomeIcon icon={s.icon} />
            </div>
            <div className="pd-stat-value">{s.value}</div>
            <div className="pd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="pd-section">
        <h2 className="pd-section-title">Quick Actions</h2>
        <div className="pd-actions">
          {actions.map((a, i) => (
            <button
              key={i}
              className={`pd-action-btn ${a.primary ? 'primary' : ''}`}
              onClick={() => navigate(a.path)}
            >
              <div className="pd-action-icon">
                <FontAwesomeIcon icon={a.icon} />
              </div>
              <div className="pd-action-text">
                <span className="pd-action-label">{a.label}</span>
                <span className="pd-action-desc">{a.desc}</span>
              </div>
              <FontAwesomeIcon icon={faArrowRight} className="pd-action-arrow" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="pd-section">
        <div className="pd-section-header">
          <h2 className="pd-section-title">Recent Orders</h2>
          <button className="pd-see-all" onClick={() => navigate('/provider-orders')}>
            See all <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="pd-empty">
            <FontAwesomeIcon icon={faReceipt} />
            <p>No orders yet. Make sure you have active subscription plans!</p>
            <button className="pd-empty-btn" onClick={() => navigate('/subscription-plans')}>
              Manage Plans
            </button>
          </div>
        ) : (
          <div className="pd-orders-list">
            {orders.slice(0, 4).map((order) => (
              <div className="pd-order-card" key={order._id}>
                <div className="pd-order-icon" style={{ color: getStatusColor(order.status) }}>
                  <FontAwesomeIcon icon={getStatusIcon(order.status)} />
                </div>
                <div className="pd-order-info">
                  <div className="pd-order-customer">
                    {order.customerId?.name || 'Customer'}
                  </div>
                  <div className="pd-order-plan">
                    {order.subscriptionPlanId?.planName || 'Subscription Plan'}
                  </div>
                  <div className="pd-order-dates">
                    {new Date(order.startDate).toLocaleDateString()} → {new Date(order.endDate).toLocaleDateString()}
                  </div>
                </div>
                <span className="pd-order-status" style={{ background: getStatusColor(order.status) + '18', color: getStatusColor(order.status) }}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div className="pd-section">
        <h2 className="pd-section-title">Notifications</h2>
        <div className="pd-notifications">
          {pendingOrders.length > 0 ? (
            <div className="pd-notif-item">
              <div className="pd-notif-icon orange"><FontAwesomeIcon icon={faBell} /></div>
              <div>
                <div className="pd-notif-text">You have {pendingOrders.length} pending order(s) waiting for assignment.</div>
                <div className="pd-notif-time">Action needed</div>
              </div>
            </div>
          ) : null}
          {menuItems.length === 0 && (
            <div className="pd-notif-item">
              <div className="pd-notif-icon red"><FontAwesomeIcon icon={faExclamationCircle} /></div>
              <div>
                <div className="pd-notif-text">You have no menu items yet. Add meals to get started!</div>
                <div className="pd-notif-time">Setup required</div>
              </div>
            </div>
          )}
          <div className="pd-notif-item">
            <div className="pd-notif-icon green"><FontAwesomeIcon icon={faChartLine} /></div>
            <div>
              <div className="pd-notif-text">Your restaurant rating is {profile?.rating || 0} ⭐ — keep up the great work!</div>
              <div className="pd-notif-time">Performance</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProviderDashboard;