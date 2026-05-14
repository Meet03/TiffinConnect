const User = require('../models/User');
const Provider = require('../models/Provider');
const Order = require('../models/Order');
const Driver = require('../models/Driver'); // Import Driver model



// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};



// Get provider by ID
exports.getProviderById = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
    res.status(500).json({ message: 'Failed to fetch provider' });
  }
};

// Update provider
exports.updateProvider = async (req, res) => {
  try {
    const updatedProvider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json(updatedProvider);
  } catch (error) {
    console.error('Error updating provider:', error);
    res.status(500).json({ message: 'Failed to update provider' });
  }
};

// Delete provider
exports.deleteProvider = async (req, res) => {
  try {
    const deletedProvider = await Provider.findByIdAndDelete(req.params.id);
    if (!deletedProvider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    res.status(200).json({ message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting provider:', error);
    res.status(500).json({ message: 'Failed to delete provider' });
  }
};

exports.getAllUsers = async (req, res) => {
    console.log('Fetching all users...');
    try {
      const users = await User.find();
      console.log(`Found ${users.length} users`);
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users', error });
    }
  };
  
  exports.getAllProviders = async (req, res) => {
    console.log('Fetching all providers...');
    try {
      const providers = await Provider.find();
      console.log(`Found ${providers.length} providers`);
      res.json(providers);
    } catch (error) {
      console.error('Error fetching providers:', error);
      res.status(500).json({ message: 'Error fetching providers', error });
    }
  };
  
  exports.getAllOrders = async (req, res) => {
    console.log('Fetching all orders...');
    try {
      const orders = await Order.find().populate('customerId providerId');
      console.log(`Found ${orders.length} orders`);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Error fetching orders', error });
    }
  };

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().populate('userId', 'name'); // Populate user details
    res.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ message: 'Error fetching drivers', error });
  }
};

  
exports.assignOrderToDriver = async (req, res) => {
  try {
    const { orderId, driverId } = req.body;

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
  
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { driverId: null, status: 'pending' },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json(updatedOrder);
    } catch (error) {
      console.error('Error unassigning order:', error);
      res.status(500).json({ message: 'Error unassigning order', error });
    }
  };

  // Update order
exports.updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Failed to update order' });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

