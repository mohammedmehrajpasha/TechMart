import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Rating, Button, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalReviews: 0,
    products: []
  });
  const [selectedReviews, setSelectedReviews] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const fetchDashboardStats = useCallback(async () => {
    try {
      const productsResponse = await productService.getAllProducts();
      const products = productsResponse.data;

      const reviewsResponse = await fetch('http://localhost:5000/api/reviews', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const reviewsData = await reviewsResponse.json();

      const productsWithStats = products.map(product => {
        const productReviews = reviewsData.filter(review => review.product_id === product.id);
        const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = productReviews.length > 0 ? totalRating / productReviews.length : 0;
        return {
          ...product,
          reviewCount: productReviews.length,
          averageRating,
          reviews: productReviews
        };
      });

      setStats({
        totalProducts: products.length,
        totalReviews: reviewsData.length,
        products: productsWithStats
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleViewReviews = (reviews) => {
    setSelectedReviews(reviews);
    setOpenDialog(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] p-8">
      <div className="max-w-7xl mx-auto">
        <Typography variant="h3" className="text-[#0056D2] font-bold mb-8">Admin Dashboard</Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Paper className="p-6 shadow-lg">
            <Typography>Total Products</Typography>
            <Typography variant="h4">{stats.totalProducts}</Typography>
          </Paper>
          <Paper className="p-6 shadow-lg">
            <Typography>Total Reviews</Typography>
            <Typography variant="h4">{stats.totalReviews}</Typography>
          </Paper>
        </div>
         <div className="bg-white rounded-xl shadow-xl mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <Typography variant="h6" className="text-[#333333] font-semibold">Product Statistics</Typography>
          </div>
          <div className="overflow-x-auto">
            <Table className="w-full table-auto">
              <TableHead className="bg-[#D3D3D3]">
                <TableRow>
                  <TableCell className="px-6 py-4 text-left text-sm font-semibold text-[#333333]">Product Name</TableCell>
                  <TableCell className="px-6 py-4 text-left text-sm font-semibold text-[#333333]">Reviews</TableCell>
                  <TableCell className="px-6 py-4 text-left text-sm font-semibold text-[#333333]">Rating</TableCell>
                  <TableCell className="px-6 py-4 text-left text-sm font-semibold text-[#333333]">Price</TableCell>
                  <TableCell className="px-6 py-4 text-left text-sm font-semibold text-[#333333]">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody className="divide-y divide-gray-200">
                {stats.products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <TableCell className="px-6 py-4 text-sm text-[#333333]">{product.name}</TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-600">{product.reviewCount}</TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Rating value={product.averageRating} precision={0.1} readOnly size="small" />
                        <Typography variant="body2" className="text-gray-600">({product.averageRating.toFixed(1)})</Typography>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-600">₹{product.price}</TableCell>
                    <TableCell className="px-6 py-4">
                    <button
                      onClick={() => handleViewDetails(product.id)}
                      className="bg-white text-[#0056D2] hover:text-white hover:bg-[#1E90FF] px-4 py-2 rounded-lg text-sm font-semibold backdrop-blur-sm transition-all duration-300 border border-gray-200 hover:border-white/40 hover:scale-105"
                    >
                      View Details
                    </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="bg-white shadow-lg p-6">
          <Typography variant="h6">Reviews</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Reviews</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.reviewCount}</TableCell>
                  <TableCell>
                    <Rating value={product.averageRating} precision={0.1} readOnly size="small" />
                    ({product.averageRating.toFixed(1)})
                  </TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>
                    <Button variant="outlined" onClick={() => handleViewReviews(product.reviews)}>View Reviews</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Dialog Box for Viewing Reviews */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Reviews
            <IconButton onClick={() => setOpenDialog(false)} style={{ position: 'absolute', right: 10, top: 10 }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rating</TableCell>
                  <TableCell>Feedback</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedReviews.length > 0 ? (
                  selectedReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell><Rating value={review.rating} readOnly size="small" /></TableCell>
                      <TableCell>{review.feedback}</TableCell>
                      <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">No Reviews Available</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;
