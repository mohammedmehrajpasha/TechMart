const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const salesController = require("../controllers/salesController");
const { auth } = require("../middleware/auth");

// router.get("/product/:productId", reviewController.getProductReviews);
// router.get("/", auth, reviewController.getAllReviews);
router.get("/sales-details/:productId", auth, salesController.getSalesDetails);

module.exports = router;
