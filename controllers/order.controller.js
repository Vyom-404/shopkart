const crypto = require('crypto');
const mongoose = require('mongoose');
const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { createRazorpayOrder, isRazorpayConfigured } = require('../config/razorpay');

const cleanRequiredText = value => typeof value === 'string' ? value.trim() : '';

const validateShippingAddress = input => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Shipping details are required' };
  }

  const address = {
    fullName: cleanRequiredText(input.fullName),
    phone: cleanRequiredText(input.phone),
    addressLine1: cleanRequiredText(input.addressLine1),
    city: cleanRequiredText(input.city),
    state: cleanRequiredText(input.state),
    pincode: cleanRequiredText(input.pincode)
  };
  const missingField = Object.entries(address).find(([, value]) => !value);
  if (missingField) return { error: `${missingField[0]} is required` };

  const normalizedPhone = address.phone.replace(/[\s()-]/g, '');
  if (!/^\+?[1-9]\d{9,14}$/.test(normalizedPhone)) {
    return { error: 'Phone must be a valid number with 10 to 15 digits' };
  }
  if (!/^\d{6}$/.test(address.pincode)) {
    return { error: 'Pincode must contain 6 digits' };
  }

  address.phone = normalizedPhone;
  return { address };
};

const createPaymentOrder = async (req, res) => {
  const { address, error } = validateShippingAddress(req.body?.shippingAddress);
  if (error) return res.status(400).json({ success: false, message: error });

  let shopKartOrder;
  try {
    const cart = await Cart.findOne({ customer: req.user._id }).populate({
      path: 'items.product',
      select: 'name price image stock'
    });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const orderItems = [];
    let totalPaise = 0;
    for (const cartItem of cart.items) {
      const product = cartItem.product;
      if (!product) {
        return res.status(400).json({ success: false, message: 'A product in your cart is no longer available' });
      }
      if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1) {
        return res.status(400).json({ success: false, message: `Invalid quantity for ${product.name}` });
      }
      if (product.stock < cartItem.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Only ${product.stock} available.` });
      }

      const priceInPaise = Math.round(product.price * 100);
      totalPaise += priceInPaise * cartItem.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: priceInPaise / 100,
        quantity: cartItem.quantity,
        image: product.image
      });
    }

    if (!Number.isSafeInteger(totalPaise) || totalPaise <= 0) {
      return res.status(400).json({ success: false, message: 'The calculated order total is invalid' });
    }
    if (!isRazorpayConfigured()) {
      return res.status(503).json({ success: false, message: 'Razorpay Test Mode keys are not configured on the server' });
    }

    shopKartOrder = await Order.create({
      customer: req.user._id,
      items: orderItems,
      shippingAddress: address,
      totalAmount: totalPaise / 100,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT'
    });

    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder({
        amount: totalPaise,
        currency: 'INR',
        receipt: shopKartOrder._id.toString(),
        notes: { shopKartOrderId: shopKartOrder._id.toString(), customerId: req.user._id.toString() }
      });
      shopKartOrder.razorpayOrderId = razorpayOrder.id;
      await shopKartOrder.save();
    } catch (error) {
      await Order.deleteOne({ _id: shopKartOrder._id, customer: req.user._id });
      console.error('Razorpay order creation failed:', error.message);
      return res.status(502).json({ success: false, message: 'Unable to start payment. Your cart has not been changed.' });
    }

    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      totalAmount: shopKartOrder.totalAmount,
      items: shopKartOrder.items
    });
  } catch (error) {
    console.error('Checkout order creation failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to prepare your order. Your cart has not been changed.' });
  }
};

const verifyPayment = async (req, res) => {
  const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!mongoose.isValidObjectId(shopKartOrderId) || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification details are incomplete' });
  }

  try {
    const order = await Order.findOne({ _id: shopKartOrderId, customer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Payment order does not match this ShopKart order' });
    }
    if (order.paymentStatus === 'PAID') {
      if (order.razorpayPaymentId !== razorpay_payment_id) {
        return res.status(409).json({ success: false, message: 'This order has already been paid' });
      }
      return res.json({ success: true, message: 'Payment already verified', order });
    }

    if (!isRazorpayConfigured()) {
      return res.status(503).json({ success: false, message: 'Payment verification is not configured on the server' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
      .digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = Buffer.from(razorpay_signature, 'hex');
    if (expectedBuffer.length !== receivedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    const updatedCart = await Cart.updateOne({ customer: req.user._id }, { $set: { items: [] } });
    if (updatedCart.matchedCount === 0) {
      await Cart.create({ customer: req.user._id, items: [] });
    }
    return res.json({ success: true, message: 'Payment verified and order placed', order });
  } catch (error) {
    console.error('Payment verification failed:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to verify payment' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load orders' });
  }
};

const getOrder = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load order' });
  }
};

const advanceOrderStatus = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ success: false, message: 'Route not found' });
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid order ID' });
  }
  const nextStatus = { PLACED: 'CONFIRMED', CONFIRMED: 'SHIPPED', SHIPPED: 'DELIVERED' };
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (nextStatus[order.status] !== req.body?.status) {
      return res.status(400).json({ success: false, message: 'Use the next valid status in the order progression' });
    }
    order.status = req.body.status;
    await order.save();
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to update order status' });
  }
};

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrder, advanceOrderStatus };
