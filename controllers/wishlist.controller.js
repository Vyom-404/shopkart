const mongoose = require('mongoose');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');

const validateProductId = (productId, res) => {
  if (!mongoose.isValidObjectId(productId)) {
    res.status(400).json({ success: false, message: 'Invalid product ID' });
    return false;
  }
  return true;
};

const addToWishlist = async (req, res) => {
  const { productId } = req.params;
  if (!validateProductId(productId, res)) return;

  try {
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) return res.status(404).json({ success: false, message: 'Product not found' });

    const result = await Customer.updateOne(
      { _id: req.user._id, wishlist: { $ne: productId } },
      { $addToSet: { wishlist: productId } }
    );

    if (result.modifiedCount === 0) {
      const customerExists = await Customer.exists({ _id: req.user._id });
      if (!customerExists) return res.status(401).json({ success: false, message: 'Not authorized' });
      return res.status(409).json({ success: false, message: 'Product is already in wishlist' });
    }

    return res.json({ success: true, message: 'Product added to wishlist' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to add product to wishlist' });
  }
};

const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id)
      .populate({ path: 'wishlist', select: 'name price category image stock' });
    if (!customer) return res.status(401).json({ success: false, message: 'Not authorized' });
    const wishlist = customer.wishlist.filter(Boolean);
    return res.json({ success: true, count: wishlist.length, wishlist });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load wishlist' });
  }
};

const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  if (!validateProductId(productId, res)) return;

  try {
    const result = await Customer.updateOne(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: 'Product is not in wishlist' });
    }
    return res.json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to remove product from wishlist' });
  }
};

const toggleWishlist = async (req, res) => {
  const { productId } = req.params;
  if (!validateProductId(productId, res)) return;

  try {
    const removed = await Customer.updateOne(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } }
    );
    if (removed.modifiedCount > 0) {
      return res.json({ success: true, saved: false, message: 'Product removed from wishlist' });
    }

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) return res.status(404).json({ success: false, message: 'Product not found' });

    const added = await Customer.updateOne(
      { _id: req.user._id, wishlist: { $ne: productId } },
      { $addToSet: { wishlist: productId } }
    );
    if (added.modifiedCount > 0) {
      return res.json({ success: true, saved: true, message: 'Product added to wishlist' });
    }

    // If another toggle added it between the remove and add attempts, this
    // request is the next toggle and removes it again.
    const concurrentRemove = await Customer.updateOne(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } }
    );
    if (concurrentRemove.modifiedCount > 0) {
      return res.json({ success: true, saved: false, message: 'Product removed from wishlist' });
    }
    return res.status(401).json({ success: false, message: 'Not authorized' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to update wishlist' });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist };
