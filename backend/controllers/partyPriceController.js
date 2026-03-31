// COMPLETE REPLACEMENT: backend/controllers/partyPriceController.js

const PartyPrice = require('../models/PartyPrice');
const Product = require('../models/Product');
const Party = require('../models/Party');

// Get all party prices for a specific party
const getPartyPrices = async (req, res) => {
  try {
    const { partyId } = req.params;

    console.log('📋 Getting party prices for:', partyId);

    const partyPrices = await PartyPrice.find({ party: partyId })
      .populate('product', 'name basePrice unit category subCategory hasSizes sizes image');

    console.log('✅ Found party prices:', partyPrices.length);

    res.json(partyPrices);
  } catch (error) {
    console.error('❌ Error getting party prices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Set party prices (bulk update)
const setPartyPrices = async (req, res) => {
  try {
    const { partyId, prices } = req.body;

    console.log('💰 Setting party prices for:', partyId);
    console.log('📦 Number of products:', prices.length);

    // Verify party exists
    const party = await Party.findById(partyId);
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }

    const results = [];

    for (const priceData of prices) {
      const { productId, customPrice, sizePrices } = priceData;

      // Verify product exists
      const product = await Product.findById(productId);
      if (!product) {
        console.log('⚠️ Product not found:', productId);
        continue;
      }

      // Check if party price already exists
      let partyPrice = await PartyPrice.findOne({ 
        party: partyId, 
        product: productId 
      });

      if (partyPrice) {
        // Update existing party price
        if (product.hasSizes && sizePrices && sizePrices.length > 0) {
          partyPrice.sizePrices = sizePrices;
          partyPrice.customPrice = null;
        } else {
          partyPrice.customPrice = customPrice;
          partyPrice.sizePrices = [];
        }
        await partyPrice.save();
        console.log('✏️ Updated price for:', product.name);
      } else {
        // Create new party price
        partyPrice = new PartyPrice({
          party: partyId,
          product: productId,
          customPrice: product.hasSizes ? null : customPrice,
          sizePrices: product.hasSizes ? sizePrices : []
        });
        await partyPrice.save();
        console.log('➕ Created price for:', product.name);
      }

      results.push(partyPrice);
    }

    console.log('✅ Party prices set successfully:', results.length);

    res.json({ 
      message: 'Party prices set successfully',
      count: results.length,
      prices: results
    });
  } catch (error) {
    console.error('❌ Error setting party prices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Copy prices from one party to another
const copyPrices = async (req, res) => {
  try {
    const { fromPartyId, toPartyId } = req.body;

    console.log('📋 Copying prices from', fromPartyId, 'to', toPartyId);

    // Verify both parties exist
    const fromParty = await Party.findById(fromPartyId);
    const toParty = await Party.findById(toPartyId);

    if (!fromParty || !toParty) {
      return res.status(404).json({ message: 'One or both parties not found' });
    }

    // Get all prices from source party
    const sourcePrices = await PartyPrice.find({ party: fromPartyId });

    console.log('📦 Found prices to copy:', sourcePrices.length);

    if (sourcePrices.length === 0) {
      return res.status(404).json({ message: 'No prices found for source party' });
    }

    // Delete existing prices for target party
    await PartyPrice.deleteMany({ party: toPartyId });
    console.log('🗑️ Deleted existing prices for target party');

    // Create new prices for target party
    const newPrices = sourcePrices.map(price => ({
      party: toPartyId,
      product: price.product,
      customPrice: price.customPrice,
      sizePrices: price.sizePrices
    }));

    const copiedPrices = await PartyPrice.insertMany(newPrices);

    console.log('✅ Prices copied successfully:', copiedPrices.length);

    res.json({ 
      message: 'Prices copied successfully',
      count: copiedPrices.length
    });
  } catch (error) {
    console.error('❌ Error copying prices:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a specific party price
const deletePartyPrice = async (req, res) => {
  try {
    const { partyId, productId } = req.params;

    console.log('🗑️ Deleting party price:', partyId, productId);

    const result = await PartyPrice.findOneAndDelete({
      party: partyId,
      product: productId
    });

    if (!result) {
      return res.status(404).json({ message: 'Party price not found' });
    }

    console.log('✅ Party price deleted');

    res.json({ message: 'Party price deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting party price:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPartyPrices,
  setPartyPrices,
  copyPrices,
  deletePartyPrice
};