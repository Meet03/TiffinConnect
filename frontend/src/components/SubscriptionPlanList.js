import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getSubscriptionPlans, addSubscriptionPlan,
  updateSubscriptionPlan, deleteSubscriptionPlan, getMenuItems
} from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faPlus, faEdit, faTrash, faTimes,
  faClock, faDollarSign, faUtensils, faCheckCircle,
  faLeaf, faSeedling, faDrumstickBite
} from '@fortawesome/free-solid-svg-icons';
import './SubscriptionPlanList.css';

const DURATION_OPTIONS = ['weekly', 'monthly', 'yearly'];
const EMPTY_PLAN = { planName: '', description: '', price: '', duration: 'monthly', meals: [] };

const MEAL_TYPE_COLOR = {
  vegetarian: '#27ae60', vegan: '#16a085', 'non-vegetarian': '#e67e22',
};
const MEAL_TYPE_ICON = {
  vegetarian: faLeaf, vegan: faSeedling, 'non-vegetarian': faDrumstickBite,
};

const SubscriptionPlanList = () => {
  const navigate = useNavigate();
  const [plans, setPlans]           = useState([]);
  const [menuItems, setMenuItems]   = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [editingPlan, setEditing]   = useState(null);
  const [form, setForm]             = useState(EMPTY_PLAN);
  const [deleteConfirm, setDelConf] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [plansRes, menuRes] = await Promise.allSettled([
        getSubscriptionPlans(), getMenuItems(),
      ]);
      if (plansRes.status === 'fulfilled') setPlans(plansRes.value.data);
      if (menuRes.status  === 'fulfilled') setMenuItems(menuRes.value.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm(EMPTY_PLAN);
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (plan) => {
    setForm({ ...plan, meals: plan.meals.map(m => m._id || m) });
    setEditing(plan);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_PLAN);
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMeal = (mealId) => {
    const meals = form.meals.includes(mealId)
      ? form.meals.filter(id => id !== mealId)
      : [...form.meals, mealId];
    setForm({ ...form, meals });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan._id, form);
      } else {
        await addSubscriptionPlan(form);
      }
      await fetchAll();
      closeForm();
    } catch (err) {
      console.error('Error saving plan:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubscriptionPlan(id);
      setPlans(plans.filter(p => p._id !== id));
      setDelConf(null);
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
  };

  if (loading) {
    return (
      <div className="sl-loading">
        <div className="sl-spinner" />
        <p>Loading subscription plans...</p>
      </div>
    );
  }

  return (
    <div className="sl-page">
      <div className="sl-container">

        <button className="sl-back-btn" onClick={() => navigate('/provider-dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>

        <div className="sl-header">
          <div>
            <h1>Subscription Plans</h1>
            <p>{plans.length} plan{plans.length !== 1 ? 's' : ''} available</p>
          </div>
          <button className="sl-add-btn" onClick={openAdd}>
            <FontAwesomeIcon icon={faPlus} /> Add Plan
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="sl-form-card">
            <div className="sl-form-header">
              <h2>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h2>
              <button className="sl-close-btn" onClick={closeForm}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="sl-form">

              <div className="sl-form-row">
                <div className="sl-field">
                  <label>Plan Name</label>
                  <input name="planName" value={form.planName} onChange={handleChange}
                    placeholder="e.g. Weekly Veg Plan" required />
                </div>
                <div className="sl-field">
                  <label>Price ($)</label>
                  <div className="sl-price-wrap">
                    <FontAwesomeIcon icon={faDollarSign} className="sl-price-icon" />
                    <input name="price" type="number" value={form.price} onChange={handleChange}
                      placeholder="49.00" required min="0" step="0.01" />
                  </div>
                </div>
              </div>

              <div className="sl-field">
                <label>Description</label>
                <input name="description" value={form.description} onChange={handleChange}
                  placeholder="Brief description of this plan" />
              </div>

              {/* Duration */}
              <div className="sl-field">
                <label>Duration</label>
                <div className="sl-duration-grid">
                  {DURATION_OPTIONS.map(d => (
                    <button
                      key={d}
                      type="button"
                      className={`sl-duration-btn ${form.duration === d ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, duration: d })}
                    >
                      <FontAwesomeIcon icon={faClock} />
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                      {form.duration === d && <FontAwesomeIcon icon={faCheckCircle} className="sl-check" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal selector */}
              <div className="sl-field">
                <label>Select Meals ({form.meals.length} selected)</label>
                {menuItems.length === 0 ? (
                  <div className="sl-no-meals">
                    No menu items yet. <button type="button" className="sl-link" onClick={() => navigate('/menu-items')}>Add menu items first →</button>
                  </div>
                ) : (
                  <div className="sl-meals-grid">
                    {menuItems.map(meal => {
                      const selected = form.meals.includes(meal._id);
                      const color = MEAL_TYPE_COLOR[meal.mealType] || '#888';
                      const icon  = MEAL_TYPE_ICON[meal.mealType]  || faUtensils;
                      return (
                        <button
                          key={meal._id}
                          type="button"
                          className={`sl-meal-btn ${selected ? 'active' : ''}`}
                          style={selected ? { borderColor: color, background: color + '12' } : {}}
                          onClick={() => toggleMeal(meal._id)}
                        >
                          <FontAwesomeIcon icon={icon} style={{ color: selected ? color : '#ccc' }} />
                          <span>{meal.mealName}</span>
                          {selected && <FontAwesomeIcon icon={faCheckCircle} className="sl-meal-check" style={{ color }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="sl-form-actions">
                <button type="button" className="sl-cancel-btn" onClick={closeForm}>Cancel</button>
                <button type="submit" className="sl-save-btn" disabled={saving}>
                  {saving ? <span className="sl-spinner-sm" /> : editingPlan ? 'Update Plan' : 'Add Plan'}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Plans */}
        {plans.length === 0 && !showForm ? (
          <div className="sl-empty">
            <FontAwesomeIcon icon={faUtensils} />
            <h3>No subscription plans yet</h3>
            <p>Create your first plan so customers can subscribe to your meals!</p>
            <button className="sl-empty-btn" onClick={openAdd}>
              <FontAwesomeIcon icon={faPlus} /> Create First Plan
            </button>
          </div>
        ) : (
          <div className="sl-grid">
            {plans.map(plan => (
              <div className="sl-card" key={plan._id}>
                <div className="sl-card-header">
                  <div className="sl-card-icon"><FontAwesomeIcon icon={faUtensils} /></div>
                  <span className="sl-duration-badge">
                    <FontAwesomeIcon icon={faClock} />
                    {plan.duration}
                  </span>
                </div>

                <h3 className="sl-card-name">{plan.planName}</h3>
                {plan.description && <p className="sl-card-desc">{plan.description}</p>}

                <div className="sl-card-price">
                  <FontAwesomeIcon icon={faDollarSign} />
                  <span>{plan.price}</span>
                  <span className="sl-price-per">/ {plan.duration}</span>
                </div>

                {plan.meals?.length > 0 && (
                  <div className="sl-card-meals">
                    <p className="sl-meals-label">Included Meals</p>
                    <div className="sl-meals-tags">
                      {plan.meals.map((meal, i) => {
                        const color = MEAL_TYPE_COLOR[meal.mealType] || '#888';
                        const icon  = MEAL_TYPE_ICON[meal.mealType]  || faUtensils;
                        return (
                          <span key={i} className="sl-meal-tag" style={{ borderColor: color + '40', color }}>
                            <FontAwesomeIcon icon={icon} />
                            {meal.mealName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="sl-card-actions">
                  <button className="sl-edit-btn" onClick={() => openEdit(plan)}>
                    <FontAwesomeIcon icon={faEdit} /> Edit
                  </button>
                  <button className="sl-delete-btn" onClick={() => setDelConf(plan._id)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete modal */}
        {deleteConfirm && (
          <div className="sl-modal-overlay">
            <div className="sl-modal">
              <h3>Delete Plan?</h3>
              <p>This will remove the plan and cannot be undone.</p>
              <div className="sl-modal-actions">
                <button className="sl-modal-cancel" onClick={() => setDelConf(null)}>Cancel</button>
                <button className="sl-modal-confirm" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SubscriptionPlanList;