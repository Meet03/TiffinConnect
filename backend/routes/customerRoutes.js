const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const upload = require('../middleware/upload'); // For handling profile picture uploads
const { authMiddleware } = require('../middleware/authMiddleware');

// Route to get customer profile
router.get('/profile', authMiddleware, customerController.getCustomerProfile);

// Route to update customer profile
router.put('/profile', authMiddleware, upload.single('profilePicture'), customerController.updateProfile);

router.post('/payment', authMiddleware, customerController.processPayment);

router.get('/orders', authMiddleware, customerController.getOrderHistoryForCustomer);



module.exports = router;
