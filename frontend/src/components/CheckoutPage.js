import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faUtensils, faClock, faDollarSign,
  faLeaf, faSeedling, faDrumstickBite, faArrowRight,
  faShieldHalved, faStar
} from '@fortawesome/free-solid-svg-icons';
import './CheckoutPage.css';

const MEAL_TYPE_ICON  = { vegetarian: faLeaf, vegan: faSeedling, 'non-vegetarian': faDrumstickBite };
const MEAL_TYPE_COLOR = { vegetarian: '#27ae60', vegan: '#16a085', 'non-vegetarian': '#e67e22' };

const CheckoutPage = () => {
  const { subscriptionId } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axios.get(`/provider/getSubscription/${subscriptionId}`);
        setSubscription(response.data);
      } catch (error) {
        console.error('Error fetching subscription details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [subscriptionId]);

  if (loading) {
    return (
      <div className="ck-loading">
        <div className="ck-spinner" />
        <p>Loading plan details...</p>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="ck-loading">
        <p>Plan not found.</p>
        <button className="ck-back-btn" onClick={() => navigate('/subscription-process')}>
          Back to Browse
        </button>
      </div>
    );
  }

  return (
    <div className="ck-page">
      <div className="ck-container">

        {/* Back */}
        <button className="ck-back-btn" onClick={() => navigate('/subscription-process')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Browse
        </button>

        {/* Progress */}
        <div className="ck-progress">
          <div className="ck-step active">
            <div className="ck-step-dot active">1</div>
            <span>Review</span>
          </div>
          <div className="ck-step-line" />
          <div className="ck-step">
            <div className="ck-step-dot">2</div>
            <span>Payment</span>
          </div>
          <div className="ck-step-line" />
          <div className="ck-step">
            <div className="ck-step-dot">3</div>
            <span>Confirmed</span>
          </div>
        </div>

        <div className="ck-content">

          {/* Plan summary card */}
          <div className="ck-plan-card">
            <div className="ck-plan-header">
              <div className="ck-plan-icon">
                <FontAwesomeIcon icon={faUtensils} />
              </div>
              <div>
                <h2 className="ck-plan-name">{subscription.planName}</h2>
                <p className="ck-plan-provider">
                  {subscription.providerId?.restaurantName || 'Provider'}
                </p>
              </div>
              <span className="ck-duration-badge">
                <FontAwesomeIcon icon={faClock} />
                {subscription.duration}
              </span>
            </div>

            {subscription.description && (
              <p className="ck-plan-desc">{subscription.description}</p>
            )}

            <div className="ck-divider" />

            {/* Price */}
            <div className="ck-price-row">
              <span className="ck-price-label">Total Price</span>
              <div className="ck-price">
                <FontAwesomeIcon icon={faDollarSign} />
                <span>{subscription.price}</span>
                <span className="ck-price-per">/ {subscription.duration}</span>
              </div>
            </div>

            <div className="ck-divider" />

            {/* Meals */}
            {subscription.meals?.length > 0 && (
              <div className="ck-meals">
                <p className="ck-meals-label">Included Meals ({subscription.meals.length})</p>
                <div className="ck-meals-list">
                  {subscription.meals.map((meal, idx) => {
                    const icon  = MEAL_TYPE_ICON[meal.mealType]  || faUtensils;
                    const color = MEAL_TYPE_COLOR[meal.mealType] || '#888';
                    return (
                      <span key={idx} className="ck-meal-tag" style={{ borderColor: color + '40', color }}>
                        <FontAwesomeIcon icon={icon} />
                        {meal.mealName}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="ck-trust">
            <div className="ck-trust-item">
              <FontAwesomeIcon icon={faShieldHalved} />
              <span>Secure Payment</span>
            </div>
            <div className="ck-trust-item">
              <FontAwesomeIcon icon={faStar} />
              <span>Verified Providers</span>
            </div>
            <div className="ck-trust-item">
              <FontAwesomeIcon icon={faClock} />
              <span>Cancel Anytime</span>
            </div>
          </div>

          {/* Actions */}
          <div className="ck-actions">
            <button className="ck-cancel-btn" onClick={() => navigate('/subscription-process')}>
              Cancel
            </button>
            <button className="ck-pay-btn" onClick={() => navigate(`/billing/${subscriptionId}`)}>
              Proceed to Payment
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;