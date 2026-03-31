const express = require('express');
const router = express.Router();
const {
  createOrder,
  createOrderWithPayment,  // ✅ ADD THIS IMPORT
  getAllOrders,
  getOrderById,
  getDashboardStats,
  getChartStats,
  updateOrderStatus,
  deleteOrder,
  cancelOrder
} = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

// Create new order (salesman can create)
router.post('/', auth, createOrder);

// Create order with payment (salesman can create) - ✅ ADD THIS ROUTE
router.post('/with-payment', auth, createOrderWithPayment);

// Get all orders (both admin and salesman can view)
router.get('/', auth, getAllOrders);

// Get dashboard statistics (admin only)
router.get('/stats/dashboard', adminAuth, getDashboardStats);

// Get chart statistics (admin only)
router.get('/stats/chart', adminAuth, getChartStats);

// Get single order by ID
router.get('/:id', auth, getOrderById);

// Update order status (admin only)
router.put('/:id/status', adminAuth, updateOrderStatus);

// Cancel order with reason (admin only)
router.put('/:id/cancel', adminAuth, cancelOrder);

// Delete order (admin only)
router.delete('/:id', adminAuth, deleteOrder);

module.exports = router;