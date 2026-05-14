// routes/driverRoutes.js

const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const driverController = require('../controllers/driverController');
const upload = require('../middleware/upload'); 

const router = express.Router();

// Route for registering vehicle
router.post('/registerVehicle', authMiddleware, driverController.registerVehicle);

// Route for getting driver profile
router.get('/profile', authMiddleware, driverController.getDriverProfile);

// Route for updating driver profile
router.put('/profile', authMiddleware, driverController.updateDriverProfile);

// Route for uploading driver profile photo
router.post('/upload-profile-photo', authMiddleware, upload.single('profilePhoto'), driverController.uploadProfilePhoto);

router.post('/assignOrder', authMiddleware, driverController.assignOrder);


router.get('/orders', authMiddleware, driverController.getAssignedOrders);

router.post('/assignOrder', authMiddleware, driverController.assignOrder);

router.post('/unassignOrder', authMiddleware, driverController.unassignOrder);


module.exports = router;
