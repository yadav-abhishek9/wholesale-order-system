// COMPLETE REPLACEMENT: backend/models/PartyPrice.js
// Features: Size-wise pricing support

const mongoose = require('mongoose');

const partyPriceSchema = new mongoose.Schema({
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  // For products without sizes
  customPrice: {
    type: Number,
    min: 0,
    default: null
  },
  // For products with sizes - array of size-wise prices
  sizePrices: [{
    sizeName: {
      type: String,
      required: true
    },
    customPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, {
  timestamps: true
});

// Ensure unique party-product combination
partyPriceSchema.index({ party: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('PartyPrice', partyPriceSchema);