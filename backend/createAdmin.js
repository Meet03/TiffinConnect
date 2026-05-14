/**
 * createAdmin.js
 * Run from backend folder: node createAdmin.js
 * Creates a dedicated admin account
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const email    = 'admin@tiffinconnect.com';
  const password = 'Admin@1234';

  const existing = await User.findOne({ email });
  if (existing) {
    // If exists, just make sure it's admin role
    existing.role = 'admin';
    await existing.save();
    console.log('✅ Existing user updated to admin role');
  } else {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      name:     'Meet Amin',
      email,
      password: hashed,
      role:     'admin',
      isActive: true,
    });
    console.log('✅ Admin user created!');
  }

  console.log('\n─────────────────────────────');
  console.log('  Email:    admin@tiffinconnect.com');
  console.log('  Password: Admin@1234');
  console.log('─────────────────────────────\n');

  await mongoose.disconnect();
  process.exit(0);
}

createAdmin().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});