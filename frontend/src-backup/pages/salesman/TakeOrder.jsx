import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { productAPI, partyPriceAPI, orderAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';

const SalesmanTakeOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { party } = location.state || {};

  const [products, setProducts] = useState([]);
  const [partyPrices, setPartyPrices] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});

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
            // Size-wise pricing
            const sizePricesMap = {};
            pp.sizePrices.forEach(sp => {
              sizePricesMap[sp.sizeName] = sp.customPrice;
            });
            pricesMap[pp.product._id] = { sizePrices: sizePricesMap };
            console.log(`📏 Size prices for ${pp.product.name}:`, sizePricesMap);
          } else {
            // Single price
            pricesMap[pp.product._id] = { customPrice: pp.customPrice };
            console.log(`💵 Custom price for ${pp.product.name}:`, pp.customPrice);
          }
        }
      });
      
      setPartyPrices(pricesMap);
      console.log('💰 Final party prices map:', pricesMap);
    } catch (error) {
      console.error('Error fetching party prices:', error);
    }
  };

  const getProductPrice = (product, selectedSize = null) => {
    const partyPrice = partyPrices[product._id];
    
    console.log(`🔍 Getting price for ${product.name}`, {
      hasSizes: product.hasSizes,
      selectedSize,
      partyPrice
    });
    
    if (product.hasSizes && selectedSize) {
      // Check party-specific size price first
      if (partyPrice?.sizePrices && partyPrice.sizePrices[selectedSize]) {
        console.log(`✅ Using party size price: ₹${partyPrice.sizePrices[selectedSize]}`);
        return partyPrice.sizePrices[selectedSize];
      }
      
      // Fall back to product's base size price
      const size = product.sizes.find(s => s.sizeName === selectedSize);
      if (size) {
        console.log(`📦 Using base size price: ₹${size.sizePrice}`);
        return size.sizePrice;
      }
      
      console.log(`⚠️ No price found for size ${selectedSize}, using base price`);
      return product.basePrice;
    }
    
    // Regular product (no sizes)
    if (partyPrice?.customPrice !== undefined && partyPrice?.customPrice !== null) {
      console.log(`✅ Using party custom price: ₹${partyPrice.customPrice}`);
      return partyPrice.customPrice;
    }
    
    console.log(`📦 Using base price: ₹${product.basePrice}`);
    return product.basePrice;
  };

  const handleSizeChange = (productId, size) => {
    setSelectedSizes({
      ...selectedSizes,
      [productId]: size
    });
  };

  const addToCart = (product) => {
    if (product.hasSizes && !selectedSizes[product._id]) {
      alert('Please select a size');
      return;
    }

    const selectedSize = product.hasSizes ? selectedSizes[product._id] : null;
    const price = getProductPrice(product, selectedSize);
    
    console.log('🛒 Adding to cart:', {
      product: product.name,
      size: selectedSize,
      price
    });
    
    const existingItem = cart.find(item => 
      item.productId === product._id && item.selectedSize === selectedSize
    );
    
    if (existingItem) {
      updateQuantity(product._id, selectedSize, existingItem.quantity + 1);
    } else {
      setCart([...cart, {
        productId: product._id,
        productName: product.name,
        selectedSize: selectedSize,
        quantity: 1,
        price,
        total: price
      }]);
    }
  };

  const updateQuantity = (productId, selectedSize, newQuantity) => {
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

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      alert('Please add items to cart');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        partyId: party._id,
        items: cart
      };

      console.log('📤 Submitting order:', orderData);

      await orderAPI.create(orderData);
      alert('Order placed successfully!');
      navigate('/salesman/parties');
    } catch (error) {
      console.error('Error creating order:', error);
      alert(error.response?.data?.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products List */}
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
                  
                  return (
                    <div
                      key={product._id}
                      className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-4 hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      {/* Product Image */}
                      {product.image ? (
                        <div className="w-full h-32 mb-3 rounded-xl overflow-hidden">
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

                      {/* Product Info */}
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

                        {/* Size Selector or Price */}
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

                        {/* Add to Cart / Quantity */}
                        {cartItem ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(product._id, cartItem.selectedSize, cartItem.quantity - 1)}
                              className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                            >
                              <Minus size={18} />
                            </button>
                            <input
                              type="number"
                              value={cartItem.quantity}
                              onChange={(e) => updateQuantity(product._id, cartItem.selectedSize, parseInt(e.target.value) || 0)}
                              className="flex-1 text-center text-xl font-bold bg-gray-50 border-2 border-gray-300 rounded-xl py-2"
                            />
                            <button
                              onClick={() => updateQuantity(product._id, cartItem.selectedSize, cartItem.quantity + 1)}
                              className="p-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
                            >
                              <Plus size={18} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(product)}
                            className="w-full btn btn-primary flex items-center justify-center gap-2 py-2"
                          >
                            <Plus size={18} />
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

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6 bg-gradient-to-br from-gray-50 to-white border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                  <ShoppingCart size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-display font-bold text-gray-900">Cart</h2>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <ShoppingCart size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500">No items in cart</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.productId}-${item.selectedSize || 'default'}-${index}`}
                        className="bg-white border border-gray-200 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{item.productName}</h4>
                            {item.selectedSize && (
                              <p className="text-sm text-purple-600 font-semibold">Size: {item.selectedSize}</p>
                            )}
                            <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.productId, item.selectedSize)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <p className="text-lg font-bold text-purple-600">₹{item.total.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSubmitOrder}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
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