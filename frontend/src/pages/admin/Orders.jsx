import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, Clock, Trash2, XCircle, Ban } from 'lucide-react';
import { orderAPI, partyAPI, productAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import axios from 'axios';
import { showAlert } from '../../components/Alert';


const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [parties, setParties] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    partyId: '',
    productId: '',
    status: '',
    salesman: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchOrders();
    fetchParties();
    fetchProducts();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll(filters);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchParties = async () => {
    try {
      const response = await partyAPI.getAll();
      setParties(response.data);
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus }
          : order
      ));
      
      showAlert('success', 'Order status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      showAlert('error', 'Error updating order status');
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm('⚠️ Are you sure you want to PERMANENTLY DELETE this order?\n\nThis action CANNOT be undone!')) {
      try {
        await axios.delete(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        showAlert('success', 'Order deleted successfully!');
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        showAlert('error', 'Error deleting order');
      }
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      showAlert('warning', 'Please enter a cancellation reason');
      return;
    }
    
    try {
      await axios.put(`/api/orders/${cancelModal}/cancel`, 
        { cancellationReason: cancelReason },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      showAlert('success', 'Order cancelled successfully!');
      setCancelModal(null);
      setCancelReason('');
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      showAlert('error', error.response?.data?.message || 'Error cancelling order');
    }
  };

  const applyFilters = () => {
    fetchOrders();
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      partyId: '',
      productId: '',
      status: '',
      salesman: ''
    });
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
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative">
            <h1 className="text-4xl font-display font-black mb-2">Orders</h1>
            <p className="text-purple-100 text-lg">Manage and track all orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Orders</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Party</label>
              <select
                value={filters.partyId}
                onChange={(e) => setFilters({ ...filters, partyId: e.target.value })}
                className="input"
              >
                <option value="">All Parties</option>
                {parties.map(party => (
                  <option key={party._id} value={party._id}>{party.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={applyFilters} className="btn btn-primary">
              Apply Filters
            </button>
            <button onClick={resetFilters} className="btn btn-secondary">
              Reset
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Order #</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Date</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Party</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Salesman</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Items</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Amount</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Status</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-purple-600">{order.orderNumber}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">{order.party?.name}</div>
                      <div className="text-xs text-gray-500">{order.party?.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">
                      {order.salesman?.name || '-'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-700">
                      {order.items?.length || 0} items
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-lg font-bold text-green-600">
                        ₹{order.totalAmount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 uppercase cursor-pointer transition-all ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                        {order.status !== 'cancelled' && (
                          <button
                            onClick={() => setCancelModal(order._id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Cancel Order"
                          >
                            <Ban size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(order._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No orders found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl">
              <h2 className="text-2xl font-display font-bold text-white">
                Order Details - {selectedOrder.orderNumber}
              </h2>
              <p className="text-purple-100 mt-1">
                {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Cancellation Notice */}
              {selectedOrder.status === 'cancelled' && selectedOrder.cancellationReason && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="text-red-600" size={20} />
                    <h3 className="text-sm font-bold text-red-700">ORDER CANCELLED</h3>
                  </div>
                  <p className="text-sm text-red-600 mb-2">{selectedOrder.cancellationReason}</p>
                  <p className="text-xs text-red-500">
                    Cancelled by: {selectedOrder.cancelledBy?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-red-500">
                    Date: {new Date(selectedOrder.cancelledAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Party Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 mb-2">PARTY DETAILS</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-bold text-gray-900">{selectedOrder.party?.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.party?.phone}</p>
                  {selectedOrder.party?.address && (
                    <p className="text-sm text-gray-600 mt-1">{selectedOrder.party?.address}</p>
                  )}
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
                          <p className="text-sm text-purple-600">Size: {item.selectedSize}</p>
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

              {/* Status */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 mb-2">ORDER STATUS</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold uppercase ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Salesman */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 mb-2">SALESMAN</h3>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-900">{selectedOrder.salesman?.name || 'N/A'}</p>
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

      {/* Cancel Order Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-t-3xl">
              <h3 className="text-2xl font-bold text-white">Cancel Order</h3>
              <p className="text-orange-100 mt-1">Please provide a reason for cancellation</p>
            </div>
            
            <div className="p-6">
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
                rows="4"
                placeholder="Enter reason for cancellation..."
                autoFocus
              />
              
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={handleCancelOrder} 
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Confirm Cancellation
                </button>
                <button 
                  onClick={() => { setCancelModal(null); setCancelReason(''); }} 
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminOrders;