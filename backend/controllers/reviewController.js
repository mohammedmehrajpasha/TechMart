const db = require('../config/db');

const reviewController = {
  // Add review
  addReview: async (req, res) => {
    try {
      const { productId, rating, feedback } = req.body;
      const userId = req.user.userId.toString();

      // Validate input
      if (!productId || !rating) {
        return res.status(400).json({ message: 'Product ID and rating are required' });
      }

      // Verify product exists
      const [product] = await db.query(
        'SELECT * FROM products WHERE id = ?',
        [productId]
      );

      if (product.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const [result] = await db.query(
        'INSERT INTO reviews (product_id, user_id, rating, feedback) VALUES (?, ?, ?, ?)',
        [productId, userId, rating, feedback]
      );

      res.status(201).json({
        message: 'Review added successfully',
        reviewId: result.insertId
      });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ message: 'Error adding review' });
    }
  },

  // Get reviews for a product
  getProductReviews: async (req, res) => {
    try {
      const [reviews] = await db.query(
        `SELECT r.*, u.email as user_email 
         FROM reviews r
         LEFT JOIN users u ON r.user_id = u.id
         WHERE r.product_id = ?
         ORDER BY r.created_at DESC`,
        [req.params.productId]
      );
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  },

  // Get all reviews (for admin dashboard)
  getAllReviews: async (req, res) => {
    try {
      const [reviews] = await db.query(
        `SELECT r.*, p.name as product_name, u.email as user_email
         FROM reviews r
         JOIN products p ON r.product_id = p.id
         LEFT JOIN users u ON r.user_id = u.id
         ORDER BY r.created_at DESC`
      );
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  }
};

module.exports = reviewController; 