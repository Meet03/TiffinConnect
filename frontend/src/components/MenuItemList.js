import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '../api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft, faPlus, faEdit, faTrash, faLeaf,
  faSeedling, faDrumstickBite, faUtensils, faTimes,
  faDollarSign, faImage, faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './MenuItemList.css';

const MEAL_TYPES = [
  { value: 'vegetarian',     label: 'Vegetarian',     icon: faLeaf,         color: '#27ae60' },
  { value: 'vegan',          label: 'Vegan',          icon: faSeedling,     color: '#16a085' },
  { value: 'non-vegetarian', label: 'Non-Veg',        icon: faDrumstickBite,color: '#e67e22' },
];

const EMPTY_ITEM = { mealName: '', description: '', price: '', imageURL: '', mealType: 'vegetarian' };

const MenuItemList = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems]     = useState([]);
  const [showForm, setShowForm]       = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm]               = useState(EMPTY_ITEM);
  const [imagePreview, setPreview]    = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await getMenuItems();
      setMenuItems(res.data);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm(EMPTY_ITEM);
    setPreview('');
    setEditingItem(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({ ...item });
    setPreview(item.imageURL || '');
    setEditingItem(item);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setForm(EMPTY_ITEM);
    setPreview('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setForm({ ...form, imageURL: url });
      setPreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await updateMenuItem(editingItem._id, form);
      } else {
        await addMenuItem(form);
      }
      await fetchItems();
      closeForm();
    } catch (err) {
      console.error('Error saving menu item:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMenuItem(id);
      setMenuItems(menuItems.filter(i => i._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting menu item:', err);
    }
  };

  const getMealType = (type) => MEAL_TYPES.find(t => t.value === type) || MEAL_TYPES[0];

  if (loading) {
    return (
      <div className="ml-loading">
        <div className="ml-spinner" />
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="ml-page">
      <div className="ml-container">

        {/* Back */}
        <button className="ml-back-btn" onClick={() => navigate('/provider-dashboard')}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="ml-header">
          <div>
            <h1>Menu Items</h1>
            <p>{menuItems.length} item{menuItems.length !== 1 ? 's' : ''} on your menu</p>
          </div>
          <button className="ml-add-btn" onClick={openAdd}>
            <FontAwesomeIcon icon={faPlus} /> Add Item
          </button>
        </div>

        {/* Form Panel */}
        {showForm && (
          <div className="ml-form-card">
            <div className="ml-form-header">
              <h2>{editingItem ? 'Edit Menu Item' : 'Add New Item'}</h2>
              <button className="ml-close-btn" onClick={closeForm}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="ml-form">
              <div className="ml-form-row">
                <div className="ml-field">
                  <label>Meal Name</label>
                  <input name="mealName" value={form.mealName} onChange={handleChange}
                    placeholder="e.g. Palak Paneer" required />
                </div>
                <div className="ml-field">
                  <label>Price ($)</label>
                  <div className="ml-price-wrap">
                    <FontAwesomeIcon icon={faDollarSign} className="ml-price-icon" />
                    <input name="price" type="number" value={form.price} onChange={handleChange}
                      placeholder="0.00" required min="0" step="0.01" />
                  </div>
                </div>
              </div>

              <div className="ml-field">
                <label>Description</label>
                <input name="description" value={form.description} onChange={handleChange}
                  placeholder="Brief description of the meal" />
              </div>

              {/* Meal type selector */}
              <div className="ml-field">
                <label>Meal Type</label>
                <div className="ml-type-grid">
                  {MEAL_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      className={`ml-type-btn ${form.mealType === t.value ? 'active' : ''}`}
                      style={form.mealType === t.value ? { borderColor: t.color, background: t.color + '12', color: t.color } : {}}
                      onClick={() => setForm({ ...form, mealType: t.value })}
                    >
                      <FontAwesomeIcon icon={t.icon} />
                      {t.label}
                      {form.mealType === t.value && <FontAwesomeIcon icon={faCheckCircle} className="ml-type-check" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Image upload */}
              <div className="ml-field">
                <label>Meal Image</label>
                <label className="ml-upload-area">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="ml-img-preview"
                      onError={() => setPreview('')} />
                  ) : (
                    <div className="ml-upload-placeholder">
                      <FontAwesomeIcon icon={faImage} />
                      <span>Click to upload image</span>
                      <span className="ml-upload-hint">JPG, PNG up to 2MB</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
                {imagePreview && (
                  <button type="button" className="ml-clear-img" onClick={() => { setPreview(''); setForm({ ...form, imageURL: '' }); }}>
                    Remove image
                  </button>
                )}
              </div>

              <div className="ml-form-actions">
                <button type="button" className="ml-cancel-btn" onClick={closeForm}>Cancel</button>
                <button type="submit" className="ml-save-btn" disabled={saving}>
                  {saving ? <span className="ml-spinner-sm" /> : editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Items Grid */}
        {menuItems.length === 0 && !showForm ? (
          <div className="ml-empty">
            <FontAwesomeIcon icon={faUtensils} />
            <h3>No menu items yet</h3>
            <p>Add your first meal to get started!</p>
            <button className="ml-empty-btn" onClick={openAdd}>
              <FontAwesomeIcon icon={faPlus} /> Add First Item
            </button>
          </div>
        ) : (
          <div className="ml-grid">
            {menuItems.map((item) => {
              const type = getMealType(item.mealType);
              return (
                <div className="ml-card" key={item._id}>
                  {/* Image */}
                  <div className="ml-card-img">
                    {item.imageURL
                      ? <img src={item.imageURL} alt={item.mealName} onError={(e) => { e.target.onerror = null; e.target.src = ''; }} />
                      : <div className="ml-card-img-placeholder"><FontAwesomeIcon icon={faUtensils} /></div>
                    }
                    <span className="ml-card-type-badge" style={{ background: type.color }}>
                      <FontAwesomeIcon icon={type.icon} /> {type.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="ml-card-body">
                    <h3 className="ml-card-name">{item.mealName}</h3>
                    {item.description && <p className="ml-card-desc">{item.description}</p>}
                    <div className="ml-card-price">
                      <FontAwesomeIcon icon={faDollarSign} />
                      {item.price}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="ml-card-actions">
                    <button className="ml-edit-btn" onClick={() => openEdit(item)}>
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button className="ml-delete-btn" onClick={() => setDeleteConfirm(item._id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete confirm modal */}
        {deleteConfirm && (
          <div className="ml-modal-overlay">
            <div className="ml-modal">
              <h3>Delete Menu Item?</h3>
              <p>This action cannot be undone.</p>
              <div className="ml-modal-actions">
                <button className="ml-modal-cancel" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="ml-modal-confirm" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MenuItemList;