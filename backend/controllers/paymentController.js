const Payment = require('../models/Payment');
const Party = require('../models/Party');
const User = require('../models/User');
const mongoose = require('mongoose');

// Payment WhatsApp function exists but is NOT called
// (Payment info is already included in order WhatsApp message)

const recordPayment = async (req, res) => {
  try {
    const { partyId, amount, paymentMethod, notes } = req.body;
    
    // Find party
    const party = await Party.findById(partyId);
    if (!party) return res.status(404).json({ message: 'Party not found' });

    // Find user (person recording payment)
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Create payment
    const payment = new Payment({
      party: partyId,
      amount,
      paymentMethod,
      notes,
      receivedBy: req.userId,
      paymentType: 'standalone'
    });

    await payment.save();
    await payment.populate('receivedBy', 'name');

    // ✅ NO WhatsApp for standalone payments - only send WhatsApp when payment is WITH order
    // The order WhatsApp message already includes payment info

    res.status(201).json(payment);
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPaymentsByParty = async (req, res) => {
  try {
    const { partyId } = req.params;
    const payments = await Payment.find({ party: partyId })
      .populate('receivedBy', 'name')
      .populate('order', 'orderNumber')
      .sort({ paymentDate: -1 });
    const totalReceived = await Payment.aggregate([
      { $match: { party: new mongoose.Types.ObjectId(partyId) } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    res.json({ payments, totalReceived: totalReceived[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const { startDate, endDate, partyId } = req.query;
    let query = {};
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    if (partyId) query.party = partyId;
    const payments = await Payment.find(query)
      .populate('party', 'name phone')
      .populate('receivedBy', 'name')
      .populate('order', 'orderNumber')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const partyWisePayments = await Payment.aggregate([
      { $group: { _id: '$party', totalReceived: { $sum: '$amount' }, paymentCount: { $sum: 1 } } },
      { $lookup: { from: 'parties', localField: '_id', foreignField: '_id', as: 'partyDetails' } },
      { $unwind: '$partyDetails' },
      { $project: { partyName: '$partyDetails.name', partyPhone: '$partyDetails.phone', totalReceived: 1, paymentCount: 1 } },
      { $sort: { totalReceived: -1 } }
    ]);
    res.json({ totalPayments: totalPayments[0]?.total || 0, partyWisePayments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { recordPayment, getPaymentsByParty, getAllPayments, getPaymentStats };