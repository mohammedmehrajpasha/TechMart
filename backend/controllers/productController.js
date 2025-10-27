const db = require('../config/db');
const { cloudinary } = require('../config/cloudinary.config');

const productController = {
    // Get all products
    getAllProducts: async (req, res) => {
        try {
            const [products] = await db.query('SELECT * FROM products ORDER BY created_at DESC');
            res.json(products);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).json({ message: 'Error fetching products' });
        }
    },

    // Get single product
    getProduct: async (req, res) => {
        try {
            const [product] = await db.query(
                'SELECT * FROM products WHERE id = ?', 
                [req.params.id]
            );
            
            if (product.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
            
            res.json(product[0]);
        } catch (error) {
            console.error('Error fetching product:', error);
            res.status(500).json({ message: 'Error fetching product' });
        }
    },

    // Update product
    updateProduct: async (req, res) => {
        try {
            const { name, description, price, quantity, imageUrl } = req.body;
            const productId = req.params.id;
            console.log("mskxmksmxkm",req.body);
            // Get existing product
            const [existingProduct] = await db.query(
                'SELECT * FROM products WHERE id = ?',
                [productId]
            );
    
            if (existingProduct.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
            // let imageUrl = existingProduct[0].image_url;
    
            // Upload new image to Cloudinary if provided
            // if (req.file) {
            //     // Delete old image from Cloudinary if it exists
            //     if (imageUrl) {
            //         const publicId = imageUrl.split('/').pop().split('.')[0];
            //         await cloudinary.uploader.destroy(publicId);
            //     }
    
            //     // Upload new image to Cloudinary
               
            // }
    
            // Update product in the database
            const updateQuery = `
                UPDATE products 
                SET name=?, description=?, price=?, quantity=?, image_url=?
                WHERE id=?
            `;
            const updateParams = [name, description, price, quantity, imageUrl, productId];
    
            await db.query(updateQuery, updateParams);
    
            res.json({ 
                message: 'Product updated successfully',
                product: {
                    id: productId,
                    name,
                    description,
                    price,
                    quantity,
                    image_url: imageUrl
                }
            });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Error updating product' });
        }
    },

    // Delete product
    deleteProduct: async (req, res) => {
        try {
            const { id } = req.params;

            // Get product image URL before deletion
            const [product] = await db.query(
                'SELECT image_url FROM products WHERE id = ?',
                [id]
            );

            if (product.length === 0) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Delete image from Cloudinary if exists
            if (product[0].image_url) {
                try {
                    const publicId = product[0].image_url.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(publicId);
                } catch (deleteError) {
                    console.error('Error deleting image:', deleteError);
                }
            }

            // Delete from database
            await db.query('DELETE FROM products WHERE id = ?', [id]);

            res.json({ message: 'Product deleted successfully' });

        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ 
                message: 'Error deleting product',
                error: error.message 
            });
        }
    },

    // Add product
    addProduct: async (req, res) => {
        try {
            console.log('Add product request from user:', req.user);
            
            const { name, description, price, quantity, imageUrl } = req.body;
            // const imageUrl = req.imageUrl ? req.file.path : null;
            console.log("This is imgae url",imageUrl)
            // Validate price
            const numericPrice = parseFloat(price);
            if (isNaN(numericPrice) || numericPrice <= 0 || numericPrice > 999999.99) {
                return res.status(400).json({ 
                    message: 'Invalid price. Price must be between 0 and 999,999.99'
                });
            }

            // Validate quantity
            const numericQuantity = parseInt(quantity);
            if (isNaN(numericQuantity) || numericQuantity < 0) {
                return res.status(400).json({ 
                    message: 'Invalid quantity. Quantity must be 0 or greater'
                });
            }

            // Convert MongoDB ObjectId to string for MySQL
            const createdBy = req.user.userId.toString();

            const [result] = await db.query(
                'INSERT INTO products (name, description, price, quantity, image_url, created_by) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    name,
                    description,
                    numericPrice.toFixed(2), 
                    numericQuantity,
                    imageUrl,
                    createdBy
                ]
            );

            res.status(201).json({
                message: 'Product added successfully',
                product: {
                    id: result.insertId,
                    name,
                    description,
                    price: numericPrice,
                    quantity: numericQuantity,
                    image_url: imageUrl,
                    created_by: createdBy
                }
            });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ 
                message: 'Error adding product',
                error: error.message 
            });
        }
    },
    updateCartItem: async (req, res) => {
        try {
            const { itemId } = req.params;
            const { quantity } = req.body;

            await db.query(
                'UPDATE cart_items SET quantity = ? WHERE id = ?',
                [quantity, itemId]
            );

            res.status(200).json({ message: 'Cart item updated' });
        } catch (error) {
            console.error('Error updating cart item:', error);
            res.status(500).json({ message: 'Error updating cart item' });
        }
    },

};

module.exports = productController;