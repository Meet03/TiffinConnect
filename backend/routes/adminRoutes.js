// routes/adminRoutes.js
const express = require('express');
const { authMiddleware, isAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// User Management
router.get('/users', authMiddleware, isAdmin, adminController.getAllUsers);
router.get('/users/:id', authMiddleware, isAdmin, adminController.getUserById);
router.put('/users/:id', authMiddleware, isAdmin, adminController.updateUser);
router.delete('/users/:id', authMiddleware, isAdmin, adminController.deleteUser);

// Provider Management
router.get('/providers', authMiddleware, isAdmin, adminController.getAllProviders);
router.get('/providers/:id', authMiddleware, isAdmin, adminController.getProviderById);
router.put('/providers/:id', authMiddleware, isAdmin, adminController.updateProvider);
router.delete('/providers/:id', authMiddleware, isAdmin, adminController.deleteProvider);

// Order Management
router.get('/orders', authMiddleware, isAdmin, adminController.getAllOrders);
router.delete('/orders/:id', authMiddleware, isAdmin, adminController.deleteOrder); 

router.get('/drivers', authMiddleware, isAdmin, adminController.getAllDrivers);
router.post('/assignOrder', authMiddleware, isAdmin, adminController.assignOrderToDriver);
router.post('/unassignOrder', authMiddleware, isAdmin, adminController.unassignOrder);


module.exports = router;
