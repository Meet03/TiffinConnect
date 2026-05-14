// VehicleRegistrationForm.js
// This component reuses the same clean form logic as DriverRegisterVehicle
import React, { useState } from 'react';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCar, faIdCard, faMapMarkerAlt, faPhone,
  faCheckCircle, faExclamationCircle, faTruck, faMotorcycle
} from '@fortawesome/free-solid-svg-icons';
import './VehicleRegistrationForm.css';

const VEHICLE_TYPES = [
  { value: 'Car',   icon: faCar,        label: 'Car'   },
  { value: 'Van',   icon: faTruck,      label: 'Van'   },
  { value: 'Bike',  icon: faMotorcycle, label: 'Bike'  },
  { value: 'Truck', icon: faTruck,      label: 'Truck' },
];

const VehicleRegistrationForm = ({ onClose, initialData = {} }) => {
  const [formData, setFormData] = useState({
    vehicleType:    initialData.vehicleType    || '',
    licenseNumber:  initialData.licenseNumber  || '',
    deliveryRadius: initialData.deliveryRadius || '',
    phoneNumber:    initialData.phoneNumber    || '',
  });
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('');
  const [saving, setSaving]   = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initialData.vehicleType) {
        await axios.put('/driver/profile', formData);
      } else {
        await axios.post('/driver/registerVehicle', formData);
      }
      setMessage('Vehicle information saved!');
      setMsgType('success');
      setTimeout(() => { onClose(); }, 1200);
    } catch (err) {
      setMessage('Error saving vehicle info.');
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="vrf-overlay">
      <div className="vrf-modal">
        <h2 className="vrf-title">
          {initialData.vehicleType ? 'Update Vehicle' : 'Register Vehicle'}
        </h2>

        <div className="vrf-vehicle-grid">
          {VEHICLE_TYPES.map(v => (
            <button key={v.value} type="button"
              className={`vrf-vehicle-btn ${formData.vehicleType === v.value ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, vehicleType: v.value })}
            >
              <FontAwesomeIcon icon={v.icon} />
              <span>{v.label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="vrf-form">
          <div className="vrf-field">
            <label><FontAwesomeIcon icon={faIdCard} /> License Number</label>
            <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="ABCD-1234" required />
          </div>
          <div className="vrf-row">
            <div className="vrf-field">
              <label><FontAwesomeIcon icon={faMapMarkerAlt} /> Radius (km)</label>
              <input name="deliveryRadius" type="number" value={formData.deliveryRadius} onChange={handleChange} placeholder="10" required min="1" />
            </div>
            <div className="vrf-field">
              <label><FontAwesomeIcon icon={faPhone} /> Phone</label>
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="647-555-0101" required />
            </div>
          </div>

          {message && (
            <div className={`vrf-message ${msgType}`}>
              <FontAwesomeIcon icon={msgType === 'success' ? faCheckCircle : faExclamationCircle} />
              {message}
            </div>
          )}

          <div className="vrf-actions">
            <button type="button" className="vrf-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="vrf-save" disabled={saving}>
              {saving ? <span className="vrf-spinner" /> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRegistrationForm;