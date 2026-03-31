const twilio = require('twilio');
const Order = require('../models/Order');
const Party = require('../models/Party');
const Product = require('../models/Product');

const generateOrderNumber = async () => {
  const lastOrder = await Order.findOne().sort({ createdAt: -1 });
  if (!lastOrder || !lastOrder.orderNumber) return 'ORD000001';
  const lastNumber = parseInt(lastOrder.orderNumber.replace('ORD', ''));
  return `ORD${String(lastNumber + 1).padStart(6, '0')}`;
};

const sendWhatsAppNotification = async (order, party, salesman, payment = null) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const toNumber = process.env.ADMIN_WHATSAPP_NUMBER;

    if (!accountSid || !authToken) {
      console.log('⚠️ Twilio not configured');
      return;
    }

    const client = twilio(accountSid, authToken);

    // Build message
    let message = `🎉 *New Order*\n\n`;
    message += `Order: ${order.orderNumber}\n`;
    message += `Party: ${party.name}\n`;
    message += `Salesman: ${salesman.name}\n`;

    // Add payment info RIGHT AFTER salesman name (if payment exists)
    if (payment) {
      let method = payment.paymentMethod;
      if (method === 'cash') method = 'Cash';
      else if (method === 'upi') method = 'UPI';
      else if (method === 'cheque') method = 'Cheque';

      message += `Payment Received: ₹${payment.amount} (${method})\n`;
    }

    message += `\nItems:\n`;
    
    order.items.forEach((item, i) => {
      message += `${i + 1}. ${item.productName}`;
      if (item.selectedSize) message += ` (${item.selectedSize})`;
      message += ` ×${item.quantity} = ₹${item.total}\n`;
    });
    
    message += `\n💰 Total: ₹${order.totalAmount}`;

    console.log('📱 Sending WhatsApp...');
    await client.messages.create({ from: fromNumber, to: toNumber, body: message });
    console.log('✅ WhatsApp sent!');
  } catch (error) {
    console.error('❌ WhatsApp error:', error.message);
  }
};
const createOrder = async (req, res) => {
  try {
    const { partyId, items } = req.body;
    const party = await Party.findById(partyId);
    if (!party) return res.status(404).json({ message: 'Party not found' });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });

      orderItems.push({
        product: item.productId,
        productName: item.productName,
        selectedSize: item.selectedSize || null,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      });
      totalAmount += item.total;
    }

    const order = new Order({
      orderNumber: await generateOrderNumber(),
      party: partyId,
      items: orderItems,
      totalAmount,
      salesman: req.userId,
      status: 'pending'
    });

    await order.save();
    await order.populate('salesman', 'name');
    await sendWhatsAppNotification(order, party, order.salesman);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createOrderWithPayment = async (req, res) => {
  try {
    const { partyId, items, payment } = req.body;
    const party = await Party.findById(partyId);
    if (!party) return res.status(404).json({ message: 'Party not found' });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });

      orderItems.push({
        product: item.productId,
        productName: item.productName,
        selectedSize: item.selectedSize || null,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      });
      totalAmount += item.total;
    }

    const order = new Order({
      orderNumber: await generateOrderNumber(),
      party: partyId,
      items: orderItems,
      totalAmount,
      salesman: req.userId,
      status: 'pending'
    });

    await order.save();
    await order.populate('salesman', 'name');
    await sendWhatsAppNotification(order, party, order.salesman, payment);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { startDate, endDate, partyId, productId, status, salesman } = req.query;
    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (partyId) query.party = partyId;
    if (status) query.status = status;
    if (salesman) query.salesman = salesman;
    if (productId) query['items.product'] = productId;

    const orders = await Order.find(query)
      .populate('party', 'name phone address')
      .populate('salesman', 'name email')
      .populate('cancelledBy', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('party', 'name phone address gst email')
      .populate('salesman', 'name email phone')
      .populate('cancelledBy', 'name')
      .populate('items.product', 'name unit category');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const salesData = await Order.aggregate([{ $group: { _id: null, totalSales: { $sum: '$totalAmount' } } }]);
    const salesmanStats = await Order.aggregate([
      { $group: { _id: '$salesman', totalOrders: { $sum: 1 }, totalSales: { $sum: '$totalAmount' } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'salesmanInfo' } },
      { $unwind: '$salesmanInfo' },
      { $project: { salesmanName: '$salesmanInfo.name', totalOrders: 1, totalSales: 1 } },
      { $sort: { totalSales: -1 } }
    ]);
    res.json({ totalOrders, totalSales: salesData[0]?.totalSales || 0, salesmanStats });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getChartStats = async (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    let groupBy = period === 'monthly' 
      ? { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }
      : { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    const chartData = await Order.aggregate([
      { $group: { _id: groupBy, sales: { $sum: '$totalAmount' }, orders: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: period === 'monthly' ? 12 : 30 }
    ]);
    const formattedData = chartData.map(item => ({
      date: period === 'monthly'
        ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
        : `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      sales: item.sales,
      orders: item.orders
    }));
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate('party', 'name phone')
      .populate('salesman', 'name')
      .populate('cancelledBy', 'name');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;
    if (!cancellationReason || cancellationReason.trim() === '') {
      return res.status(400).json({ message: 'Cancellation reason is required' });
    }
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'Order already cancelled' });
    }
    order.status = 'cancelled';
    order.cancellationReason = cancellationReason;
    order.cancelledBy = req.userId;
    order.cancelledAt = new Date();
    await order.save();
    await order.populate('cancelledBy', 'name');
    await order.populate('party', 'name phone');
    await order.populate('salesman', 'name');
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createOrder,
  createOrderWithPayment,
  getAllOrders,
  getOrderById,
  getDashboardStats,
  getChartStats,
  updateOrderStatus,
  deleteOrder,
  cancelOrder
};