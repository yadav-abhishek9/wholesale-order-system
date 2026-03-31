// CREATE NEW FILE: backend/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getPaymentsByParty,
  getAllPayments,
  getPaymentStats
} = require('../controllers/paymentController');
const { auth, adminAuth } = require('../middleware/auth');

// Record payment (salesman can record)
router.post('/record', auth, recordPayment);

// Get payments by party
router.get('/party/:partyId', auth, getPaymentsByParty);

// Get all payments (admin only)
router.get('/', adminAuth, getAllPayments);

// Get payment statistics (admin only)
router.get('/stats/summary', adminAuth, getPaymentStats);

module.exports = router;