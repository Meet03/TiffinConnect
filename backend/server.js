const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { authMiddleware, isAdmin } = require('./middleware/authMiddleware');
const SubscriptionPlan = require('./models/SubscriptionPlan');
const customerRoutes = require('./routes/customerRoutes');
const providerRoutes = require('./routes/providerRoutes');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const driverRoutes = require('./routes/driverRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());

// Importing models
const User = require('./models/User');
const Provider = require('./models/Provider');
const MenuItem = require('./models/MenuItem');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Delivery = require('./models/Delivery');
const Driver = require('./models/Driver');

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    await insertSampleData(); // ✅ Safe — only runs if DB is empty
  })
  .catch((error) => console.log('MongoDB connection error:', error));

// Routes
app.use('/api/provider', providerRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Safe insert — only runs when DB is completely empty
async function insertSampleData() {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Data already exists, skipping sample data insertion.');
      return;
    }

    console.log('Empty database detected, inserting sample data...');

    const hashedPassword = await bcrypt.hash('1111', 10);

    // Sample providers
    const providers = [
      { name: 'Provider 1', email: 'p1@gmail.com', restaurantName: 'Provider 1 Meals',   address: '101 Apple St, Foodville' },
      { name: 'Provider 2', email: 'p2@gmail.com', restaurantName: 'Provider 2 Kitchen', address: '202 Orange St, Mealville' },
      { name: 'Provider 3', email: 'p3@gmail.com', restaurantName: 'Provider 3 Dishes',  address: '303 Banana St, Tastyville' },
      { name: 'Provider 4', email: 'p4@gmail.com', restaurantName: 'Provider 4 Eatery',  address: '404 Cherry St, Foodtown' },
      { name: 'Provider 5', email: 'p5@gmail.com', restaurantName: 'Provider 5 Bistro',  address: '505 Grape St, Mealville' },
    ];

    for (const providerData of providers) {
      const user = await User.create({
        name: providerData.name,
        email: providerData.email,
        password: hashedPassword,
        role: 'provider',
        contactNumber: '1234567890',
        address: providerData.address,
        isVerified: true,
      });

      const provider = await Provider.create({
        userId: user._id,
        restaurantName: providerData.restaurantName,
        deliveryOptions: 'Home Delivery',
        rating: 4.5,
        address: providerData.address,
      });

      const menuItems = await MenuItem.insertMany([
        { providerId: provider._id, mealName: 'Meal A', price: 10.0, description: 'Delicious meal A', mealType: 'vegetarian' },
        { providerId: provider._id, mealName: 'Meal B', price: 15.0, description: 'Delicious meal B', mealType: 'non-vegetarian' },
      ]);

      await SubscriptionPlan.insertMany([
        { providerId: provider._id, planName: 'Weekly Plan',  price: 50,  duration: 'weekly',  meals: menuItems.map(i => i._id) },
        { providerId: provider._id, planName: 'Monthly Plan', price: 150, duration: 'monthly', meals: menuItems.map(i => i._id) },
      ]);
    }

    // Sample customers
    const customers = [
      { name: 'Customer 1', email: 'c1@gmail.com', address: 'Customer Address 1' },
      { name: 'Customer 2', email: 'c2@gmail.com', address: 'Customer Address 2' },
    ];

    for (const customerData of customers) {
      const user = await User.create({
        name: customerData.name,
        email: customerData.email,
        password: hashedPassword,
        role: 'customer',
        contactNumber: '9876543210',
        address: customerData.address,
        isVerified: true,
      });
      await Customer.create({ userId: user._id });
    }

    // Sample drivers
    const drivers = [
      { name: 'Driver 1', email: 'd1@gmail.com', address: 'Driver Address 1', currentStatus: 'available' },
      { name: 'Driver 2', email: 'd2@gmail.com', address: 'Driver Address 2', currentStatus: 'available' },
    ];

    for (const driverData of drivers) {
      const user = await User.create({
        name: driverData.name,
        email: driverData.email,
        password: hashedPassword,
        role: 'driver',
        contactNumber: '1231231230',
        address: driverData.address,
        isVerified: true,
      });
      await Driver.create({
        userId: user._id,
        vehicleType: 'Car',
        licenseNumber: `LICENSE-${Math.floor(1000 + Math.random() * 9000)}`,
        deliveryRadius: 50,
        currentStatus: driverData.currentStatus,
      });
    }

    // Sample orders
    const customer = await Customer.findOne();
    const provider = await Provider.findOne();
    const subscriptionPlan = await SubscriptionPlan.findOne();

    await Order.create([
      { customerId: customer._id, providerId: provider._id, subscriptionPlanId: subscriptionPlan._id, startDate: new Date(), endDate: new Date(), status: 'pending' },
      { customerId: customer._id, providerId: provider._id, subscriptionPlanId: subscriptionPlan._id, startDate: new Date(), endDate: new Date(), status: 'assigned' },
    ]);

    console.log('Sample data inserted successfully.');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});