import React, { useState, useEffect, useMemo } from "react";
import { cartService } from "../services/api";
import { Dialog, Snackbar } from '@mui/material'; // Removed Backdrop
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51QE9DkRqUPj1sgqgkOcYpScpMmJOm8wOv4fDgX7OgcoNUDu5HaQnjxol5APWlsPEUvvjAtaLOFx3BIbDMKisbiC800n4sLcRnJ"); 

const steps = ["Shipping Information", "Order Summary", "Payment"];

const Checkout = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({ shippingAddress: "", phoneNumber: "" });
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        const response = await cartService.getCart();
        setCartItems(response.data);
      } catch (error) {
        setError("Error fetching cart details");
      }
    };
    fetchCartDetails();
  }, []);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0),
    [cartItems]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateShippingInfo = () => {
    const { shippingAddress, phoneNumber } = formData;
    if (!shippingAddress.trim() || !phoneNumber.trim()) {
      setError("Please fill in all fields");
      return false;
    }
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }
    setError("");
    return true;
  };

  const handleNext = async () => {
    if (activeStep === 0 && !validateShippingInfo()) return;
  
    if (activeStep === 1) {
      try {
        const token = localStorage.getItem("token"); // Retrieve the auth token
        const response = await axios.post(
          "http://localhost:5000/api/payment/create-payment-intent",
          { amount: cartTotal * 100 },
          { headers: { Authorization: `Bearer ${token}` } } // Send token
        );
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        setError("Error generating payment intent");
        return;
      }
    }
  
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3, mt: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Checkout
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {activeStep === 0 && (
          <Box component="form">
            <TextField
              fullWidth
              label="Shipping Address"
              name="shippingAddress"
              value={formData.shippingAddress}
              onChange={handleChange}
              multiline
              rows={3}
              required
              sx={{ mb: 2 }}
              helperText="Include door number, street, city, and postal code"
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              sx={{ mb: 3 }}
              helperText="Enter a valid 10-digit phone number"
            />
            <Button variant="contained" fullWidth onClick={handleNext} sx={{ mt: 1 }}>
              Proceed to Order Summary
            </Button>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <List>
              {cartItems.map((item) => (
                <ListItem key={item.id} divider>
                  <ListItemText
                    primary={item.name}
                    secondary={`₹${item.price} × ${item.quantity} = ₹${(item.price * item.quantity).toFixed(2)}`}
                  />
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Total Amount: ₹{cartTotal.toFixed(2)}</Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Button variant="contained" fullWidth onClick={handleBack}>
                  Back
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" fullWidth onClick={handleNext}>
                  Proceed to Payment
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

        {activeStep === 2 && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm formData={formData} cartItems={cartItems} navigate={navigate} clientSecret={clientSecret} setMessage={setMessage} setOpenSnackbar={setOpenSnackbar} />
          </Elements>
        )}

      </Paper>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message={message}
      />
    </Container>
  );
};

const PaymentForm = ({ formData, cartItems, navigate, clientSecret, setMessage, setOpenSnackbar }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) {
      setError("Payment service unavailable.");
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (stripeError) {
      setError(stripeError.message);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/orders",
        {
          ...formData,
          paymentIntentId: paymentIntent.id,
          items: cartItems,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      window.dispatchEvent(new CustomEvent("cart-updated"));
      setMessage('Order placed successfully!');
      setOpenSnackbar(true);
      navigate("/products");
    } catch (err) {
      setError("Error saving order. Please try again.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Enter Card Details
        </Typography>
        <CardElement options={{ hidePostalCode: true }} />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={!stripe}>
          Pay Now
        </Button>
      </form>
    </div>
  );
};

export default Checkout;