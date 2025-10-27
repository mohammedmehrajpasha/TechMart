const express = require('express');
const router = express.Router();
const { uploadMiddleware } = require('../config/cloudinary.config');
const productController = require('../controllers/productController');
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Protected routes - Admin only
router.post('/', auth, isAdmin, uploadMiddleware, productController.addProduct);
router.put('/:id', auth, isAdmin, uploadMiddleware, productController.updateProduct);
router.delete('/:id', auth, isAdmin, productController.deleteProduct);

module.exports = router;
