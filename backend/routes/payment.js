const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const stripe = require("../config/stripe.config");

router.post("/create-payment-intent", auth, async (req, res) => {
  try {
    const { amount } = req.body;
    console.log("Amount received:", amount);
    // Log the amount for reference
    // console.log("Amount received:", amount);
    console.log(req.body);
    // Create a PaymentIntent with a success response
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "inr",
      payment_method_types: ["card"],
      description: "Product purchase",
      metadata: {
        userId: req.user.userId.toString(),
        integration_check: "accept_a_payment",
      },
      capture_method: "automatic",
      confirm: false,
      setup_future_usage: "off_session",
    });

    console.log("Payment intent created:", {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      status: paymentIntent.status,
    });
    console.log("Client secret:", paymentIntent.client_secret);
    // Send successful response with the client secret
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      message: "Error creating payment",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

module.exports = router;
