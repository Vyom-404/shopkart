const mongoose = require('mongoose');
const Product = require('../models/product.model');
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, product });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Unable to create product' });
  }
};

const getProducts = async (req, res) => {
  try {
    const query = {};
    if (req.query.search) query.name = { $regex: escapeRegex(String(req.query.search)), $options: 'i' };
    if (req.query.category) query.category = String(req.query.category);
    const sort = req.query.sort === 'price_asc' ? { price: 1 } : req.query.sort === 'price_desc' ? { price: -1 } : {};
    const products = await Product.find(query).select('name price category image stock').sort(sort).lean();
    return res.json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch products' });
  }
};

const getProduct = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }
  try {
    const product = await Product.findById(req.params.id).select('name description price category image stock createdAt');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    return res.json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to fetch product' });
  }
};

module.exports = { createProduct, getProducts, getProduct };
