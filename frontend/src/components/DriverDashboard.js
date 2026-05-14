import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser, faTruck, faReceipt, faStar,
  faArrowRight, faBell, faCheckCircle,
  faClock, faCircle, faMapMarkerAlt,
  faPhone, faCar, faIdCard, faChartLine
} from '@fortawesome/free-solid-svg-icons';
import './DriverDashboard.css';

const STATUS_CONFIG = {
  'available':    { color: '#27ae60', label: 'Available' },
  'on delivery':  { color: '#2980b9', label: 'On Delivery' },
  'off duty':     { color: '#95a5a6', label: 'Off Duty' },
};

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.allSettled([
          axios.get('/driver/profile'),
          axios.get('/driver/orders'),
        ]);
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
        if (ordersRes.status  === 'fulfilled') setOrders(ordersRes.value.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const status = STATUS_CONFIG[profile?.currentStatus] || STATUS_CONFIG['off duty'];
  const assignedOrders  = orders.filter(o => o.status === 'assigned');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const stats = [
    { icon: faTruck,      label: 'Assigned Orders',    value: assignedOrders.length,           color: '#2980b9' },
    { icon: faCheckCircle,label: 'Completed Deliveries',value: profile?.completedDeliveries || 0, color: '#27ae60' },
    { icon: faChartLine,  label: 'Total Earnings',      value: `$${(profile?.earnings || 0).toFixed(2)}`, color: '#8e44ad' },
    { icon: faStar,       label: 'Rating',              value: profile?.rating || 'N/A',        color: '#e67e22' },
  ];

  const actions = [
    { icon: faUser,   label: 'My Profile',       desc: 'Update personal info & photo', path: '/driver-profile',          primary: false },
    { icon: faCar,    label: 'Vehicle Info',      desc: 'Register or update vehicle',  path: '/driver-register-vehicle',  primary: true  },
    { icon: faReceipt,label: 'Assigned Orders',   desc: 'View & manage your orders',   path: '/driver-orders',            primary: false },
  ];

  if (loading) {
    return (
      <div className="dd-loading">
        <div className="dd-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dd-page">

      {/* Header */}
      <div className="dd-header">
        <div className="dd-header-left">
          <div className="dd-avatar">
            {profile?.profilePhoto
              ? <img src={`http://localhost:5000${profile.profilePhoto}`} alt="profile" />
              : <FontAwesomeIcon icon={faUser} />
            }
          </div>
          <div>
            <p className="dd-greeting">Driver Dashboard 🚗</p>
            <h1 className="dd-name">{profile?.userId?.name || 'Driver'}</h1>
            <div className="dd-status-pill" style={{ background: status.color + '18', color: status.color }}>
              <FontAwesomeIcon icon={faCircle} className="dd-status-dot" />
              {status.label}
            </div>
          </div>
        </div>
        <button className="dd-notify-btn">
          <FontAwesomeIcon icon={faBell} />
          {assignedOrders.length > 0 && <span className="dd-notify-dot" />}
        </button>
      </div>

      {/* Stats */}
      <div className="dd-stats">
        {stats.map((s, i) => (
          <div className="dd-stat-card" key={i}>
            <div className="dd-stat-icon" style={{ background: s.color + '18', color: s.color }}>
              <FontAwesomeIcon icon={s.icon} />
            </div>
            <div className="dd-stat-value">{s.value}</div>
            <div className="dd-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="dd-section">
        <h2 className="dd-section-title">Quick Actions</h2>
        <div className="dd-actions">
          {actions.map((a, i) => (
            <button key={i} className={`dd-action-btn ${a.primary ? 'primary' : ''}`} onClick={() => navigate(a.path)}>
              <div className="dd-action-icon"><FontAwesomeIcon icon={a.icon} /></div>
              <div className="dd-action-text">
                <span className="dd-action-label">{a.label}</span>
                <span className="dd-action-desc">{a.desc}</span>
              </div>
              <FontAwesomeIcon icon={faArrowRight} className="dd-action-arrow" />
            </button>
          ))}
        </div>
      </div>

      {/* Profile & Vehicle summary */}
      <div className="dd-info-row">
        <div className="dd-info-card">
          <h2 className="dd-section-title">Profile Summary</h2>
          <div className="dd-info-list">
            <div className="dd-info-item">
              <FontAwesomeIcon icon={faPhone} />
              <div>
                <span className="dd-info-label">Phone</span>
                <span className="dd-info-value">{profile?.phoneNumber || 'Not set'}</span>
              </div>
            </div>
            <div className="dd-info-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <div>
                <span className="dd-info-label">Address</span>
                <span className="dd-info-value">{profile?.address || 'Not set'}</span>
              </div>
            </div>
          </div>
          <button className="dd-edit-link" onClick={() => navigate('/driver-profile')}>
            Edit Profile <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        <div className="dd-info-card">
          <h2 className="dd-section-title">Vehicle Info</h2>
          <div className="dd-info-list">
            <div className="dd-info-item">
              <FontAwesomeIcon icon={faCar} />
              <div>
                <span className="dd-info-label">Vehicle Type</span>
                <span className="dd-info-value">{profile?.vehicleType || 'Not registered'}</span>
              </div>
            </div>
            <div className="dd-info-item">
              <FontAwesomeIcon icon={faIdCard} />
              <div>
                <span className="dd-info-label">License Number</span>
                <span className="dd-info-value">{profile?.licenseNumber || 'Not registered'}</span>
              </div>
            </div>
            <div className="dd-info-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <div>
                <span className="dd-info-label">Delivery Radius</span>
                <span className="dd-info-value">{profile?.deliveryRadius ? `${profile.deliveryRadius} km` : 'Not set'}</span>
              </div>
            </div>
          </div>
          <button className="dd-edit-link" onClick={() => navigate('/driver-register-vehicle')}>
            Update Vehicle <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
      </div>

      {/* Recent assigned orders */}
      <div className="dd-section">
        <div className="dd-section-header">
          <h2 className="dd-section-title">Assigned Orders</h2>
          <button className="dd-see-all" onClick={() => navigate('/driver-orders')}>
            See all <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="dd-empty">
            <FontAwesomeIcon icon={faTruck} />
            <p>No orders assigned yet. Check back soon!</p>
          </div>
        ) : (
          <div className="dd-orders-list">
            {orders.slice(0, 3).map(order => (
              <div className="dd-order-card" key={order._id}>
                <div className="dd-order-icon" style={{ color: '#2980b9' }}>
                  <FontAwesomeIcon icon={faTruck} />
                </div>
                <div className="dd-order-info">
                  <div className="dd-order-customer">{order.customerId?.name || order.customerId?.userId?.name || 'Customer'}</div>
                  <div className="dd-order-provider">{order.providerId?.restaurantName || 'Provider'}</div>
                </div>
                <span className="dd-order-status" style={{ background: '#2980b918', color: '#2980b9' }}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default DriverDashboard;