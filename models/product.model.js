const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'name is required'], trim: true },
  description: { type: String, required: [true, 'description is required'], trim: true },
  price: { type: Number, required: [true, 'price is required'], min: [Number.MIN_VALUE, 'price must be greater than 0'] },
  category: { type: String, required: [true, 'category is required'], trim: true },
  image: { type: String, required: [true, 'image is required'], trim: true },
  stock: { type: Number, required: [true, 'stock is required'], min: [0, 'stock cannot be negative'] }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('Product', productSchema);
