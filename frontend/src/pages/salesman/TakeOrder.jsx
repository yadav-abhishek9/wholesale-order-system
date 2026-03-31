import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { productAPI, partyPriceAPI, orderAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { showAlert } from '../../components/Alert';

const SalesmanTakeOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ FIX: Receive payment amount from SalesmanParties
  const { party, receivedAmount = 0 } = location.state || {};

  const [products, setProducts] = useState([]);
  const [partyPrices, setPartyPrices] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});
  
  // Track quantities for each product BEFORE adding to cart
  const [productQuantities, setProductQuantities] = useState({});

  useEffect(() => {
    if (!party) {
      navigate('/salesman/parties');
      return;
    }
    fetchProducts();
    fetchPartyPrices();
  }, [party]);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll();
      console.log('📦 Products fetched:', response.data.length);
      setProducts(response.data);
      
      const initialQuantities = {};
      response.data.forEach(product => {
        initialQuantities[product._id] = 1;
      });
      setProductQuantities(initialQuantities);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPartyPrices = async () => {
    try {
      console.log('💰 Fetching party prices for:', party._id);
      const response = await partyPriceAPI.getPartyPrices(party._id);
      console.log('✅ Party prices received:', response.data);
      
      const pricesMap = {};
      response.data.forEach(pp => {
        if (pp.product) {
          if (pp.product.hasSizes && pp.sizePrices && pp.sizePrices.length > 0) {
            const sizePricesMap = {};
            pp.sizePrices.forEach(sp => {
              sizePricesMap[sp.sizeName] = sp.customPrice;
            });
            pricesMap[pp.product._id] = { sizePrices: sizePricesMap };
          } else {
            pricesMap[pp.product._id] = { customPrice: pp.customPrice };
          }
        }
      });
      
      setPartyPrices(pricesMap);
    } catch (error) {
      console.error('Error fetching party prices:', error);
    }
  };

  const getProductPrice = (product, selectedSize = null) => {
    const partyPrice = partyPrices[product._id];
    
    if (product.hasSizes && selectedSize) {
      if (partyPrice?.sizePrices && partyPrice.sizePrices[selectedSize]) {
        return partyPrice.sizePrices[selectedSize];
      }
      const size = product.sizes.find(s => s.sizeName === selectedSize);
      if (size) {
        return size.sizePrice;
      }
      return product.basePrice;
    }
    
    if (partyPrice?.customPrice !== undefined && partyPrice?.customPrice !== null) {
      return partyPrice.customPrice;
    }
    
    return product.basePrice;
  };

  const handleSizeChange = (productId, size) => {
    setSelectedSizes({
      ...selectedSizes,
      [productId]: size
    });
  };

  const updateProductQuantity = (productId, change) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
  };

  const setProductQuantity = (productId, value) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, parseInt(value) || 1)
    }));
  };

  const addToCart = (product) => {
    if (product.hasSizes && !selectedSizes[product._id]) {
      showAlert('warning', 'Please select a size');
      return;
    }

    const selectedSize = product.hasSizes ? selectedSizes[product._id] : null;
    const price = getProductPrice(product, selectedSize);
    const quantity = productQuantities[product._id] || 1;
    
    const existingItem = cart.find(item => 
      item.productId === product._id && item.selectedSize === selectedSize
    );
    
    if (existingItem) {
      updateCartQuantity(product._id, selectedSize, existingItem.quantity + quantity);
    } else {
      setCart([...cart, {
        productId: product._id,
        productName: product.name,
        selectedSize: selectedSize,
        quantity: quantity,
        price,
        total: price * quantity
      }]);
    }
    
    setProductQuantities(prev => ({
      ...prev,
      [product._id]: 1
    }));
  };

  const updateCartQuantity = (productId, selectedSize, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCart(cart.map(item => 
      item.productId === productId && item.selectedSize === selectedSize
        ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId, selectedSize) => {
    setCart(cart.filter(item => 
      !(item.productId === productId && item.selectedSize === selectedSize)
    ));
  };

  // ✅ FIXED: Use receivedAmount from SalesmanParties
  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      showAlert('warning', 'Please add items to cart');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        partyId: party._id,
        items: cart
      };

      // ✅ If receivedAmount > 0, include payment
      if (receivedAmount > 0) {
        orderData.payment = {
          amount: receivedAmount,
          paymentMethod: 'cash', // Default from payment entry
          notes: 'Payment received with order'
        };
      }

      console.log('📤 Submitting order:', orderData);

      // Use correct endpoint
      if (receivedAmount > 0) {
        await orderAPI.createWithPayment(orderData);
      } else {
        await orderAPI.create(orderData);
      }

      showAlert('success', 'Order placed successfully!');
      navigate('/salesman/parties');
    } catch (error) {
      console.error('Error creating order:', error);
      showAlert('error', error.response?.data?.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (!party) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative">
            <button
              onClick={() => navigate('/salesman/parties')}
              className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Parties</span>
            </button>
            <h1 className="text-4xl font-display font-black mb-2">{party.name}</h1>
            <p className="text-purple-100 text-lg">{party.phone}</p>
            
            {/* ✅ Show payment info if received */}
            {receivedAmount > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 bg-green-500/20 text-white px-4 py-2 rounded-full border-2 border-green-300">
                <span className="text-lg">💰</span>
                <span className="font-bold">Payment Received: ₹{receivedAmount}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products List - SAME AS BEFORE */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">Select Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => {
                  const selectedSize = selectedSizes[product._id];
                  const displayPrice = selectedSize 
                    ? getProductPrice(product, selectedSize)
                    : (product.hasSizes ? null : getProductPrice(product));
                    
                  const cartItem = cart.find(item => 
                    item.productId === product._id && 
                    item.selectedSize === selectedSize
                  );

                  const currentQuantity = productQuantities[product._id] || 1;
                  
                  return (
                    <div
                      key={product._id}
                      className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-4 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                    >
                      {product.image ? (
                        <div className="w-full h-38 mb-3 rounded-xl overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 mb-3 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                          <ImageIcon size={32} className="text-gray-400" />
                        </div>
                      )}

                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                              {product.category}
                            </span>
                            {product.subCategory && (
                              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-semibold">
                                {product.subCategory}
                              </span>
                            )}
                          </div>
                        </div>

                        {product.hasSizes && product.sizes?.length > 0 ? (
                          <div>
                            <label className="text-xs font-bold text-gray-700 mb-1 block">SELECT SIZE:</label>
                            <select
                              value={selectedSize || ''}
                              onChange={(e) => handleSizeChange(product._id, e.target.value)}
                              className="w-full p-2 border-2 border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            >
                              <option value="">Choose size...</option>
                              {product.sizes.map(size => {
                                const sizePrice = getProductPrice(product, size.sizeName);
                                return (
                                  <option key={size.sizeName} value={size.sizeName}>
                                    {size.sizeName} - ₹{sizePrice}
                                  </option>
                                );
                              })}
                            </select>
                            {selectedSize && (
                              <p className="text-right mt-2">
                                <span className="text-2xl font-bold text-purple-600">
                                  ₹{displayPrice}
                                </span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-right">
                            <p className="text-2xl font-bold text-purple-600">
                              ₹{displayPrice}
                            </p>
                            <p className="text-sm text-gray-600">per {product.unit}</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-700">QUANTITY:</span>
                            {displayPrice && (
                              <span className="text-xs text-purple-600 font-semibold">
                                Total: ₹{(displayPrice * currentQuantity).toLocaleString()}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateProductQuantity(product._id, -1)}
                              disabled={currentQuantity <= 1}
                              className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold text-xl transition-all shadow-md ${
                                currentQuantity <= 1
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-gradient-to-br from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-95'
                              }`}
                            >
                              −
                            </button>
                            
                            <div className="flex-1 flex flex-col items-center">
                              <input
                                type="number"
                                value={currentQuantity}
                                onChange={(e) => setProductQuantity(product._id, e.target.value)}
                                min="1"
                                className="w-full text-center text-2xl font-black bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                              />
                              <span className="text-xs text-gray-500 mt-1">items</span>
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => updateProductQuantity(product._id, 1)}
                              className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 active:scale-95 transition-all shadow-md font-bold text-xl"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {cartItem ? (
                          <div className="bg-green-50 border-2 border-green-500 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-green-700">✓ In Cart</span>
                              <span className="text-sm font-bold text-green-700">{cartItem.quantity} items</span>
                            </div>
                            <button
                              onClick={() => addToCart(product)}
                              disabled={product.hasSizes && !selectedSize}
                              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                              <Plus size={18} />
                              Add More
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.hasSizes && !selectedSize}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 rounded-xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                          >
                            <Plus size={20} />
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Cart Summary - SIMPLIFIED */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6 bg-gradient-to-br from-purple-50 via-white to-pink-50 border-2 border-purple-200 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                    <ShoppingCart size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900">Cart</h2>
                    {cart.length > 0 && (
                      <p className="text-sm text-purple-600 font-semibold">
                        {getTotalItems()} items
                      </p>
                    )}
                  </div>
                </div>
                {cart.length > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-2xl font-black text-purple-600">
                      ₹{getTotalAmount().toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
                    <ShoppingCart size={32} className="text-purple-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No items in cart</p>
                  <p className="text-sm text-gray-400 mt-1">Adjust quantity and add products!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto pr-2">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.productId}-${item.selectedSize || 'default'}-${index}`}
                        className="bg-white border-2 border-purple-100 rounded-xl p-4 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 mb-1">{item.productName}</h4>
                            {item.selectedSize && (
                              <p className="text-sm text-purple-600 font-semibold mb-1">
                                📏 {item.selectedSize}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="font-semibold">₹{item.price}</span>
                              <span>×</span>
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-bold">
                                {item.quantity}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId, item.selectedSize)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors active:scale-90"
                            title="Remove from cart"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-600">Subtotal:</span>
                            <span className="text-lg font-black text-purple-600">
                              ₹{item.total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Summary */}
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-semibold">Total Items:</span>
                      <span className="text-gray-900 font-bold">{getTotalItems()}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t-2 border-purple-200">
                      <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                      <span className="text-2xl font-black text-purple-600">
                        ₹{getTotalAmount().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* ✅ Show payment info if received */}
                  {receivedAmount > 0 && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border-2 border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">💰 Payment Received:</span>
                        <span className="text-xl font-black text-green-600">₹{receivedAmount}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-200">
                        <span className="text-sm font-semibold text-gray-600">Balance Due:</span>
                        <span className="text-lg font-bold text-red-600">
                          ₹{Math.max(0, getTotalAmount() - receivedAmount)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Place Order Button */}
                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Place Order
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SalesmanTakeOrder;