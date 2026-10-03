const express = require('express');
const protect = require('../middlewares/auth.middleware');
const { addToWishlist, getWishlist, removeFromWishlist } = require('../controllers/wishlist.controller');

const router = express.Router();
router.use(protect);
router.post('/:productId', addToWishlist);
router.get('/', getWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
