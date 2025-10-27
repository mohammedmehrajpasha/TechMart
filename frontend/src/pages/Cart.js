import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { cartService } from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
      setCartItems(response.data);
    } catch (error) {
      setError('Error fetching cart');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncreaseQuantity = async (item) => {
    const updatedQuantity = item.quantity + 1;
    try {
      await cartService.updateCartItem(item.product_id, updatedQuantity);
      setCartItems(cartItems.map(i => i.product_id === item.product_id ? { ...i, quantity: updatedQuantity } : i));
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleDecreaseQuantity = async (item) => {
    if (item.quantity > 1) {
      const updatedQuantity = item.quantity - 1;
      try {
        await cartService.updateCartItem(item.product_id, updatedQuantity);
        setCartItems(cartItems.map(i => i.product_id === item.product_id ? { ...i, quantity: updatedQuantity } : i));
      } catch (error) {
        console.error('Error updating cart:', error);
      }
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      await cartService.removeCartItem(item.product_id);
      setCartItems(cartItems.filter(i => i.product_id !== item.product_id));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleClearCart = async () => {
    try {
      await cartService.clearCart();
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>

      {cartItems.length === 0 ? (
        <Alert severity="info">Your cart is empty</Alert>
      ) : (
        <>
          {cartItems.map((item) => (
            <Card key={item.product_id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <img
                      src={item.image_url || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      style={{ width: '100%', maxWidth: '100px' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography color="primary" variant="h6">
                      ₹{item.price}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconButton size="small" onClick={() => handleDecreaseQuantity(item)}>
                        <RemoveIcon />
                      </IconButton>
                      <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => handleIncreaseQuantity(item)}>
                        <AddIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleRemoveItem(item)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ mt: 4, mb: 2 }}>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="h5">Total:</Typography>
              <Typography variant="h5">₹{calculateTotal().toFixed(2)}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleClearCart}
            >
              Clear Cart
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Cart;
