import React, { useState, useEffect } from "react";
import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import axios from "axios";
import stripePromise from "../config/stripe";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const PaymentForm = ({
  amount,
  userId,
  items,
  onOrderSuccess,
  onPaymentSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

//   useEffect(() => {
//     const createPaymentIntent = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.post(
//           "http://localhost:5000/api/payment/",
//           { amount },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (!response.data?.clientSecret) {
//           throw new Error("Invalid response from server");
//         }

//         setClientSecret(response.data.clientSecret);
//       } catch (err) {
//         const errorMessage =
//           err.response?.data?.message || "Failed to initialize payment";
//         console.error("Payment intent creation failed:", errorMessage);
//         setError(errorMessage);
//       }
//     };

//     if (amount > 0) {
//       createPaymentIntent();
//     }
//   }, [amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Generate a random number to simulate a payment intent ID
    const mockPaymentIntentId = Math.floor(Math.random() * 1000000).toString();

    // Call the onPaymentSuccess function with the mock payment intent
    onPaymentSuccess(mockPaymentIntentId);

    // Optionally, you can also call onOrderSuccess if needed
    // onOrderSuccess({ id: mockPaymentIntentId, amount });

    // You can also add any additional logic here if necessary
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Order Summary
      </Typography>

      <Typography variant="body1">
        Total Amount: ₹{amount.toFixed(2)}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="button"
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        sx={{ mt: 2 }}
      >
        Proceed with Order
      </Button>
    </Box>
  );
};

const PaymentWrapper = ({
  amount,
  userId,
  items,
  onOrderSuccess,
  onPaymentSuccess,
}) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        amount={amount}
        userId={userId}
        items={items}
        onOrderSuccess={onOrderSuccess}
        onPaymentSuccess={onPaymentSuccess}
      />
    </Elements>
  );
};

export default PaymentWrapper;
