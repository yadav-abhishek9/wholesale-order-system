// UPDATE: backend/models/Payment.js
// Replace entire file with this:

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'cheque', 'bank_transfer', 'other'],
    default: 'cash'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Track if payment was standalone or with order
  paymentType: {
    type: String,
    enum: ['standalone', 'with_order'],
    default: 'standalone'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);