import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import AddProduct from './pages/AddProduct';
import ProtectedRoute from './components/ProtectedRoute';
import EditProduct from './pages/EditProduct';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ReviewAnalytics from './pages/ReviewAnalytics';
import SignUp from './pages/SignUp';
import OTPVerification from './pages/OTPVerification';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminOrders from './pages/AdminOrders';
import ProductAnalysisPage from "./pages/ProductAnalysisPage";
import OrderHistory from "./pages/OrderHistory";
import './index.css';
// ...existing code...

function App() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/otp-verification" element={<OTPVerification />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add-product"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-product/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminOrders />
              </ProtectedRoute>
            }
          />

          {/* Customer Routes */}
          <Route
            path="/products"
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/analysis-results" element={<ReviewAnalytics />} />
          <Route path="/product-analysis" element={<ProductAnalysisPage />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/OrderHistory"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <OrderHistory />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
