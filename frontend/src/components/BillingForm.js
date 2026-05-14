import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faCreditCard, faCheckCircle,
  faArrowRight, faShieldHalved, faLock,
  faEye, faEyeSlash, faUtensils, faClock, faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import './BillingForm.css';

const BillingForm = () => {
  const { subscriptionId } = useParams();
  const navigate           = useNavigate();
  const [plan, setPlan]    = useState(null);

  const [formData, setFormData] = useState({
    address: '', city: '', state: '', zipCode: '',
    cardNumber: '', expiryDate: '', cvv: '', cardHolderName: '',
  });
  const [errors, setErrors]          = useState({});
  const [successMessage, setSuccess] = useState('');
  const [loading, setLoading]        = useState(false);
  const [showCvv, setShowCvv]        = useState(false);

  useEffect(() => {
    axios.get(`/provider/getSubscription/${subscriptionId}`)
      .then(r => setPlan(r.data))
      .catch(console.error);
  }, [subscriptionId]);

  const validate = () => {
    const e = {};
    if (!formData.address)    e.address = 'Required';
    if (!formData.city)       e.city    = 'Required';
    if (!formData.state)      e.state   = 'Required';
    if (!formData.zipCode || !/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(formData.zipCode))
      e.zipCode = 'Invalid (e.g. M5V 3A8)';
    if (!formData.cardHolderName) e.cardHolderName = 'Required';
    if (!formData.cardNumber || !/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(formData.cardNumber))
      e.cardNumber = 'Invalid card number';
    if (!formData.expiryDate || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate))
      e.expiryDate = 'Format: MM/YY';
    if (!formData.cvv || !/^\d{3,4}$/.test(formData.cvv))
      e.cvv = '3–4 digits';
    return e;
  };

  const formatCard = (val) =>
    val.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1-').slice(0, 19);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'cardNumber' ? formatCard(value) : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;
    setLoading(true);
    try {
      await axios.post('/customer/payment', { ...formData, subscriptionId });
      const booking = await axios.post('/provider/bookSubscription', { subscriptionId });
      const { customer, subscription, order } = booking.data;
      if (!customer || !subscription || !order) throw new Error('Invalid response');
      setSuccess('Payment successful! Redirecting...');
      setTimeout(() => navigate('/customer-dashboard'), 2500);
    } catch (err) {
      setErrors({ submit: 'Payment failed. Please check your details.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bf-page">

      {/* ── LEFT: Order Summary ── */}
      <div className="bf-left">
        <button className="bf-back-btn" onClick={() => navigate(`/checkout/${subscriptionId}`)}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>

        <div className="bf-summary">
          <p className="bf-summary-label">Order Summary</p>

          <div className="bf-summary-icon">
            <FontAwesomeIcon icon={faUtensils} />
          </div>

          {plan ? (
            <>
              <h2 className="bf-summary-plan">{plan.planName}</h2>
              <p className="bf-summary-provider">{plan.providerId?.restaurantName || 'Provider'}</p>

              <div className="bf-summary-meta">
                <span><FontAwesomeIcon icon={faClock} /> {plan.duration}</span>
              </div>

              <div className="bf-summary-price">
                <span className="bf-price-label">Total due today</span>
                <span className="bf-price-value">
                  <FontAwesomeIcon icon={faDollarSign} />{plan.price}
                </span>
              </div>

              {plan.meals?.length > 0 && (
                <div className="bf-summary-meals">
                  <p className="bf-meals-label">Included Meals</p>
                  {plan.meals.map((m, i) => (
                    <div key={i} className="bf-meal-row">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      {m.mealName}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bf-summary-loading">
              <div className="bf-spinner-sm" />
            </div>
          )}
        </div>

        <div className="bf-left-badges">
          <div className="bf-badge"><FontAwesomeIcon icon={faShieldHalved} /> SSL Secured</div>
          <div className="bf-badge"><FontAwesomeIcon icon={faLock} /> Encrypted</div>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
      <div className="bf-right">
        <div className="bf-form-wrap">

          {/* Progress */}
          <div className="bf-progress">
            <div className="bf-step done">
              <div className="bf-dot done"><FontAwesomeIcon icon={faCheckCircle} /></div>
              <span>Review</span>
            </div>
            <div className="bf-line active" />
            <div className="bf-step active">
              <div className="bf-dot active">2</div>
              <span>Payment</span>
            </div>
            <div className="bf-line" />
            <div className="bf-step">
              <div className="bf-dot">3</div>
              <span>Done</span>
            </div>
          </div>

          <h2 className="bf-form-title">Payment Details</h2>

          {successMessage && (
            <div className="bf-success">
              <FontAwesomeIcon icon={faCheckCircle} /> {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="bf-form">

            {/* Delivery */}
            <div className="bf-group-title">Delivery Address</div>

            <div className="bf-field full">
              <label>Street Address</label>
              <input name="address" value={formData.address} onChange={handleChange}
                placeholder="123 Main Street" className={errors.address ? 'err' : ''} />
              {errors.address && <span className="bf-err">{errors.address}</span>}
            </div>

            <div className="bf-row-3">
              <div className="bf-field">
                <label>City</label>
                <input name="city" value={formData.city} onChange={handleChange}
                  placeholder="Toronto" className={errors.city ? 'err' : ''} />
                {errors.city && <span className="bf-err">{errors.city}</span>}
              </div>
              <div className="bf-field">
                <label>Province</label>
                <input name="state" value={formData.state} onChange={handleChange}
                  placeholder="ON" className={errors.state ? 'err' : ''} />
                {errors.state && <span className="bf-err">{errors.state}</span>}
              </div>
              <div className="bf-field">
                <label>Postal Code</label>
                <input name="zipCode" value={formData.zipCode} onChange={handleChange}
                  placeholder="M5V 3A8" className={errors.zipCode ? 'err' : ''} />
                {errors.zipCode && <span className="bf-err">{errors.zipCode}</span>}
              </div>
            </div>

            {/* Card */}
            <div className="bf-group-title" style={{ marginTop: 8 }}>Card Information</div>

            <div className="bf-field full">
              <label>Cardholder Name</label>
              <input name="cardHolderName" value={formData.cardHolderName} onChange={handleChange}
                placeholder="Meet Amin" className={errors.cardHolderName ? 'err' : ''} />
              {errors.cardHolderName && <span className="bf-err">{errors.cardHolderName}</span>}
            </div>

            <div className="bf-field full">
              <label>Card Number</label>
              <div className="bf-card-input">
                <FontAwesomeIcon icon={faCreditCard} className="bf-card-icon" />
                <input name="cardNumber" value={formData.cardNumber} onChange={handleChange}
                  placeholder="1234  5678  9012  3456" maxLength={19}
                  className={errors.cardNumber ? 'err' : ''} />
              </div>
              {errors.cardNumber && <span className="bf-err">{errors.cardNumber}</span>}
            </div>

            <div className="bf-row-2">
              <div className="bf-field">
                <label>Expiry Date</label>
                <input name="expiryDate" value={formData.expiryDate} onChange={handleChange}
                  placeholder="MM/YY" maxLength={5} className={errors.expiryDate ? 'err' : ''} />
                {errors.expiryDate && <span className="bf-err">{errors.expiryDate}</span>}
              </div>
              <div className="bf-field">
                <label>CVV</label>
                <div className="bf-cvv">
                  <input name="cvv" type={showCvv ? 'text' : 'password'}
                    value={formData.cvv} onChange={handleChange}
                    placeholder="•••" maxLength={4} className={errors.cvv ? 'err' : ''} />
                  <button type="button" className="bf-eye" onClick={() => setShowCvv(!showCvv)} tabIndex={-1}>
                    <FontAwesomeIcon icon={showCvv ? faEyeSlash : faEye} />
                  </button>
                </div>
                {errors.cvv && <span className="bf-err">{errors.cvv}</span>}
              </div>
            </div>

            {errors.submit && <div className="bf-submit-err">{errors.submit}</div>}

            <button type="submit" className="bf-pay-btn" disabled={loading || !!successMessage}>
              {loading
                ? <><span className="bf-spinner" /> Processing...</>
                : <>Pay ${plan?.price || ''} Now <FontAwesomeIcon icon={faArrowRight} /></>
              }
            </button>

            <p className="bf-secure-note">
              <FontAwesomeIcon icon={faShieldHalved} />
              Payments are encrypted and secure
            </p>

          </form>
        </div>
      </div>

    </div>
  );
};

export default BillingForm;