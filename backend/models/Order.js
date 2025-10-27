const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product_id: Number,
    quantity: Number,
    price_at_time: Number,
    product_name: String
});

const orderSchema = new mongoose.Schema({
    mysql_order_id: {
        type: Number,
        required: true,
        unique: true
    },
    user_id: {
        type: String,
        required: true
    },
    total_amount: {
        type: Number,
        required: true
    },
    shipping_address: String,
    phone_number: String,
    status: {
        type: String,
        default: 'pending'
    },
    items: [orderItemSchema],
    created_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
