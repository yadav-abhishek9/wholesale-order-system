// CREATE NEW FILE: backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  updateUser, 
  deleteUser,
  toggleUserStatus 
} = require('../controllers/userController');
const { adminAuth } = require('../middleware/auth');

// All routes require admin authentication
router.get('/', adminAuth, getAllUsers);
router.put('/:id', adminAuth, updateUser);
router.delete('/:id', adminAuth, deleteUser);
router.patch('/:id/toggle-status', adminAuth, toggleUserStatus);

module.exports = router;