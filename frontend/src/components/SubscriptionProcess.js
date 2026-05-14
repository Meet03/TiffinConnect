import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faSearch, faFilter, faUtensils,
  faClock, faDollarSign, faArrowRight, faLeaf,
  faDrumstickBite, faSeedling, faShoppingCart
} from '@fortawesome/free-solid-svg-icons';
import './SubscriptionProcess.css';

const DURATION_LABELS = {
  weekly:  'Weekly',
  monthly: 'Monthly',
  yearly:  'Yearly',
};

const MEAL_TYPE_ICON = {
  vegetarian:     faLeaf,
  vegan:          faSeedling,
  'non-vegetarian': faDrumstickBite,
};

const MEAL_TYPE_COLOR = {
  vegetarian:     '#27ae60',
  vegan:          '#16a085',
  'non-vegetarian': '#e67e22',
};

const SubscriptionProcess = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [filter, setFilter]               = useState('');
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get('/provider/getAllSubscriptionPlans');
        setSubscriptions(response.data);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const filteredSubscriptions = subscriptions.filter((plan) => {
    const q = searchQuery.toLowerCase();
    const nameMatch     = plan.planName.toLowerCase().includes(q);
    const providerMatch = plan.providerId?.restaurantName?.toLowerCase().includes(q);
    const mealMatch     = plan.meals.some(m => m.mealName.toLowerCase().includes(q));
    return (
      (searchQuery === '' || nameMatch || providerMatch || mealMatch) &&
      (filter === '' || plan.duration === filter)
    );
  });

  if (loading) {
    return (
      <div className="sp-loading">
        <div className="sp-spinner" />
        <p>Finding tiffins near you...</p>
      </div>
    );
  }

  return (
    <div className="sp-page">
      <div className="sp-container">

        {/* Back */}
        <button className="sp-back-btn" onClick={() => navigate('/customer-dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="sp-header">
          <div>
            <h1>Browse Tiffins</h1>
            <p>{filteredSubscriptions.length} plan{filteredSubscriptions.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="sp-controls">
          <div className="sp-search-wrap">
            <FontAwesomeIcon icon={faSearch} className="sp-search-icon" />
            <input
              type="text"
              placeholder="Search by plan, provider or meal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sp-search"
            />
          </div>
          <div className="sp-filter-wrap">
            <FontAwesomeIcon icon={faFilter} className="sp-filter-icon" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="sp-filter"
            >
              <option value="">All Durations</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Cards */}
        {filteredSubscriptions.length === 0 ? (
          <div className="sp-empty">
            <FontAwesomeIcon icon={faUtensils} />
            <h3>No tiffins found</h3>
            <p>Try adjusting your search or filter to find available plans.</p>
            <button className="sp-clear-btn" onClick={() => { setSearchQuery(''); setFilter(''); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="sp-grid">
            {filteredSubscriptions.map((plan) => (
              <div className="sp-card" key={plan._id}>

                {/* Card Header */}
                <div className="sp-card-header">
                  <div className="sp-card-icon">
                    <FontAwesomeIcon icon={faUtensils} />
                  </div>
                  <span className="sp-duration-badge">
                    <FontAwesomeIcon icon={faClock} />
                    {DURATION_LABELS[plan.duration] || plan.duration}
                  </span>
                </div>

                {/* Plan Info */}
                <h2 className="sp-plan-name">{plan.planName}</h2>
                <p className="sp-provider">
                  {plan.providerId?.restaurantName || 'Provider'}
                </p>
                {plan.description && (
                  <p className="sp-description">{plan.description}</p>
                )}

                {/* Price */}
                <div className="sp-price">
                  <FontAwesomeIcon icon={faDollarSign} />
                  <span className="sp-price-value">{plan.price}</span>
                  <span className="sp-price-per">/ {plan.duration}</span>
                </div>

                {/* Meals */}
                {plan.meals?.length > 0 && (
                  <div className="sp-meals">
                    <p className="sp-meals-label">Included Meals</p>
                    <div className="sp-meals-list">
                      {plan.meals.map((meal, idx) => {
                        const icon  = MEAL_TYPE_ICON[meal.mealType]  || faUtensils;
                        const color = MEAL_TYPE_COLOR[meal.mealType] || '#888';
                        return (
                          <span className="sp-meal-tag" key={idx} style={{ borderColor: color + '40', color }}>
                            <FontAwesomeIcon icon={icon} />
                            {meal.mealName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <button
                  className="sp-checkout-btn"
                  onClick={() => navigate(`/checkout/${plan._id}`)}
                >
                  <FontAwesomeIcon icon={faShoppingCart} />
                  Subscribe Now
                  <FontAwesomeIcon icon={faArrowRight} className="sp-btn-arrow" />
                </button>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionProcess;