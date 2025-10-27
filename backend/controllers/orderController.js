const db = require('../config/db');
const Order = require('../models/Order');

const orderController = {
    createOrder: async (req, res) => {
        const connection = await db.getConnection();
        
        try {
            const { shippingAddress, phoneNumber } = req.body;
            const userId = req.user.userId.toString();

            console.log('Creating order for user:', userId);
            console.log('Order details:', { shippingAddress, phoneNumber });

            try {
                // Get cart items
                const [cartItems] = await connection.query(
                    `SELECT ci.*, p.price, p.quantity as stock, p.name as product_name 
                     FROM cart c 
                     JOIN cart_items ci ON c.id = ci.cart_id 
                     JOIN products p ON ci.product_id = p.id 
                     WHERE c.user_id = ?`,
                    [userId]
                );

                console.log('Cart items found:', cartItems);

                if (cartItems.length === 0) {
                    throw new Error('Cart is empty');
                }

                // Calculate total and verify stock
                let totalAmount = 0;
                for (const item of cartItems) {
                    if (item.quantity > item.stock) {
                        throw new Error(`Not enough stock for product ID ${item.product_id}`);
                    }
                    totalAmount += item.price * item.quantity;
                }

                console.log('Total amount calculated:', totalAmount);

                // Create order in MySQL
                const [orderResult] = await connection.query(
                    `INSERT INTO orders (user_id, total_amount, shipping_address, phone_number) 
                     VALUES (?, ?, ?, ?)`,
                    [userId, totalAmount, shippingAddress, phoneNumber]
                );

                const orderId = orderResult.insertId;
                console.log('MySQL Order created with ID:', orderId);

                // Prepare items for both MySQL and MongoDB
                const orderItems = [];

                // Create order items and update product quantities
                for (const item of cartItems) {
                    // Add order item to MySQL
                    await connection.query(
                        `INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
                         VALUES (?, ?, ?, ?)`,
                        [orderId, item.product_id, item.quantity, item.price]
                    );

                    // Update product stock
                    await connection.query(
                        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
                        [item.quantity, item.product_id]
                    );

                    // Add item to MongoDB array
                    orderItems.push({
                        product_id: item.product_id,
                        quantity: item.quantity,
                        price_at_time: item.price,
                        product_name: item.product_name
                    });
                }

                // Create order in MongoDB
                try {
                    const mongoOrder = new Order({
                        mysql_order_id: orderId,
                        user_id: userId,
                        total_amount: totalAmount,
                        shipping_address: shippingAddress,
                        phone_number: phoneNumber,
                        items: orderItems
                    });
                    await mongoOrder.save();
                    console.log('Order saved to MongoDB with MySQL ID:', orderId);
                } catch (mongoError) {
                    console.error('Error saving to MongoDB:', mongoError);
                    // Continue with MySQL operation even if MongoDB fails
                }

                // Clear cart
                await connection.query(
                    'DELETE FROM cart WHERE user_id = ?',
                    [userId]
                );

                console.log('Cart cleared for user:', userId);

                // Commit transaction
                await connection.commit();

                res.status(201).json({
                    message: 'Order created successfully',
                    orderId: orderId
                });

            } catch (error) {
                // Rollback on error
                await connection.rollback();
                throw error;
            }
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(400).json({ 
                message: error.message || 'Error creating order',
                details: error.toString()
            });
        } finally {
            connection.release();
        }
    },

    getUserOrders: async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        console.log("its user id",userId)
        // Fetch orders from MongoDB for the specific user
        const mongoOrders = await Order.find({ user_id: userId })
            .sort({ created_at: -1 }) // Sort by latest orders first
            .select("_id mysql_order_id total_amount shipping_address phone_number status items created_at"); // Select relevant fields
        
        if (!mongoOrders.length) {
            return res.status(404).json({ message: "No orders found for this user" });
        }

        res.json(mongoOrders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Error fetching orders" });
    }
},

    getAllOrders: async (req, res) => {
        const connection = await db.getConnection();
        try {
            // Check MySQL orders
            const [orderCheck] = await connection.query('SELECT COUNT(*) as count FROM orders');
            
            if (orderCheck[0].count === 0) {
                return res.json([]);
            }

            // Get MySQL orders
            const [mysqlOrders] = await connection.query(
                `SELECT 
                    o.*,
                    GROUP_CONCAT(
                        JSON_OBJECT(
                            'product_id', oi.product_id,
                            'product_name', p.name,
                            'quantity', oi.quantity,
                            'price', oi.price_at_time
                        )
                    ) as items
                 FROM orders o
                 LEFT JOIN order_items oi ON o.id = oi.order_id
                 LEFT JOIN products p ON oi.product_id = p.id
                 GROUP BY o.id, o.user_id, o.total_amount, o.shipping_address, 
                          o.phone_number, o.status, o.created_at
                 ORDER BY o.created_at DESC`
            );

            // Get MongoDB orders
            let mongoOrders = [];
            try {
                mongoOrders = await Order.find().sort({ created_at: -1 });
                console.log('MongoDB orders retrieved:', mongoOrders.length);
            } catch (mongoError) {
                console.error('Error fetching from MongoDB:', mongoError);
            }

            // Format MySQL orders
            const formattedOrders = mysqlOrders.map(order => {
                try {
                    return {
                        ...order,
                        items: order.items ? JSON.parse(`[${order.items}]`) : []
                    };
                } catch (error) {
                    console.error('Error parsing order items for order ID:', order.id, error);
                    return {
                        ...order,
                        items: []
                    };
                }
            });

            res.json(formattedOrders);
        } catch (error) {
            console.error('Error fetching all orders:', error);
            res.status(500).json({ 
                message: 'Error fetching orders',
                error: error.message,
                stack: error.stack
            });
        } finally {
            connection.release();
        }
    }
};

module.exports = orderController;