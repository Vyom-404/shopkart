const express = require('express');
const protect = require('../middlewares/auth.middleware');
const { addToCart, getCart, updateCartQuantity, removeFromCart } = require('../controllers/cart.controller');

const router = express.Router();
router.use(protect);
router.post('/:productId', addToCart);
router.get('/', getCart);
router.patch('/:productId', updateCartQuantity);
router.delete('/:productId', removeFromCart);

module.exports = router;
