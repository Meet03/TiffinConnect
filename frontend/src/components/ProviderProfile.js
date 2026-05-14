import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProviderProfile } from '../api';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faStore, faMapMarkerAlt,
  faTruck, faCamera, faCheckCircle, faExclamationCircle
} from '@fortawesome/free-solid-svg-icons';
import './ProviderProfile.css';

const ProviderProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    restaurantName: '', address: '', deliveryOptions: '',
  });
  const [logoFile, setLogoFile]       = useState(null);
  const [previewUrl, setPreviewUrl]   = useState(null);
  const [message, setMessage]         = useState('');
  const [messageType, setType]        = useState('');
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProviderProfile();
        setProfile({
          restaurantName:  response.data.restaurantName  || '',
          address:         response.data.address         || '',
          deliveryOptions: response.data.deliveryOptions || '',
        });
        if (response.data.restaurantLogoURL) {
          const url = response.data.restaurantLogoURL.startsWith('http')
            ? response.data.restaurantLogoURL
            : `http://localhost:5000${response.data.restaurantLogoURL}`;
          setPreviewUrl(url);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const formData = new FormData();
    formData.append('restaurantName',   profile.restaurantName);
    formData.append('address',          profile.address);
    formData.append('deliveryOptions',  profile.deliveryOptions);
    if (logoFile instanceof File) {
      formData.append('restaurantLogo', logoFile);
    }

    try {
      await axios.put('/provider/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Profile updated successfully!');
      setType('success');
    } catch (error) {
      setMessage('Error updating profile. Please try again.');
      setType('error');
      console.error('Profile update error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pp-loading">
        <div className="pp-spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="pp-page">
      <div className="pp-container">

        <button className="pp-back-btn" onClick={() => navigate('/provider-dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>

        <div className="pp-header">
          <h1>Restaurant Profile</h1>
          <p>Update your restaurant information visible to customers</p>
        </div>

        <div className="pp-content">

          {/* Logo upload */}
          <div className="pp-logo-section">
            <div className="pp-logo-wrap">
              {previewUrl
                ? <img src={previewUrl} alt="Logo" className="pp-logo-img"
                    onError={(e) => { e.target.onerror = null; setPreviewUrl(null); }} />
                : <FontAwesomeIcon icon={faStore} className="pp-logo-placeholder" />
              }
              <label className="pp-camera-btn" title="Upload logo">
                <FontAwesomeIcon icon={faCamera} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <p className="pp-logo-hint">Click the camera icon to upload your restaurant logo</p>
          </div>

          <form onSubmit={handleSubmit} className="pp-form">

            <div className="pp-field">
              <label><FontAwesomeIcon icon={faStore} /> Restaurant Name</label>
              <input
                type="text"
                name="restaurantName"
                value={profile.restaurantName}
                onChange={handleChange}
                placeholder="e.g. Priya's Home Kitchen"
                required
              />
            </div>

            <div className="pp-field">
              <label><FontAwesomeIcon icon={faMapMarkerAlt} /> Address</label>
              <input
                type="text"
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="e.g. 456 Hurontario St, Mississauga, ON"
                required
              />
            </div>

            <div className="pp-field">
              <label><FontAwesomeIcon icon={faTruck} /> Delivery Options</label>
              <input
                type="text"
                name="deliveryOptions"
                value={profile.deliveryOptions}
                onChange={handleChange}
                placeholder="e.g. Home Delivery, Pickup"
              />
            </div>

            {message && (
              <div className={`pp-message ${messageType}`}>
                <FontAwesomeIcon icon={messageType === 'success' ? faCheckCircle : faExclamationCircle} />
                {message}
              </div>
            )}

            <div className="pp-actions">
              <button type="button" className="pp-cancel-btn" onClick={() => navigate('/provider-dashboard')}>
                Cancel
              </button>
              <button type="submit" className="pp-save-btn" disabled={saving}>
                {saving ? <span className="pp-spinner-sm" /> : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;