import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faUser, faMapMarkerAlt,
  faLeaf, faCamera, faCheckCircle, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import './CustomerProfile.css';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [name, setName]                   = useState('');
  const [address, setAddress]             = useState('');
  const [preferences, setPreferences]     = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl]       = useState(null);
  const [message, setMessage]             = useState('');
  const [messageType, setMessageType]     = useState('');
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/customer/profile');
        const { name, address, preferences, profilePicture } = response.data;
        setName(name || '');
        setAddress(address || '');
        setPreferences(preferences?.dietaryRestrictions || '');
        if (profilePicture) {
          setPreviewUrl(
            profilePicture.startsWith('http')
              ? profilePicture
              : `http://localhost:5000/${profilePicture}`
          );
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);
    formData.append('preferences', JSON.stringify({ dietaryRestrictions: preferences }));
    if (profilePicture instanceof File) {
      formData.append('profilePicture', profilePicture);
    }

    try {
      const response = await axios.put('/customer/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(response.data.message || 'Profile updated successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
      setMessageType('error');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="cp-loading">
        <div className="cp-spinner" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="cp-page">
      <div className="cp-container">

        {/* Back button */}
        <button className="cp-back-btn" onClick={() => navigate('/customer-dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="cp-header">
          <h1>My Profile</h1>
          <p>Update your personal information and preferences</p>
        </div>

        <div className="cp-content">

          {/* Avatar section */}
          <div className="cp-avatar-section">
            <div className="cp-avatar-wrap">
              {previewUrl
                ? <img src={previewUrl} alt="Profile" className="cp-avatar-img" />
                : <FontAwesomeIcon icon={faUser} className="cp-avatar-placeholder" />
              }
              <label className="cp-camera-btn" title="Change photo">
                <FontAwesomeIcon icon={faCamera} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <p className="cp-avatar-hint">Click the camera icon to change your photo</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="cp-form">

            <div className="cp-field">
              <label><FontAwesomeIcon icon={faUser} /> Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="cp-field">
              <label><FontAwesomeIcon icon={faMapMarkerAlt} /> Delivery Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your delivery address"
                required
              />
            </div>

            <div className="cp-field">
              <label><FontAwesomeIcon icon={faLeaf} /> Dietary Restrictions</label>
              <textarea
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g. Vegetarian, No nuts, Gluten-free..."
                rows={4}
              />
              <span className="cp-field-hint">
                Let your providers know about any dietary needs or allergies.
              </span>
            </div>

            {message && (
              <div className={`cp-message ${messageType}`}>
                <FontAwesomeIcon icon={messageType === 'success' ? faCheckCircle : faExclamationCircle} />
                {message}
              </div>
            )}

            <div className="cp-form-actions">
              <button
                type="button"
                className="cp-cancel-btn"
                onClick={() => navigate('/customer-dashboard')}
              >
                Cancel
              </button>
              <button type="submit" className="cp-save-btn" disabled={saving}>
                {saving ? <span className="cp-spinner-sm" /> : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;