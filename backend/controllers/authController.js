const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Provider = require('../models/Provider');
const Driver = require('../models/Driver'); 

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    console.log(`Attempting to register user: ${name}, Role: ${role}`);

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Registration failed: Email ${email} already exists`);
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log(`Password hashed for user: ${email}`);

    // Create the user in the User collection
    const user = await User.create({ name, email, password: hashedPassword, role });
    console.log(`User created in User collection with ID: ${user._id}`);

    // Check the role and create an entry in the respective collection
    if (role === 'customer') {
      const customer = await Customer.create({ userId: user._id, name, address: user.address });
      console.log(`Customer entry created in Customer collection with ID: ${customer._id}`);
    } else if (role === 'provider') {
      const provider = await Provider.create({ userId: user._id, name, restaurantName: `${name}'s Kitchen`, address: user.address });
      console.log(`Provider entry created in Provider collection with ID: ${provider._id}`);
    }  else if (role === 'driver') {
      const driver = await Driver.create({ userId: user._id });
      console.log(`Driver profile created with ID: ${driver._id} for user: ${user._id}`);
    }

    console.log(`Registration successful for user: ${email}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(`Error during registration for user ${email}:`, error.message);
    res.status(500).json({ message: error.message });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log(`Attempting login for user: ${email}`);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login failed: No user found with email ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.log(`Login failed: Incorrect password for user ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create and send JWT
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log(`Login successful for user: ${email}, Role: ${user.role}, Token generated`);

    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error(`Error during login for user ${email}:`, error.message);
    res.status(500).json({ message: error.message });
  }
};
