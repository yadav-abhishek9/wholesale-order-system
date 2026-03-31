// COMPLETE FILE: backend/routes/partyPriceRoutes.js

const express = require('express');
const router = express.Router();
const {
  getPartyPrices,
  setPartyPrices,
  copyPrices,
  deletePartyPrice
} = require('../controllers/partyPriceController');
const { auth, adminAuth } = require('../middleware/auth');

// Get all party prices for a specific party (SALESMEN NEED THIS!)
router.get('/:partyId', auth, getPartyPrices);  // Changed from adminAuth to auth

// Set party prices (admin only)
router.post('/set', adminAuth, setPartyPrices);

// Copy prices (admin only)
router.post('/copy', adminAuth, copyPrices);

// Delete price (admin only)
router.delete('/:partyId/:productId', adminAuth, deletePartyPrice);

module.exports = router;