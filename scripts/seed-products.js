require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('../models/product.model');

const products = [
  { name: 'Noise Cancelling Headphones', description: 'Wireless over-ear headphones with active noise cancellation and a comfortable fit.', price: 4999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85', stock: 25 },
  { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with tactile blue switches and a durable compact design.', price: 2999, category: 'Electronics', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=85', stock: 10 },
  { name: 'Everyday Backpack', description: 'A lightweight everyday backpack with a padded laptop sleeve and roomy compartments.', price: 1899, category: 'Fashion', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85', stock: 18 },
  { name: 'Classic Cotton T-Shirt', description: 'A soft, breathable cotton T-shirt made for comfortable everyday wear.', price: 799, category: 'Fashion', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85', stock: 32 },
  { name: 'The Creative Act', description: 'A thoughtful guide to creativity, practice, and bringing ideas into the world.', price: 599, category: 'Books', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1000&q=85', stock: 14 },
  { name: 'Ceramic Table Vase', description: 'A handcrafted-style ceramic vase with a warm finish for fresh or dried stems.', price: 1299, category: 'Home', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=1000&q=85', stock: 7 },
  { name: 'Wireless Charging Stand', description: 'A compact wireless charging stand that keeps your compatible phone visible while charging.', price: 1599, category: 'Electronics', image: 'https://sprig.store/cdn/shop/files/133.png?v=1766375851', stock: 0 },
  { name: 'Insulated Travel Mug', description: 'A reusable insulated mug that keeps drinks warm while you are on the move.', price: 999, category: 'Home', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1000&q=85', stock: 21 }
];

async function seedProducts() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set');
  await mongoose.connect(process.env.MONGO_URI);
  let added = 0;
  for (const product of products) {
    const result = await Product.updateOne({ name: product.name }, { $setOnInsert: product }, { upsert: true });
    if (result.upsertedCount) added += 1;
  }
  console.log(`Product seed complete: ${added} added, ${products.length - added} already existed.`);
  await mongoose.disconnect();
}

seedProducts().catch(async (error) => {
  console.error('Product seed failed:', error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});
