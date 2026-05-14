/**
 * seedOrders.js
 * Run from backend folder: node seedOrders.js
 * Creates a dummy provider, menu items, subscription plans, and orders for c1@gmail.com
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

const User             = require('./models/User');
const Customer         = require('./models/Customer');
const Provider         = require('./models/Provider');
const MenuItem         = require('./models/MenuItem');
const SubscriptionPlan = require('./models/SubscriptionPlan');
const Order            = require('./models/Order');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // ── 1. Find c1 customer ──────────────────────────────────
  const c1User = await User.findOne({ email: 'c1@gmail.com' });
  if (!c1User) {
    console.error('❌ c1@gmail.com not found. Please register first.');
    process.exit(1);
  }

  const c1Customer = await Customer.findOne({ userId: c1User._id });
  if (!c1Customer) {
    console.error('❌ Customer document not found for c1@gmail.com.');
    process.exit(1);
  }

  console.log('✅ Found customer:', c1User.name);

  // ── 2. Create dummy provider user ───────────────────────
  let providerUser = await User.findOne({ email: 'provider_demo@gmail.com' });
  if (!providerUser) {
    const hashed = await bcrypt.hash('password123', 10);
    providerUser = await User.create({
      name:          'Priya Kitchen',
      email:         'provider_demo@gmail.com',
      password:      hashed,
      role:          'provider',
      contactNumber: '647-555-0101',
      address:       '456 Hurontario St, Mississauga, ON',
    });
    console.log('✅ Provider user created');
  } else {
    console.log('ℹ️  Provider user already exists');
  }

  // ── 3. Create provider profile ──────────────────────────
  let provider = await Provider.findOne({ userId: providerUser._id });
  if (!provider) {
    provider = await Provider.create({
      userId:         providerUser._id,
      restaurantName: 'Priya\'s Home Kitchen',
      deliveryOptions:'Home Delivery',
      rating:         4.8,
      address:        '456 Hurontario St, Mississauga, ON',
    });
    console.log('✅ Provider profile created');
  } else {
    console.log('ℹ️  Provider profile already exists');
  }

  // ── 4. Create menu items ────────────────────────────────
  const menuData = [
    { mealName: 'Dal Tadka',        description: 'Lentils tempered with ghee and spices',    price: 8,  mealType: 'vegetarian'     },
    { mealName: 'Palak Paneer',     description: 'Cottage cheese in creamy spinach gravy',   price: 10, mealType: 'vegetarian'     },
    { mealName: 'Chicken Curry',    description: 'Tender chicken in rich masala sauce',       price: 13, mealType: 'non-vegetarian' },
    { mealName: 'Vegan Buddha Bowl',description: 'Quinoa, roasted veggies, tahini dressing', price: 11, mealType: 'vegan'          },
    { mealName: 'Butter Chicken',   description: 'Creamy tomato-butter chicken gravy',        price: 14, mealType: 'non-vegetarian' },
    { mealName: 'Aloo Gobi',        description: 'Potato and cauliflower dry curry',          price: 9,  mealType: 'vegetarian'     },
  ];

  const menuItems = [];
  for (const item of menuData) {
    let existing = await MenuItem.findOne({ providerId: provider._id, mealName: item.mealName });
    if (!existing) {
      existing = await MenuItem.create({ ...item, providerId: provider._id, availability: true });
    }
    menuItems.push(existing);
  }
  console.log('✅ Menu items ready:', menuItems.length);

  // ── 5. Create subscription plans ────────────────────────
  const plansData = [
    {
      planName:    'Weekly Veg Plan',
      description: 'Fresh vegetarian meals every day for a week',
      price:       49,
      duration:    'weekly',
      meals:       [menuItems[0]._id, menuItems[1]._id, menuItems[5]._id],
    },
    {
      planName:    'Monthly Non-Veg Plan',
      description: 'Hearty non-veg meals delivered daily for a month',
      price:       179,
      duration:    'monthly',
      meals:       [menuItems[2]._id, menuItems[4]._id],
    },
    {
      planName:    'Vegan Weekly Plan',
      description: 'Plant-based clean eating for the whole week',
      price:       55,
      duration:    'weekly',
      meals:       [menuItems[3]._id, menuItems[0]._id],
    },
  ];

  const plans = [];
  for (const p of plansData) {
    let existing = await SubscriptionPlan.findOne({ providerId: provider._id, planName: p.planName });
    if (!existing) {
      existing = await SubscriptionPlan.create({ ...p, providerId: provider._id });
    }
    plans.push(existing);
  }
  console.log('✅ Subscription plans ready:', plans.length);

  // ── 6. Create dummy orders for c1 ───────────────────────
  const ordersData = [
    {
      customerId:         c1Customer._id,
      providerId:         provider._id,
      subscriptionPlanId: plans[0]._id,
      startDate:          new Date('2025-01-01'),
      endDate:            new Date('2025-01-07'),
      status:             'completed',
      deliveryStatus:     'completed',
    },
    {
      customerId:         c1Customer._id,
      providerId:         provider._id,
      subscriptionPlanId: plans[1]._id,
      startDate:          new Date('2025-02-01'),
      endDate:            new Date('2025-02-28'),
      status:             'completed',
      deliveryStatus:     'completed',
    },
    {
      customerId:         c1Customer._id,
      providerId:         provider._id,
      subscriptionPlanId: plans[2]._id,
      startDate:          new Date('2025-03-10'),
      endDate:            new Date('2025-03-17'),
      status:             'assigned',
      deliveryStatus:     'assigned',
    },
    {
      customerId:         c1Customer._id,
      providerId:         provider._id,
      subscriptionPlanId: plans[0]._id,
      startDate:          new Date('2025-04-01'),
      endDate:            new Date('2025-04-07'),
      status:             'pending',
      deliveryStatus:     'unassigned',
    },
  ];

  let created = 0;
  for (const o of ordersData) {
    const exists = await Order.findOne({
      customerId:         o.customerId,
      subscriptionPlanId: o.subscriptionPlanId,
      startDate:          o.startDate,
    });
    if (!exists) {
      await Order.create(o);
      created++;
    }
  }

  console.log(`✅ Orders created: ${created} new (${ordersData.length - created} already existed)`);
  console.log('\n🎉 Seed complete! Login as c1@gmail.com and check Order History.');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err.message);
  process.exit(1);
});