// controllers/driverController.js
const { check, validationResult } = require('express-validator');
const Driver = require('../models/Driver');
const User = require('../models/User'); 
const Order = require('../models/Order'); 


  // Register vehicle for driver
  exports.registerVehicle = [
    // Backend validation rules
    check('vehicleType')
      .trim()
      .notEmpty()
      .withMessage('Vehicle type is required.')
      .isIn(['Car', 'Van', 'Bike', 'Truck'])
      .withMessage('Vehicle type must be one of Car, Van, Bike, or Truck.'),
    check('licenseNumber')
      .trim()
      .notEmpty()
      .withMessage('License number is required.')
      .matches(/^[A-Za-z0-9]{2,8}$/)
      .withMessage('License number must be between 2 to 8 alphanumeric characters.'),
    check('deliveryRadius')
      .isInt({ min: 1, max: 100 })
      .withMessage('Delivery radius must be between 1 and 100 km.'),
    check('phoneNumber')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Phone number is required.')
      .matches(/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/)
      .withMessage('Phone number must be in a valid Canadian format (e.g., 123-456-7890).'),
  
    // Controller logic
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation failed:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { vehicleType, licenseNumber, deliveryRadius, phoneNumber } = req.body;
      const driverId = req.user.userId;
  
      try {
        const driver = await Driver.findOne({ userId: driverId });
  
        if (!driver) {
          console.log('No driver profile found for this user');
          return res.status(404).json({ message: 'Driver profile not found' });
        }
  
        driver.vehicleType = vehicleType;
        driver.licenseNumber = licenseNumber;
        driver.deliveryRadius = deliveryRadius;
        driver.phoneNumber = phoneNumber;
  
        await driver.save();
  
        console.log('Vehicle details updated successfully for driver:', driver);
        res.status(200).json({ message: 'Vehicle registered successfully', driver });
      } catch (error) {
        console.error('Error updating vehicle details:', error);
        res.status(500).json({ message: 'Error updating vehicle details', error });
      }
    }
  ];
  
  
  exports.getDriverProfile = async (req, res) => {
    try {
      // Find the driver and populate the 'userId' field to include 'name'
      const driver = await Driver.findOne({ userId: req.user.userId }).populate('userId', 'name');
      
      if (!driver) {
        return res.status(404).json({ message: 'Driver profile not found' });
      }
  
      res.json(driver);
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      res.status(500).json({ message: 'Error fetching driver profile' });
    }
  };
  
  exports.updateDriverProfile = async (req, res) => {
    console.log("Starting updateDriverProfile...");
  
    const { vehicleType, licenseNumber, deliveryRadius, phoneNumber, currentStatus, name, address } = req.body;
    const userId = req.user.userId;
    console.log("User ID from request:", userId);
    console.log("Values to update in User document:", { name });
  
    try {
      console.log("Attempting to update User document with name...");
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name }, // Update only `name` in User document
        { new: true }
      );
      console.log("User document updated:", updatedUser);
  
      console.log("Attempting to update Driver document...");
      const updatedDriver = await Driver.findOneAndUpdate(
        { userId },
        { vehicleType, licenseNumber, deliveryRadius, phoneNumber, currentStatus, address },
        { new: true }
      );
      console.log("Driver document updated:", updatedDriver);
  
      if (!updatedDriver || !updatedUser) {
        console.log("Either User or Driver profile not found.");
        return res.status(404).json({ message: 'Driver or User profile not found' });
      }
  
      res.json({ message: 'Driver profile updated successfully', driver: updatedDriver, user: updatedUser });
    } catch (error) {
      console.error("Error updating driver profile:", error);
      res.status(500).json({ message: 'Error updating driver profile', error });
    }
  };
  
  

// controllers/driverController.js
exports.uploadProfilePhoto = async (req, res) => {
  try {
    console.log("Upload Profile Photo API called");

    // Check if authentication is applied by logging req.user
    console.log("req.user:", req.user); // Log req.user to check if it's populated

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // Check if a file exists in the request
    if (!req.file) {
      console.log("No file uploaded in the request");
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const driverId = req.user.userId;
    console.log("Driver ID:", driverId);

    const photoPath = `/uploads/${req.file.filename}`;
    console.log("File path to save:", photoPath);

    const driver = await Driver.findOneAndUpdate(
      { userId: driverId },
      { profilePhoto: photoPath },
      { new: true }
    );

    if (!driver) {
      console.log("No driver profile found for this user ID:", driverId);
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    console.log("Profile photo updated successfully:", driver);
    res.status(200).json({ message: 'Profile photo uploaded successfully', profilePhoto: driver.profilePhoto });
  } catch (error) {
    console.error("Error in uploadProfilePhoto:", error);
    res.status(500).json({ message: 'Error uploading profile photo', error });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name') // Populate customer name
      .populate('providerId', 'restaurantName') // Populate provider details
      .populate('driverId', 'userId'); // Populate driver details if assigned
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// Assign an order to the logged-in driver
exports.assignOrder = async (req, res) => {
  try {
    const { orderId } = req.body; // Order ID from the request
    const driverId = req.user.userId; // Logged-in driver's user ID

    // Update the order with the driver ID and mark as assigned
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { driverId, status: 'assigned' },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order assigned to driver', order: updatedOrder });
  } catch (error) {
    console.error('Error assigning order:', error);
    res.status(500).json({ message: 'Error assigning order', error });
  }
};

exports.unassignOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { driverId: null, status: 'pending' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order unassigned successfully', order });
  } catch (error) {
    console.error('Error unassigning order:', error);
    res.status(500).json({ message: 'Error unassigning order', error });
  }
};

exports.getAssignedOrders = async (req, res) => {
  try {
    // Find the driver's `_id` using the `userId`
    const driver = await Driver.findOne({ userId: req.user.userId });

    if (!driver) {
      console.log('Driver not found for userId:', req.user.userId);
      return res.status(404).json({ message: 'Driver not found.' });
    }

    console.log('Driver found:', driver);

    // Fetch orders assigned to the driver's `_id`
    const orders = await Order.find({ driverId: driver._id })
      .populate({
        path: 'customerId',
        populate: {
          path: 'userId', // Populate the `userId` from the `Customer` document
          select: 'name', // Select only the `name` field
        },
      })
      .populate('providerId', 'restaurantName'); // Populate provider details

    console.log('Populated Orders:', JSON.stringify(orders, null, 2));

    if (!orders.length) {
      console.log(`No orders found for driver ID: ${driver._id}`);
      return res.status(404).json({ message: 'No orders found for this driver.' });
    }

    console.log(`Found ${orders.length} assigned orders for driver ID: ${driver._id}`);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching assigned orders:', error);
    res.status(500).json({ message: 'Error fetching assigned orders', error });
  }
};






