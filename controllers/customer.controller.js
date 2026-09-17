const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// POST /customers/register
const register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const existing = await Customer.findOne({ email: String(email).toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const customer = await Customer.create({ fullName, email, password, phone });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: customer.toSafeJSON()
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /customers/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const customer = await Customer.findOne({ email: String(email).toLowerCase() });

    // Same generic message for a missing customer or a wrong password
    if (!customer || !(await customer.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(customer._id);
    res.cookie('token', token, cookieOptions);

    return res.json({
      success: true,
      message: 'Login successful',
      customer: customer.toSafeJSON()
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /customers/me (protected)
const getProfile = async (req, res) => {
  return res.json(req.user.toSafeJSON());
};

// POST /customers/logout (protected)
const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.json({ success: true, message: 'Logged out successfully' });
};

// PATCH /customers/change-password (protected) - bonus challenge
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both old and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const customer = await Customer.findById(req.user._id);

    if (!(await customer.comparePassword(oldPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    customer.password = newPassword;
    await customer.save();

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getProfile, logout, changePassword };
