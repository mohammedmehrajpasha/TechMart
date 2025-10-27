const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

router.post('/add', auth, cartController.addToCart);
router.get('/', auth, cartController.getCart);
router.put('/update/:id', auth, cartController.updateCart);
router.delete('/remove/:id', auth, cartController.removeCartItem); // ✅ Remove single item from cart
router.delete('/clear', auth, cartController.clearCart); // ✅ Clear entire cart

module.exports = router;
