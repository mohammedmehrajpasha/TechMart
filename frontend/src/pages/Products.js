import React, { useState, useEffect } from 'react';
import { Dialog, Snackbar } from '@mui/material'; // Removed Backdrop
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SparklesIcon, HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import ProductReview from '../components/ProductReview';
import { productService, cartService } from '../services/api';

const Products = () => {
  const navigate = useNavigate();
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleReviewClick = (product) => {
    setSelectedProduct(product);
    setOpenReviewDialog(true);
  };

  const handleReviewSubmitted = () => {
    setOpenReviewDialog(false);
    fetchProducts();
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
      }
    }
  };

  const handleEditProduct = (productId) => {
    navigate(`/admin/edit-product/${productId}`);
  };

  const handleAddToCart = async (productId) => {
    try {
      await cartService.addToCart({ productId, quantity: 1 });
      window.dispatchEvent(new CustomEvent('cart-updated'));
      setMessage('Product added to cart');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setMessage('Error adding to cart');
      setOpenSnackbar(true);
    }
  };

  const toggleReadMore = (productId) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      {/* Removed Backdrop component */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="relative bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={product.image_url || 'https://via.placeholder.com/400'}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400'; }}
                  />
                  {product.quantity === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">Out of Stock</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  
                  <p className="text-gray-600 mb-4">
                    {expandedProduct === product.id ? product.description : `${product.description.substring(0, 100)}...`}
                    {product.description.length > 100 && (
                      <button 
                        onClick={() => toggleReadMore(product.id)} 
                        className="text-teal-600 font-semibold ml-2"
                      >
                        {expandedProduct === product.id ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-teal-600">₹{product.price}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        product.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {role === 'admin' ? (
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEditProduct(product.id)}
                        className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${
                          product.quantity === 0
                            ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                            : 'bg-teal-500 hover:bg-teal-600 text-white'
                        }`}
                      >
                        <SparklesIcon className="h-5 w-5 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleReviewClick(product)}
                        className="flex-1 px-4 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <HeartIcon className="h-5 w-5" />
                        Review
                      </button>
                      <Dialog 
                        open={openReviewDialog} 
                        onClose={() => setOpenReviewDialog(false)}
                        maxWidth="sm"
                        fullWidth
                      >
                        {selectedProduct && (
                          <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">
                              Write a Review for {selectedProduct.name}
                            </h2>
                            <ProductReview
                              productId={selectedProduct.id}
                              onReviewSubmitted={handleReviewSubmitted}
                            />
                          </div>
                        )}
                      </Dialog>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.quantity === 0}
                        className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 ${
                          product.quantity === 0
                            ? 'bg-gray-300 cursor-not-allowed text-gray-600'
                            : 'bg-teal-500 hover:bg-teal-600 text-white'
                        }`}
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                        Add to Cart
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={message}
      />
    </div>
  );
};

export default Products;