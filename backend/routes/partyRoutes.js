const express = require('express');
const router = express.Router();
const {
  createParty,
  getParties,
  getPartyById,
  updateParty,
  deleteParty
} = require('../controllers/partyController');
const { auth, adminAuth } = require('../middleware/auth');

router.post('/', adminAuth, createParty);
router.get('/', auth, getParties);
router.get('/:id', auth, getPartyById);
router.put('/:id', adminAuth, updateParty);
router.delete('/:id', adminAuth, deleteParty);

module.exports = router;
