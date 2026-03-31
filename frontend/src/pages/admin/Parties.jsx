import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { partyAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { showAlert } from '../../components/Alert';


const Parties = () => {
  const [parties, setParties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    gst: '',
    email: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await partyAPI.getAll();
      setParties(response.data);
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingParty) {
        await partyAPI.update(editingParty._id, formData);
      } else {
        await partyAPI.create(formData);
      }
      fetchParties();
      closeModal();
    } catch (error) {
      console.error('Error saving party:', error);
      showAlert('error', error.response?.data?.message || 'Error saving party');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this party?')) {
      try {
        await partyAPI.delete(id);
        fetchParties();
      } catch (error) {
        console.error('Error deleting party:', error);
      }
    }
  };

  const openModal = (party = null) => {
    if (party) {
      setEditingParty(party);
      setFormData({
        name: party.name,
        phone: party.phone,
        address: party.address || '',
        gst: party.gst || '',
        email: party.email || ''
      });
    } else {
      setEditingParty(null);
      setFormData({
        name: '',
        phone: '',
        address: '',
        gst: '',
        email: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingParty(null);
  };

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    party.phone.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900">Parties</h1>
            <p className="text-gray-600 mt-1">Manage your customer parties</p>
          </div>
          <button onClick={() => openModal()} className="btn btn-primary">
            <Plus size={20} className="mr-2" />
            Add Party
          </button>
        </div>

        <div className="card">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search parties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">GST</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParties.map((party) => (
                  <tr key={party._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{party.name}</div>
                        {party.address && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{party.address}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{party.phone}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{party.email || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{party.gst || '-'}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(party)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(party._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-display font-bold text-gray-900">
                {editingParty ? 'Edit Party' : 'Add New Party'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Party Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                <input
                  type="text"
                  value={formData.gst}
                  onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                  className="input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingParty ? 'Update Party' : 'Create Party'}
                </button>
                <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Parties;
