import { useState, useEffect } from 'react';
import { Save, Copy, X, DollarSign, Package } from 'lucide-react';
import { partyAPI, productAPI, partyPriceAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { showAlert } from '../../components/Alert';


const AdminPartyPricing = () => {
  const [parties, setParties] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyToParty, setCopyToParty] = useState('');

  useEffect(() => {
    fetchParties();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedParty) {
      fetchPartyPrices();
    }
  }, [selectedParty]);

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
      console.log('🔍 Fetching products...');
      const response = await productAPI.getAll();
      console.log('✅ Products received:', response.data);
      setProducts(response.data);
    } catch (error) {
      console.error('❌ Error fetching products:', error);
    }
  };

  const fetchPartyPrices = async () => {
    try {
      console.log('💰 Fetching party prices for:', selectedParty._id);
      const response = await partyPriceAPI.getPartyPrices(selectedParty._id);
      console.log('✅ Party prices received:', response.data);
      
      const pricesMap = {};
      response.data.forEach(pp => {
        if (pp.product) {
          if (pp.product.hasSizes && pp.sizePrices && pp.sizePrices.length > 0) {
            // Size-wise pricing
            const sizePricesMap = {};
            pp.sizePrices.forEach(sp => {
              sizePricesMap[sp.sizeName] = sp.customPrice;
            });
            pricesMap[pp.product._id] = { sizePrices: sizePricesMap };
          } else {
            // Single price
            pricesMap[pp.product._id] = { customPrice: pp.customPrice };
          }
        }
      });
      
      setPrices(pricesMap);
    } catch (error) {
      console.error('❌ Error fetching party prices:', error);
    }
  };

  const handlePriceChange = (productId, value, sizeName = null) => {
    setPrices(prev => {
      const productPrices = prev[productId] || {};
      
      if (sizeName) {
        // Update size-specific price
        return {
          ...prev,
          [productId]: {
            ...productPrices,
            sizePrices: {
              ...(productPrices.sizePrices || {}),
              [sizeName]: parseFloat(value) || 0
            }
          }
        };
      } else {
        // Update regular price
        return {
          ...prev,
          [productId]: {
            ...productPrices,
            customPrice: parseFloat(value) || 0
          }
        };
      }
    });
  };

  const handleSavePrices = async () => {
    if (!selectedParty) {
      showAlert('warning', 'Please select a party');
      return;
    }

    setLoading(true);
    try {
      const pricesArray = Object.entries(prices).map(([productId, priceData]) => {
        const product = products.find(p => p._id === productId);
        
        if (product && product.hasSizes && priceData.sizePrices) {
          // Convert size prices map to array
          const sizePrices = Object.entries(priceData.sizePrices).map(([sizeName, customPrice]) => ({
            sizeName,
            customPrice
          }));
          
          return {
            productId,
            customPrice: null,
            sizePrices
          };
        } else {
          return {
            productId,
            customPrice: priceData.customPrice || 0,
            sizePrices: []
          };
        }
      });

      console.log('💾 Saving prices:', pricesArray);

      await partyPriceAPI.setPartyPrices({
        partyId: selectedParty._id,
        prices: pricesArray
      });

      showAlert('success', 'Prices saved successfully!');
      fetchPartyPrices();
    } catch (error) {
      console.error('❌ Error saving prices:', error);
      showAlert('error', 'Error saving prices');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrices = async () => {
    if (!selectedParty || !copyToParty) {
      showAlert('warning', 'Please select both parties');
      return;
    }

    setLoading(true);
    try {
      await partyPriceAPI.copyPrices({
        fromPartyId: selectedParty._id,
        toPartyId: copyToParty
      });

      showAlert('success', 'Prices copied successfully!');
      setCopyModalOpen(false);
      setCopyToParty('');
    } catch (error) {
      console.error('Error copying prices:', error);
      showAlert('error', 'Error copying prices');
    } finally {
      setLoading(false);
    }
  };

  const getPrice = (product) => {
    const priceData = prices[product._id];
    if (!priceData) return null;
    
    if (product.hasSizes) {
      return priceData.sizePrices || {};
    } else {
      return priceData.customPrice;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative">
            <h1 className="text-4xl font-display font-black mb-2">Party Pricing</h1>
            <p className="text-blue-100 text-lg">Set custom prices for each party</p>
          </div>
        </div>

        {/* Party Selection & Actions */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Party</label>
              <select
                value={selectedParty?._id || ''}
                onChange={(e) => {
                  const party = parties.find(p => p._id === e.target.value);
                  setSelectedParty(party);
                }}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Choose a party...</option>
                {parties.map(party => (
                  <option key={party._id} value={party._id}>
                    {party.name} - {party.phone}
                  </option>
                ))}
              </select>
            </div>

            {selectedParty && (
              <div className="flex items-end gap-3">
                <button
                  onClick={handleSavePrices}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save size={20} />
                  {loading ? 'Saving...' : 'Save Prices'}
                </button>
                <button
                  onClick={() => setCopyModalOpen(true)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Copy size={20} />
                  Copy Prices
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products List */}
        {selectedParty && (
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl">
                <Package size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-gray-900">
                  Pricing for {selectedParty.name}
                </h2>
                <p className="text-sm text-gray-600">Set custom prices for each product</p>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found. Please add products first.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => {
                  const currentPrice = getPrice(product);
                  
                  return (
                    <div
                      key={product._id}
                      className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-gray-200">
                            <Package size={32} className="text-gray-400" />
                          </div>
                        )}

                        {/* Product Info & Pricing */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                                  {product.category}
                                </span>
                                {product.subCategory && (
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                                    {product.subCategory}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 uppercase font-semibold">Base Price</p>
                              <p className="text-2xl font-bold text-gray-900">₹{product.basePrice}</p>
                              <p className="text-xs text-gray-500">per {product.unit}</p>
                            </div>
                          </div>

                          {/* Pricing Input */}
                          {product.hasSizes && product.sizes?.length > 0 ? (
                            <div>
                              <p className="text-sm font-bold text-gray-700 mb-3">CUSTOM PRICES BY SIZE:</p>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {product.sizes.map((size, idx) => (
                                  <div key={idx} className="bg-white border-2 border-gray-200 rounded-xl p-3">
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                                      {size.sizeName}
                                    </label>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                                        ₹
                                      </span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={currentPrice?.[size.sizeName] || size.sizePrice || ''}
                                        onChange={(e) => handlePriceChange(product._id, e.target.value, size.sizeName)}
                                        placeholder={size.sizePrice.toString()}
                                        className="w-full pl-7 pr-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                      />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Base: ₹{size.sizePrice}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                CUSTOM PRICE:
                              </label>
                              <div className="relative max-w-xs">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-lg">
                                  ₹
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={currentPrice || ''}
                                  onChange={(e) => handlePriceChange(product._id, e.target.value)}
                                  placeholder={product.basePrice.toString()}
                                  className="w-full pl-10 pr-4 py-3 text-xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Copy Prices Modal */}
      {copyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Copy Prices</h3>
                <button
                  onClick={() => setCopyModalOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Copy prices from <strong>{selectedParty?.name}</strong> to:
              </p>
              
              <select
                value={copyToParty}
                onChange={(e) => setCopyToParty(e.target.value)}
                className="w-full px-4 py-3 mb-6 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">Select party...</option>
                {parties
                  .filter(p => p._id !== selectedParty?._id)
                  .map(party => (
                    <option key={party._id} value={party._id}>
                      {party.name}
                    </option>
                  ))}
              </select>

              <div className="flex gap-3">
                <button
                  onClick={handleCopyPrices}
                  disabled={!copyToParty || loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Copying...' : 'Copy Prices'}
                </button>
                <button
                  onClick={() => setCopyModalOpen(false)}
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

export default AdminPartyPricing;