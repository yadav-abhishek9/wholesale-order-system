import { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Calendar, Filter, Eye } from 'lucide-react';
import axios from 'axios';
import { partyAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [partyWisePayments, setPartyWisePayments] = useState([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [partyPayments, setPartyPayments] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    partyId: ''
  });

  useEffect(() => {
    fetchPaymentStats();
    fetchAllPayments();
    fetchParties();
  }, []);

  const fetchPaymentStats = async () => {
    try {
      const response = await axios.get('/api/payments/stats/summary', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTotalPayments(response.data.totalPayments);
      setPartyWisePayments(response.data.partyWisePayments);
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const fetchAllPayments = async () => {
    try {
      const response = await axios.get('/api/payments', {
        params: filters,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
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

  const viewPartyPayments = async (partyId, partyName) => {
    try {
      const response = await axios.get(`/api/payments/party/${partyId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedParty({ id: partyId, name: partyName, ...response.data });
      setPartyPayments(response.data.payments);
    } catch (error) {
      console.error('Error fetching party payments:', error);
    }
  };

  const applyFilters = () => {
    fetchAllPayments();
  };

  const resetFilters = () => {
    setFilters({ startDate: '', endDate: '', partyId: '' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative">
            <h1 className="text-4xl font-display font-black mb-2">Payment Tracking</h1>
            <p className="text-green-100 text-lg">Monitor all payments received party-wise</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-card bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <DollarSign size={32} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-green-100 mb-1">Total Payments</h3>
            <p className="text-4xl font-display font-black">₹{totalPayments.toLocaleString()}</p>
          </div>

          <div className="stat-card bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <Users size={32} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-purple-100 mb-1">Active Parties</h3>
            <p className="text-4xl font-display font-black">{partyWisePayments.length}</p>
          </div>

          <div className="stat-card bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <TrendingUp size={32} />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-blue-100 mb-1">Total Transactions</h3>
            <p className="text-4xl font-display font-black">{payments.length}</p>
          </div>
        </div>

        {/* Party-wise Summary */}
        <div className="card">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Users className="text-purple-600" size={28} />
            Party-wise Payment Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Party Name</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Phone</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Payments</th>
                  <th className="text-left py-4 px-4 text-sm font-bold text-gray-700">Total Received</th>
                  <th className="text-right py-4 px-4 text-sm font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partyWisePayments.map((item, index) => (
                  <tr key={item._id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {item.partyName.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900">{item.partyName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{item.partyPhone}</td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {item.paymentCount} payments
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-xl font-bold text-green-600">
                        ₹{item.totalReceived.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-end">
                        <button
                          onClick={() => viewPartyPayments(item._id, item.partyName)}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        >
                          <Eye size={18} />
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filter Payments</h3>
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

            <div className="flex items-end gap-2">
              <button onClick={applyFilters} className="btn btn-primary flex-1">
                Apply
              </button>
              <button onClick={resetFilters} className="btn btn-secondary flex-1">
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* All Payments */}
        <div className="card">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">All Payments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Party</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Received By</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{payment.party?.name}</div>
                      <div className="text-xs text-gray-500">{payment.party?.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-lg font-bold text-green-600">
                      ₹{payment.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold uppercase">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{payment.receivedBy?.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{payment.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Party Payment Details Modal */}
      {selectedParty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl">
              <h2 className="text-2xl font-display font-bold text-white">
                {selectedParty.name} - Payment History
              </h2>
              <p className="text-purple-100 mt-1">
                Total Received: ₹{selectedParty.totalReceived?.toLocaleString()}
              </p>
            </div>
            
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Method</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Received By</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {partyPayments.map((payment) => (
                    <tr key={payment._id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-lg font-bold text-green-600">
                        ₹{payment.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold uppercase">
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{payment.receivedBy?.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{payment.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button
                onClick={() => setSelectedParty(null)}
                className="w-full mt-6 btn btn-secondary py-3"
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

export default AdminPayments;