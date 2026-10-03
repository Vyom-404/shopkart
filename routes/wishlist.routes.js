const express = require('express');
const protect = require('../middlewares/auth.middleware');
const { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist } = require('../controllers/wishlist.controller');

const router = express.Router();
router.use(protect);
router.post('/:productId', addToWishlist);
router.get('/', getWishlist);
router.patch('/:productId/toggle', toggleWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;
