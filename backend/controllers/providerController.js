// backend/controllers/providerController.js

const Provider = require('../models/Provider');
const MenuItem = require('../models/MenuItem');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Customer = require('../models/Customer');
const Order = require('../models/Order'); 




// Get provider profile
exports.getProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.userId }).populate('userId');
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update provider profile
exports.updateProviderProfile = async (req, res) => {
  try {
    const updatedData = req.body;
    const provider = await Provider.findOneAndUpdate({ userId: req.user.userId }, updatedData, { new: true });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete provider profile
exports.deleteProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findOneAndDelete({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }
    res.json({ message: 'Provider profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new menu item for a provider
exports.createMenuItem = async (req, res) => {
  const { mealName, description, price, imageURL, mealType } = req.body;
  try {
    // Find the provider based on userId
    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found for this user' });
    }

    // Create the menu item using the correct providerId
    const menuItem = await MenuItem.create({
      providerId: provider._id,
      mealName,
      description,
      price,
      imageURL,
      mealType,
    });

    res.status(201).json(menuItem);
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all menu items for a provider
exports.getMenuItems = async (req, res) => {
  try {
    // Find the provider based on userId
    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found for this user" });
    }

    // Find menu items using the providerId
    const menuItems = await MenuItem.find({ providerId: provider._id }); // Query based on providerId
    res.json(menuItems); // Return the list of menu items
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ message: 'Error fetching menu items' });
  }
};


// Update a menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const updatedMenuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(updatedMenuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Create a new subscription plan
exports.createSubscriptionPlan = async (req, res) => {
  const { planName, description, price, duration, meals } = req.body;

  try {
    // Find the provider based on the logged-in user
    const provider = await Provider.findOne({ userId: req.user.userId });

    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Create the subscription plan with the correct provider ID
    const subscriptionPlan = await SubscriptionPlan.create({
      providerId: provider._id, // Use the provider document's _id, not the userId
      planName,
      description,
      price,
      duration,
      meals,
    });

    res.status(201).json(subscriptionPlan);
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    res.status(500).json({ message: error.message });
  }
};


// Update a subscription plan
exports.updateSubscriptionPlan = async (req, res) => {
  try {
    const { planName, description, price, duration, meals } = req.body;
    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(req.params.id, {
      planName,
      description,
      price,
      duration,
      meals // Update the menu items associated with the plan
    }, { new: true });

    if (!updatedPlan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
    res.json(updatedPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all subscription plans for a provider
exports.getSubscriptionPlans = async (req, res) => {
  try {
    console.log("getSubscriptionPlans API called for userId:", req.user.userId); // Debugging log for API call

    // Find the provider based on userId
    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: "Provider not found for this user" });
    }

    // Use the providerId to find subscription plans
    const plans = await SubscriptionPlan.find({ providerId: provider._id })
      .populate('meals', 'mealName'); // Populate meals with only the mealName field

    if (!plans.length) {
      console.log("No subscription plans found for providerId:", provider._id); // Debugging log for empty response
    } else {
      console.log("Subscription plans retrieved:", plans); // Debugging log for retrieved plans
    }

    res.json(plans);
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    res.status(500).json({ message: 'Error fetching subscription plans' });
  }
};



// Delete a subscription plan
exports.deleteSubscriptionPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }
    res.json({ message: 'Subscription plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// backend/controllers/providerController.js

exports.getAllSubscriptionPlans = async (req, res) => {
  try {
    console.log("getAllSubscriptionPlans API called");
    const plans = await SubscriptionPlan.find({})
      .populate('meals', 'mealName price')
      .populate('providerId', 'restaurantName'); 

    console.log("Raw subscription plans retrieved:", plans);

    if (plans.length === 0) {
      console.log("No subscription plans found");
    } else {
      console.log("Subscription plans retrieved:");
      plans.forEach((plan, index) => {
        console.log(`Plan ${index + 1}:`, {
          planName: plan.planName,
          provider: plan.providerId ? plan.providerId.restaurantName : "No provider",
          meals: plan.meals.map((meal) => meal.mealName),
        });
      });
    }

    res.json(plans);
  } catch (error) {
    console.error("Error fetching all subscription plans:", error);
    res.status(500).json({ message: 'Error fetching all subscription plans' });
  }
};


exports.getSubscriptionById = async (req, res) => {
  try {
    console.log(`Fetching subscription with ID: ${req.params.id}`);
    const subscription = await SubscriptionPlan.findById(req.params.id).populate('meals', 'mealName price');
    if (!subscription) {
      console.log(`Subscription with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Subscription not found' });
    }
    console.log(`Subscription fetched successfully: ${JSON.stringify(subscription)}`);
    res.json(subscription);
  } catch (error) {
    console.error(`Error fetching subscription with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching subscription', error });
  }
};

// Book subscription for customer
exports.bookSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body; // This is the correct field sent from the frontend
    const customerId = req.user.userId;

    console.log('Received subscriptionId:', subscriptionId);
    console.log('Customer ID from JWT:', customerId);

    const subscription = await SubscriptionPlan.findById(subscriptionId).populate('providerId');
    console.log('Fetched subscription object:', subscription);

    if (!subscription) {
      console.log('Subscription plan not found for ID:', subscriptionId);
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    const customer = await Customer.findOneAndUpdate(
      { userId: customerId },
      {
        $push: {
          subscriptions: {
            providerId: subscription.providerId._id,
            subscriptionPlanId: subscription._id,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        },
      },
      { new: true }
    );
    console.log('Updated customer object:', customer);

    if (!customer) {
      console.log('Customer not found for ID:', customerId);
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Create a new order
    const order = new Order({
      customerId: customer._id,
      providerId: subscription.providerId._id,
      subscriptionPlanId: subscription._id, // Ensure correct key
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'pending',
    });

    console.log('Order object before saving:', order);

    await order.save();

    console.log('Order saved successfully:', order);

    res.status(200).json({
      message: 'Subscription booked successfully',
      customer,
      order,
      subscription,
    });
  } catch (error) {
    console.error('Error booking subscription:', error);
    res.status(500).json({ message: 'Error booking subscription', error });
  }
};

// Get order history for the provider
exports.getOrderHistoryForProvider = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.userId });
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const orders = await Order.find({ providerId: provider._id })
      .populate('customerId', 'name') // Populate customer details
      .populate('subscriptionPlanId', 'planName'); // Populate subscription plan details

    // If no orders found, return an empty array instead of an error
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching provider orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};





