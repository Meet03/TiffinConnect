import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faUser, faMapMarkerAlt, faPhone,
  faCircle, faCamera, faCheckCircle, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import './DriverProfile.css';

const STATUS_OPTIONS = [
  { value: 'available',   label: 'Available',   color: '#27ae60' },
  { value: 'on delivery', label: 'On Delivery',  color: '#2980b9' },
  { value: 'off duty',    label: 'Off Duty',     color: '#95a5a6' },
];

const DriverProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', address: '', phoneNumber: '', currentStatus: 'available' });
  const [photo, setPhoto]           = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage]       = useState('');
  const [msgType, setMsgType]       = useState('');
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/driver/profile');
        setFormData({
          name:          res.data.user?.name          || '',
          address:       res.data.user?.address       || res.data.address || '',
          phoneNumber:   res.data.phoneNumber         || '',
          currentStatus: res.data.currentStatus       || 'available',
        });
        if (res.data.profilePhoto) {
          setPreviewUrl(`http://localhost:5000${res.data.profilePhoto}`);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setPhoto(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await axios.put('/driver/profile', formData);
      if (photo instanceof File) {
        const fd = new FormData();
        fd.append('profilePhoto', photo);
        await axios.post('/driver/upload-profile-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setMessage('Profile updated successfully!');
      setMsgType('success');
    } catch (err) {
      setMessage('Error updating profile. Please try again.');
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="dp-loading"><div className="dp-spinner" /><p>Loading profile...</p></div>
  );

  return (
    <div className="dp-page">
      <div className="dp-container">

        <button className="dp-back-btn" onClick={() => navigate('/driver-dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>

        <div className="dp-header">
          <h1>Driver Profile</h1>
          <p>Update your personal information and availability status</p>
        </div>

        <div className="dp-content">

          {/* Photo */}
          <div className="dp-photo-section">
            <div className="dp-photo-wrap">
              {previewUrl
                ? <img src={previewUrl} alt="Profile" className="dp-photo-img" />
                : <FontAwesomeIcon icon={faUser} className="dp-photo-placeholder" />
              }
              <label className="dp-camera-btn">
                <FontAwesomeIcon icon={faCamera} />
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
            </div>
            <p className="dp-photo-hint">Click the camera icon to update your photo</p>
          </div>

          <form onSubmit={handleSubmit} className="dp-form">

            <div className="dp-field">
              <label><FontAwesomeIcon icon={faUser} /> Full Name</label>
              <input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
            </div>

            <div className="dp-field">
              <label><FontAwesomeIcon icon={faPhone} /> Phone Number</label>
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="e.g. 647-555-0101" required />
            </div>

            <div className="dp-field">
              <label><FontAwesomeIcon icon={faMapMarkerAlt} /> Address</label>
              <input name="address" value={formData.address} onChange={handleChange} placeholder="Your address" />
            </div>

            {/* Status */}
            <div className="dp-field">
              <label><FontAwesomeIcon icon={faCircle} /> Current Status</label>
              <div className="dp-status-grid">
                {STATUS_OPTIONS.map(s => (
                  <button key={s.value} type="button"
                    className={`dp-status-btn ${formData.currentStatus === s.value ? 'active' : ''}`}
                    style={formData.currentStatus === s.value ? { borderColor: s.color, background: s.color + '12', color: s.color } : {}}
                    onClick={() => setFormData({ ...formData, currentStatus: s.value })}
                  >
                    <FontAwesomeIcon icon={faCircle} style={{ fontSize: '0.5rem' }} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {message && (
              <div className={`dp-message ${msgType}`}>
                <FontAwesomeIcon icon={msgType === 'success' ? faCheckCircle : faExclamationCircle} />
                {message}
              </div>
            )}

            <div className="dp-actions">
              <button type="button" className="dp-cancel-btn" onClick={() => navigate('/driver-dashboard')}>Cancel</button>
              <button type="submit" className="dp-save-btn" disabled={saving}>
                {saving ? <span className="dp-spinner-sm" /> : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;