// COMPLETE REPLACEMENT: backend/models/Product.js
// Features: Image upload, Size variants, Subcategories

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subCategory: {
    type: String,
    trim: true,
    default: null  // e.g., "Non-stick", "Stainless Steel", "Ceramic"
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,  // Base64 encoded image
    default: null
  },
  // Size variants
  hasSizes: {
    type: Boolean,
    default: false
  },
  sizes: [{
    sizeName: {
      type: String,
      required: true,
      trim: true  // e.g., "S", "M", "L", "XL" or "8 inch", "10 inch"
    },
    sizePrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  description: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);