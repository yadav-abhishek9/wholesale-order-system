import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, X } from 'lucide-react';
import { productAPI } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subCategory: '',
    unit: '',
    basePrice: '',
    image: '',
    hasSizes: false,
    sizes: [],
    description: ''
  });

  const [sizeInput, setSizeInput] = useState({ sizeName: '', sizePrice: '' });

  const categories = ['Cookware', 'Appliances', 'Utensils', 'Storage', 'Cleaning', 'Other'];
  
  const subCategoriesByCategory = {
    'Cookware': ['Non-stick', 'Stainless Steel', 'Cast Iron', 'Ceramic', 'Aluminum'],
    'Appliances': ['Electric', 'Gas', 'Manual', 'Battery Operated'],
    'Utensils': ['Plastic', 'Steel', 'Wooden', 'Silicone'],
    'Storage': ['Glass', 'Plastic', 'Steel', 'Ceramic'],
    'Cleaning': ['Brushes', 'Scrubbers', 'Cloths', 'Chemicals'],
    'Other': []
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  const fetchProducts = async () => {
  try {
    console.log('Fetching products...'); // Debug
    const response = await productAPI.getAll();
    console.log('Products received:', response.data); // Debug
    setProducts(response.data);
  } catch (error) {
    console.error('Error fetching products:', error);
    console.error('Full error:', error.response); // Debug
  }
};

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        alert('Image size should be less than 1MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({ ...formData, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: '' });
    setImagePreview(null);
  };

  const addSize = () => {
    if (sizeInput.sizeName && sizeInput.sizePrice) {
      setFormData({
        ...formData,
        sizes: [...formData.sizes, {
          sizeName: sizeInput.sizeName,
          sizePrice: parseFloat(sizeInput.sizePrice)
        }]
      });
      setSizeInput({ sizeName: '', sizePrice: '' });
    }
  };

  const removeSize = (index) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const submitData = {
      name: formData.name,
      category: formData.category,
      subCategory: formData.subCategory || null,
      unit: formData.unit,
      basePrice: parseFloat(formData.basePrice),
      image: formData.image || null,
      hasSizes: formData.hasSizes,
      sizes: formData.hasSizes ? formData.sizes : [],
      description: formData.description || ''
    };

    console.log('Submitting product:', submitData);

    let response;
    if (editingProduct) {
      response = await productAPI.update(editingProduct._id, submitData);
      alert('Product updated successfully!');
    } else {
      response = await productAPI.create(submitData);
      alert('Product created successfully!');
    }
    
    resetForm();
    
    // ADD DELAY BEFORE FETCHING
    setTimeout(() => {
      fetchProducts();
    }, 500);
    
  } catch (error) {
    console.error('Error saving product:', error);
    console.error('Error details:', error.response?.data);
    alert(error.response?.data?.message || 'Error saving product');
  }
};

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      subCategory: product.subCategory || '',
      unit: product.unit,
      basePrice: product.basePrice,
      image: product.image || '',
      hasSizes: product.hasSizes || false,
      sizes: product.sizes || [],
      description: product.description || ''
    });
    setImagePreview(product.image || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(id);
        alert('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      subCategory: '',
      unit: '',
      basePrice: '',
      image: '',
      hasSizes: false,
      sizes: [],
      description: ''
    });
    setImagePreview(null);
    setSizeInput({ sizeName: '', sizePrice: '' });
    setEditingProduct(null);
    setShowModal(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-black mb-2">Products</h1>
              <p className="text-purple-100 text-lg">Manage your product catalog</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-purple-600 px-6 py-3 rounded-2xl font-bold hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="card">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="card bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              {/* Product Image */}
              {product.image ? (
                <div className="relative w-full h-48 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center">
                  <ImageIcon size={48} className="text-gray-400" />
                </div>
              )}

              {/* Product Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
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

                {/* Sizes or Single Price */}
                {product.hasSizes && product.sizes?.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">SIZES:</p>
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.map((size, idx) => (
                        <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-semibold">
                          {size.sizeName}: ₹{size.sizePrice}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl font-bold text-purple-600">₹{product.basePrice}</p>
                    <p className="text-sm text-gray-600">per {product.unit}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="card text-center py-16">
            <p className="text-gray-500 text-lg">No products found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-3xl">
              <h2 className="text-2xl font-display font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 transition-colors bg-gray-50">
                    <ImageIcon size={48} className="text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload image</p>
                    <p className="text-xs text-gray-500 mt-1">(Max 1MB, JPG/PNG)</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: '' })}
                    className="input"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subcategory</label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="input"
                    disabled={!formData.category}
                  >
                    <option value="">Select subcategory</option>
                    {formData.category && subCategoriesByCategory[formData.category]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Unit *</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="input"
                    placeholder="piece, kg, liter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Base Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="input"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input resize-none"
                  rows="3"
                  placeholder="Product description (optional)"
                />
              </div>

              {/* Sizes Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasSizes"
                  checked={formData.hasSizes}
                  onChange={(e) => setFormData({ ...formData, hasSizes: e.target.checked, sizes: [] })}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <label htmlFor="hasSizes" className="text-sm font-bold text-gray-700">
                  This product has multiple sizes
                </label>
              </div>

              {/* Sizes Section */}
              {formData.hasSizes && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-bold text-gray-900">Size Variants</h3>
                  
                  {/* Add Size */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sizeInput.sizeName}
                      onChange={(e) => setSizeInput({ ...sizeInput, sizeName: e.target.value })}
                      className="input flex-1"
                      placeholder="Size (e.g., S, M, L or 8, 10, 12)"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={sizeInput.sizePrice}
                      onChange={(e) => setSizeInput({ ...sizeInput, sizePrice: e.target.value })}
                      className="input flex-1"
                      placeholder="Price"
                    />
                    <button
                      type="button"
                      onClick={addSize}
                      className="btn btn-primary px-4"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* Size List */}
                  <div className="space-y-2">
                    {formData.sizes.map((size, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl">
                        <span className="font-semibold">{size.sizeName}: ₹{size.sizePrice}</span>
                        <button
                          type="button"
                          onClick={() => removeSize(index)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 btn btn-primary py-3">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 btn btn-secondary py-3"
                >
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

export default AdminProducts;