const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing Stripe secret key");
}

console.log(
  "Stripe initialized with key:",
  process.env.STRIPE_SECRET_KEY.slice(-4)
);

module.exports = stripe;
