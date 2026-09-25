require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const customerRoutes = require('./routes/customer.routes');

const app = express();

// Global middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);

// Routes
app.get('/health', (req, res) => {
  return res.json({ success: true, message: 'ShopKart API is running' });
});
app.use('/customers', customerRoutes);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI 

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`ShopKart backend running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  });
