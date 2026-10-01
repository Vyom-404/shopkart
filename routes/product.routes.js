const express = require('express');
const { createProduct, getProducts, getProduct } = require('../controllers/product.controller');

const router = express.Router();
router.post('/', createProduct);
router.get('/', getProducts);
router.get('/:id', getProduct);

module.exports = router;
