const db = require('../config/db');

const cartController = {
    // Add to cart
    addToCart: async (req, res) => {
        try {
            const { productId, quantity } = req.body;
            const userId = req.user.userId.toString();
            console.log(userId)
            // Check product availability
            const [product] = await db.query(
                'SELECT * FROM products WHERE id = ? AND quantity >= ?',
                [productId, quantity]
            );

            if (product.length === 0) {
                return res.status(400).json({ message: 'Product not available in requested quantity' });
            }

            // Get or create cart
            let [cart] = await db.query(
                'SELECT * FROM cart WHERE user_id = ?',
                [userId]
            );

            let cartId;
            if (cart.length === 0) {
                const [newCart] = await db.query(
                    'INSERT INTO cart (user_id) VALUES (?)',
                    [userId]
                );
                cartId = newCart.insertId;
            } else {
                cartId = cart[0].id;
            }

            // Add/update cart item
            const [existingItem] = await db.query(
                'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
                [cartId, productId]
            );

            if (existingItem.length > 0) {
                await db.query(
                    'UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?',
                    [quantity, cartId, productId]
                );
            } else {
                await db.query(
                    'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
                    [cartId, productId, quantity]
                );
            }

            res.status(200).json({ message: 'Product added to cart' });
        } catch (error) {
            console.error('Error adding to cart:', error);
            res.status(500).json({ message: 'Error adding to cart' });
        }
    },

    // Get cart
    getCart: async (req, res) => {
        try {
            const userId = req.user.userId.toString();
            console.log("userId",userId )
            const [cartItems] = await db.query(
                `SELECT ci.*, p.name, p.price, p.image_url 
                 FROM cart c 
                 JOIN cart_items ci ON c.id = ci.cart_id 
                 JOIN products p ON ci.product_id = p.id 
                 WHERE c.user_id = ?`,
                [userId]
            );
            console.log("cartItems",cartItems )
            res.json(cartItems);
        } catch (error) {
            console.error('Error fetching cart:', error);
            res.status(500).json({ message: 'Error fetching cart' });
        }
    },

    // Update cart item quantity
    updateCart: async (req, res) => {
        try {
            const { quantity } = req.body;
            const { id: productId } = req.params;
            const userId = req.user.userId.toString();
    
            console.log("Updating cart:", { userId, productId, quantity });
    
            // Directly check the cart_items table
            const [existingItem] = await db.query(
                `SELECT * FROM cart_items WHERE product_id = ?`,
                [productId]
            );
    
            if (!existingItem.length) {
                console.log("Product not found in cart:", productId);
                return res.status(404).json({ message: 'Item not found in cart' });
            }
    
            if (quantity > 0) {
                await db.query(
                    'UPDATE cart_items SET quantity = ? WHERE product_id = ?',
                    [quantity, productId]
                );
                console.log("Cart updated successfully:", { productId, quantity });
                res.json({ message: 'Cart updated successfully' });
            } else {
                await db.query(
                    'DELETE FROM cart_items WHERE product_id = ?',
                    [productId]
                );
                console.log("Item removed from cart:", { productId });
                res.json({ message: 'Item removed from cart' });
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            res.status(500).json({ message: 'Error updating cart' });
        }
    },

    // Remove a single product from the cart
    removeCartItem: async (req, res) => {
        try {
            const userId = req.user.userId.toString();
            const { id: productId } = req.params;

            const [cart] = await db.query(
                'SELECT * FROM cart WHERE user_id = ?',
                [userId]
            );

            if (cart.length === 0) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            const cartId = cart[0].id;

            const [existingItem] = await db.query(
                'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
                [cartId, productId]
            );

            if (existingItem.length === 0) {
                return res.status(404).json({ message: 'Product not found in cart' });
            }

            await db.query(
                'DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?',
                [cartId, productId]
            );

            res.json({ message: 'Product removed from cart' });
        } catch (error) {
            console.error('Error removing item from cart:', error);
            res.status(500).json({ message: 'Error removing item from cart' });
        }
    },

    // Clear the entire cart
    clearCart: async (req, res) => {
        try {
            const userId = req.user.userId.toString();

            const [cart] = await db.query(
                'SELECT * FROM cart WHERE user_id = ?',
                [userId]
            );

            if (cart.length === 0) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            const cartId = cart[0].id;

            await db.query(
                'DELETE FROM cart_items WHERE cart_id = ?',
                [cartId]
            );

            res.json({ message: 'Cart cleared successfully' });
        } catch (error) {
            console.error('Error clearing cart:', error);
            res.status(500).json({ message: 'Error clearing cart' });
        }
    }
};

module.exports = cartController;
