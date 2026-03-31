const Product = require('../models/Product');
const PartyPrice = require('../models/PartyPrice');

const createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body); // Debug
    const product = new Product(req.body);
    await product.save();
    console.log('Product created:', product); // Debug
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error); // Debug
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    console.log('🔍 Getting products...');
    const products = await Product.find();
    console.log('✅ Found products:', products.length);
    if (products.length > 0) {
      console.log('📦 First product:', products[0].name);
    }
    res.json(products);
  } catch (error) {
    console.error('❌ Error in getProducts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Delete request for:", id);

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await PartyPrice.deleteMany({ product: id });

    await product.deleteOne();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
