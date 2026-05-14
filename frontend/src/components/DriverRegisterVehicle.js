import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faCar, faIdCard, faMapMarkerAlt,
  faPhone, faCheckCircle, faExclamationCircle, faTruck, faMotorcycle
} from '@fortawesome/free-solid-svg-icons';
import './DriverRegisterVehicle.css';

const VEHICLE_TYPES = [
  { value: 'Car',   icon: faCar,        label: 'Car'   },
  { value: 'Van',   icon: faTruck,      label: 'Van'   },
  { value: 'Bike',  icon: faMotorcycle, label: 'Bike'  },
  { value: 'Truck', icon: faTruck,      label: 'Truck' },
];

const DriverRegisterVehicle = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleType: '', licenseNumber: '', deliveryRadius: '', phoneNumber: '',
  });
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get('/driver/profile');
        setFormData({
          vehicleType:    res.data.vehicleType    || '',
          licenseNumber:  res.data.licenseNumber  || '',
          deliveryRadius: res.data.deliveryRadius || '',
          phoneNumber:    res.data.phoneNumber    || '',
        });
      } catch (err) {
        console.error('Error fetching vehicle data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await axios.post('/driver/registerVehicle', formData);
      setMessage('Vehicle information saved successfully!');
      setMsgType('success');
    } catch (err) {
      setMessage('Error saving vehicle info. Please try again.');
      setMsgType('error');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="drv-loading"><div className="drv-spinner" /><p>Loading vehicle info...</p></div>
  );

  return (
    <div className="drv-page">
      <div className="drv-container">

        <button className="drv-back-btn" onClick={() => navigate('/driver-dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>

        <div className="drv-header">
          <h1>Vehicle Information</h1>
          <p>Register or update your vehicle details for deliveries</p>
        </div>

        <div className="drv-content">

          {/* Vehicle type selector */}
          <div className="drv-field">
            <label>Vehicle Type</label>
            <div className="drv-vehicle-grid">
              {VEHICLE_TYPES.map(v => (
                <button key={v.value} type="button"
                  className={`drv-vehicle-btn ${formData.vehicleType === v.value ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, vehicleType: v.value })}
                >
                  <FontAwesomeIcon icon={v.icon} className="drv-vehicle-icon" />
                  <span>{v.label}</span>
                  {formData.vehicleType === v.value && (
                    <FontAwesomeIcon icon={faCheckCircle} className="drv-vehicle-check" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="drv-form">

            <div className="drv-row">
              <div className="drv-field">
                <label><FontAwesomeIcon icon={faIdCard} /> License Number</label>
                <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange}
                  placeholder="e.g. ABCD-1234" required />
              </div>
              <div className="drv-field">
                <label><FontAwesomeIcon icon={faMapMarkerAlt} /> Delivery Radius (km)</label>
                <input name="deliveryRadius" type="number" value={formData.deliveryRadius} onChange={handleChange}
                  placeholder="e.g. 10" required min="1" />
              </div>
            </div>

            <div className="drv-field">
              <label><FontAwesomeIcon icon={faPhone} /> Phone Number</label>
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                placeholder="e.g. 647-555-0101" required />
            </div>

            {message && (
              <div className={`drv-message ${msgType}`}>
                <FontAwesomeIcon icon={msgType === 'success' ? faCheckCircle : faExclamationCircle} />
                {message}
              </div>
            )}

            <div className="drv-actions">
              <button type="button" className="drv-cancel-btn" onClick={() => navigate('/driver-dashboard')}>Cancel</button>
              <button type="submit" className="drv-save-btn" disabled={saving}>
                {saving ? <span className="drv-spinner-sm" /> : 'Save Vehicle Info'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default DriverRegisterVehicle;