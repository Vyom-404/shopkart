const mongoose = require('mongoose');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

const productFields = 'name description price category image stock';

const validateProductId = (productId, res) => {
  if (!mongoose.isValidObjectId(productId)) {
    res.status(400).json({ success: false, message: 'Invalid product ID' });
    return false;
  }
  return true;
};

const getCartItems = async (customerId) => {
  const cart = await Cart.findOne({ customer: customerId })
    .populate({ path: 'items.product', select: productFields });
  if (!cart) return [];
  return cart.items
    .filter((item) => item.product)
    .map((item) => ({ product: item.product, quantity: item.quantity }));
};

const getOrCreateCart = async (customerId) => {
  let cart = await Cart.findOne({ customer: customerId });
  if (cart) return cart;
  try {
    return await Cart.create({ customer: customerId, items: [] });
  } catch (error) {
    if (error.code !== 11000) throw error;
    cart = await Cart.findOne({ customer: customerId });
    if (!cart) throw error;
    return cart;
  }
};

const saveWithRetry = async (customerId, mutate) => {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const cart = await getOrCreateCart(customerId);
    const result = mutate(cart);
    if (result) return { cart: null, result };
    try {
      await cart.save();
      return { cart, result: null };
    } catch (error) {
      if (!(error instanceof mongoose.Error.VersionError) || attempt === 3) throw error;
    }
  }
  throw new Error('Unable to update cart');
};

const sendUpdatedCart = async (res, message, customerId) => {
  const cart = await getCartItems(customerId);
  return res.json({ success: true, message, cart });
};

const addToCart = async (req, res) => {
  const { productId } = req.params;
  if (!validateProductId(productId, res)) return;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const { result } = await saveWithRetry(req.user._id, (cart) => {
      const item = cart.items.find((entry) => entry.product.toString() === productId);
      const quantity = item ? item.quantity + 1 : 1;
      if (quantity > product.stock) {
        return { status: 400, message: 'Requested quantity exceeds available stock' };
      }
      if (item) item.quantity = quantity;
      else cart.items.push({ product: product._id, quantity: 1 });
      return null;
    });
    if (result) return res.status(result.status).json({ success: false, message: result.message });
    return sendUpdatedCart(res, 'Cart updated', req.user._id);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Unable to update cart' });
  }
};

const getCart = async (req, res) => {
  try {
    const cart = await getCartItems(req.user._id);
    return res.json({ success: true, cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load cart' });
  }
};

const updateCartQuantity = async (req, res) => {
  const { productId } = req.params;
  if (!validateProductId(productId, res)) return;
  const { quantity } = req.body;
  if (typeof quantity !== 'number' || !Number.isFinite(quantity) || quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be a number of at least 1' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds available stock' });
    }

    const { result } = await saveWithRetry(req.user._id, (cart) => {
      const item = cart.items.find((entry) => entry.product.toString() === productId);
      if (!item) return { status: 404, message: 'Product is not in cart' };
      item.quantity = quantity;
      return null;
    });
    if (result) return res.status(result.status).json({ success: false, message: result.message });
    return sendUpdatedCart(res, 'Cart quantity updated', req.user._id);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: 'Unable to update cart quantity' });
  }
};

const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  if (!validateProductId(productId, res)) return;

  try {
    const { result } = await saveWithRetry(req.user._id, (cart) => {
      const index = cart.items.findIndex((entry) => entry.product.toString() === productId);
      if (index === -1) return { status: 404, message: 'Product is not in cart' };
      cart.items.splice(index, 1);
      return null;
    });
    if (result) return res.status(result.status).json({ success: false, message: result.message });
    return sendUpdatedCart(res, 'Product removed from cart', req.user._id);
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to remove product from cart' });
  }
};

module.exports = { addToCart, getCart, updateCartQuantity, removeFromCart };
