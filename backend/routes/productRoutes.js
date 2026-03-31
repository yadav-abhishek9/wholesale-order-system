// COMPLETE FILE: backend/routes/productRoutes.js
// Replace entire file with this

const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { auth, adminAuth } = require('../middleware/auth');

// Get all products (public - no auth needed)
router.get('/', getProducts);

// Get single product by ID
router.get('/:id', getProductById);

// Create product (admin only)
router.post('/', adminAuth, createProduct);

// Update product (admin only)
router.put('/:id', adminAuth, updateProduct);

// Delete product (admin only)
router.delete('/:id', adminAuth, deleteProduct);

module.exports = router;