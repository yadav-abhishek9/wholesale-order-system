import { useState, useEffect } from 'react';
import { Search, ArrowRight, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { partyAPI } from '../../services/api';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import { showAlert } from '../../components/Alert';


const SalesmanParties = () => {
  const [parties, setParties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParty, setSelectedParty] = useState(null);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchParties();
  }, [searchTerm]);

  const fetchParties = async () => {
    try {
      const response = await partyAPI.getAll(searchTerm);
      setParties(response.data);
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  };

  const handleSelectParty = (party) => {
    setSelectedParty(party);
    setShowPaymentModal(true);
    setReceivedAmount('');
    setPaymentMethod('cash');
    setNotes('');
  };

  const handleRecordPayment = async () => {
    if (!receivedAmount || parseFloat(receivedAmount) <= 0) {
      showAlert('warning', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/payments/record', {
        partyId: selectedParty._id,
        amount: parseFloat(receivedAmount),
        paymentMethod,
        notes
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      showAlert('info', 'Payment recorded successfully!');
      // Navigate to take order with payment info
      navigate('/salesman/take-order', { 
        state: { 
          party: selectedParty,
          receivedAmount: parseFloat(receivedAmount)
        } 
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      showAlert('error', error.response?.data?.message || 'Error recording payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipPayment = () => {
    navigate('/salesman/take-order', { 
      state: { 
        party: selectedParty,
        receivedAmount: 0
      } 
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative">
            <h1 className="text-4xl font-display font-black mb-2">Find Party</h1>
            <p className="text-blue-100 text-lg">Search and record payments or take orders</p>
          </div>
        </div>

        <div className="card bg-white/80 backdrop-blur-xl border-2 border-white shadow-2xl">
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">Search Party</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
              <input
                type="text"
                placeholder="Search by party name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 text-lg bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parties.map((party) => (
              <div
                key={party._id}
                onClick={() => handleSelectParty(party)}
                className="group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 rounded-full -mr-12 -mt-12 transition-opacity duration-300"></div>
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-display font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                        {party.name}
                      </h3>
                      <p className="text-sm text-gray-600 font-semibold">{party.phone}</p>
                    </div>
                    <ArrowRight 
                      size={24} 
                      className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" 
                    />
                  </div>
                  
                  {party.address && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{party.address}</p>
                  )}
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <DollarSign size={16} className="text-green-500" />
                    <span className="text-xs font-semibold text-gray-500">Click to record payment</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {parties.length === 0 && searchTerm && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Search size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No parties found matching "{searchTerm}"</p>
            </div>
          )}

          {parties.length === 0 && !searchTerm && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
                <Search size={32} className="text-purple-600" />
              </div>
              <p className="text-gray-500 text-lg">Start typing to search for parties</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedParty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl">
              <h2 className="text-2xl font-display font-bold text-white">
                {selectedParty.name}
              </h2>
              <p className="text-purple-100 mt-1">{selectedParty.phone}</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">💡 Payment Entry</p>
                <p className="text-xs text-gray-600">
                  Enter the amount received from this party. You can skip if no payment was collected.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Amount Received <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-2xl font-bold bg-gray-50 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                >
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                  rows="3"
                  placeholder="Add any remarks..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleRecordPayment}
                  disabled={loading || !receivedAmount}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <DollarSign size={20} />
                  {loading ? 'Recording...' : 'Record & Take Order'}
                </button>
              </div>

              <button
                onClick={handleSkipPayment}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                Skip Payment - Just Take Order
              </button>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full text-gray-500 py-3 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default SalesmanParties;