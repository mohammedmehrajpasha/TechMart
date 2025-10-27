const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload } = require('../config/cloudinary.config');
const productController = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');
console.log("This is backend")
// Get all products
router.get('/', productController.getAllProducts);

// Get single product
router.get('/:id', productController.getProduct);

// Add new product
router.post('/', 
    verifyToken,
    upload.single('imageUrl'),
    productController.addProduct
);

// Update product
router.put('/:id', 
    verifyToken,
    upload.single('imageUrl'),
    async (req, res, next) => {
        try {
            console.log('Update request body:', req.body);
            console.log('Update file:', req.file);
            
            const { name, description, price } = req.body;
            console.log(req.body)
            // Add the image URL to the request body if a new file was uploaded
            if (req.file) {
                req.body.imageUrl = req.file.path;
            }
            
            next();
        } catch (error) {
            next(error);
        }
    },
    productController.updateProduct
);

// Delete product
router.delete('/:id', 
    verifyToken,
    productController.deleteProduct
);

// Error handling middleware
router.use((error, req, res, next) => {
    console.error('Router Error:', error);
    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            message: 'File upload error',
            error: error.message
        });
    }
    res.status(500).json({
        message: 'Internal server error',
        error: error.message
    });
});

module.exports = router;
