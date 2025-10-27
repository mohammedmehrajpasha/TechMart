import React, { useState } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { reviewService } from '../services/api';

const ProductReview = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please provide a rating');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await reviewService.addReview({
        productId: parseInt(productId),
        rating: parseInt(rating),
        feedback
      });

      setRating(0);
      setFeedback('');
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(error.response?.data?.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography component="legend">Rating</Typography>
      <Rating
        name="rating"
        value={rating}
        onChange={(event, newValue) => {
          setRating(newValue);
        }}
        precision={1}
        size="large"
        sx={{ mb: 2 }}
        required
      />

      <TextField
        fullWidth
        label="Your Review"
        multiline
        rows={4}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading || !rating}
      >
        {loading ? <CircularProgress size={24} /> : 'Submit Review'}
      </Button>
    </Box>
  );
};

export default ProductReview;