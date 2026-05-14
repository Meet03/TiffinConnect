const Customer = require('../models/Customer');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Order = require('../models/Order'); 


// Get Customer Profile
exports.getCustomerProfile = async (req, res) => {
  try {
    console.log(`Fetching profile for userId: ${req.user.userId}`);
    
    const customer = await Customer.findOne({ userId: req.user.userId }).populate('favoriteProviders');
    if (!customer) {
      console.log('Customer not found');
      return res.status(404).json({ message: 'Customer not found' });
    }

    console.log(`Customer profile retrieved successfully for userId: ${req.user.userId}`);
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ message: 'Error retrieving profile', error });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, address, preferences } = req.body;
    const parsedPreferences = JSON.parse(preferences); 

    const profilePicture = req.file ? `${req.protocol}://${req.get('host')}/${req.file.path}` : null;

    const updatedCustomer = await Customer.findOneAndUpdate(
      { userId: req.user.userId },
      { name, address, preferences: parsedPreferences, profilePicture },
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', customer: updatedCustomer });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { subscriptionId, address, city, state, zipCode, cardNumber, expiryDate, cvv, cardHolderName } = req.body;
    
    console.log(`Processing payment for subscription ID: ${subscriptionId}`);

    // Mock success response
    res.status(200).json({ message: 'Payment processed successfully' });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Error processing payment', error });
  }
};

// Fetch order history for customer
exports.getOrderHistoryForCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ userId: req.user.userId });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const orders = await Order.find({ customerId: customer._id })
      .populate('providerId', 'restaurantName') // Populate provider's restaurant name
      .populate('subscriptionPlanId', 'planName startDate endDate'); // Populate subscription plan details

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching order history for customer:', error);
    res.status(500).json({ message: 'Error fetching order history', error });
  }
};


