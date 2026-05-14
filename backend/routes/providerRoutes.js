// backend/routes/providerRoutes.js

const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');

const {
  getProviderProfile,
  updateProviderProfile,
  deleteProviderProfile,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItems,
  createSubscriptionPlan,
  getSubscriptionPlans,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getAllSubscriptionPlans,
  getSubscriptionById,
  bookSubscription,
  getOrderHistoryForProvider, 

} = require('../controllers/providerController');

const router = express.Router();

// Provider profile routes
router.get('/profile', authMiddleware, getProviderProfile);
router.put('/profile', authMiddleware, updateProviderProfile);
router.delete('/profile', authMiddleware, deleteProviderProfile);

// Menu item routes
router.get('/menu', authMiddleware, getMenuItems); // Add this route for fetching menu items
router.post('/menu', authMiddleware, createMenuItem);
router.put('/menu/:id', authMiddleware, updateMenuItem);
router.delete('/menu/:id', authMiddleware, deleteMenuItem);

// Subscription plan routes
router.get('/plans', authMiddleware, getSubscriptionPlans);
router.post('/plans', authMiddleware, createSubscriptionPlan);
router.put('/plans/:id', authMiddleware, updateSubscriptionPlan);
router.delete('/plans/:id', authMiddleware, deleteSubscriptionPlan);

// Route to fetch all subscription plans
router.get('/getAllSubscriptionPlans', (req, res, next) => {
  console.log("Route /getAllSubscriptionPlans matched"); // Log when route is matched
  next();
}, getAllSubscriptionPlans);

// Route to fetch a specific subscription plan by ID
router.get('/getSubscription/:id', (req, res, next) => {
  console.log(`Route /getSubscription/${req.params.id} matched`); // Log when route is matched with ID
  next();
}, getSubscriptionById);

// Route to book a subscription for the customer
router.post('/bookSubscription', authMiddleware, (req, res, next) => {
  console.log("Route /bookSubscription matched"); 
  next();
}, bookSubscription);

router.get('/orders', authMiddleware, getOrderHistoryForProvider);


module.exports = router;
