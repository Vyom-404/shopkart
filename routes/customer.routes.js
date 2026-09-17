const express = require('express');
const {
  register,
  login,
  getProfile,
  logout,
  changePassword
} = require('../controllers/customer.controller');
const protect = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getProfile);
router.post('/logout', protect, logout);
router.patch('/change-password', protect, changePassword);

module.exports = router;
