import { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import { orderAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';

const SalesmanOrders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const filters = statusFilter ? { status: statusFilter } : {};
      const response = await orderAPI.getAll(filters);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} className="text-green-500" />;
      case 'pending': return <Clock size={20} className="text-yellow-500" />;
      case 'cancelled': return <XCircle size={20} className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative">
            <h1 className="text-4xl font-display font-black mb-2">My Orders</h1>
            <p className="text-green-100 text-lg">View your order history and status</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="card">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                statusFilter === ''
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                statusFilter === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock size={18} />
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                statusFilter === 'completed'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle size={18} />
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                statusFilter === 'cancelled'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <XCircle size={18} />
              Cancelled
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="card bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Order Number</p>
                  <p className="text-xl font-mono font-bold text-purple-600">{order.orderNumber}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 uppercase flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </div>
              </div>

              {/* Cancellation Notice */}
              {order.status === 'cancelled' && order.cancellationReason && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-xs font-bold text-red-700 mb-1">CANCELLED</p>
                  <p className="text-xs text-red-600 line-clamp-2">{order.cancellationReason}</p>
                </div>
              )}

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Party</p>
                  <p className="font-bold text-gray-900">{order.party?.name}</p>
                  <p className="text-sm text-gray-600">{order.party?.phone}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Date</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar size={16} />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Items</p>
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={16} className="text-gray-600" />
                    <span className="font-semibold text-gray-900">{order.items?.length || 0} items</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{order.totalAmount?.toLocaleString()}</p>
                </div>
              </div>

              <button className="w-full btn btn-primary flex items-center justify-center gap-2">
                <Eye size={18} />
                View Details
              </button>
            </div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="card text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <ShoppingCart size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                Order {selectedOrder.orderNumber}
                <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </h2>
              <p className="text-purple-100 mt-1">
                {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Cancellation Details */}
              {selectedOrder.status === 'cancelled' && selectedOrder.cancellationReason && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="text-red-600" size={20} />
                    <h3 className="text-sm font-bold text-red-700">ORDER CANCELLED</h3>
                  </div>
                  <p className="text-sm text-red-600 mb-3">{selectedOrder.cancellationReason}</p>
                  <div className="text-xs text-red-500 space-y-1">
                    <p>Cancelled by: {selectedOrder.cancelledBy?.name || 'Admin'}</p>
                    <p>Date: {new Date(selectedOrder.cancelledAt).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Party Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 mb-2">PARTY DETAILS</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-bold text-gray-900">{selectedOrder.party?.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.party?.phone}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 mb-2">ORDER ITEMS</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">{item.productName}</p>
                        {item.selectedSize && (
                          <p className="text-sm text-purple-600 font-semibold">Size: {item.selectedSize}</p>
                        )}
                        <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                      </div>
                      <p className="text-lg font-bold text-purple-600">₹{item.total.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">TOTAL AMOUNT</span>
                  <span className="text-2xl font-bold text-purple-600">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full btn btn-secondary py-3"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SalesmanOrders;