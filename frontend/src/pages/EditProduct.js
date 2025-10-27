import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Snackbar,
  CardMedia,
  Input,
  FormControl,
  InputLabel,
} from '@mui/material';
import axios from 'axios';
import { productService } from '../services/api';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    image: null,
    imagePreview: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await productService.getProduct(id);
      setProduct({
        ...response.data,
        imagePreview: response.data.image_url
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      setMessage('Error fetching product');
      setOpen(true);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct((prev) => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    const numericPrice = parseFloat(product.price);
    if (isNaN(numericPrice) || numericPrice <= 0 || numericPrice > 999999.99) {
      setError('Price must be between 0 and 999,999.99');
      setLoading(false);
      return;
    }
  
    const priceDecimalCheck = /^[0-9]+(\.[0-9]{1,2})?$/;
    if (!priceDecimalCheck.test(product.price)) {
      setError('Price should have up to two decimal places');
      setLoading(false);
      return;
    }
  
    const numericQuantity = parseInt(product.quantity);
    if (isNaN(numericQuantity) || numericQuantity < 0) {
      setError('Quantity must be 0 or greater');
      setLoading(false);
      return;
    }
  
    const formData = new FormData();
    formData.append('name', String(product.name).trim());
    formData.append('description', String(product.description).trim());
    formData.append('price', numericPrice.toFixed(2));
    formData.append('quantity', numericQuantity);
  
    if (selectedFile) {
      formData.append('imageUrl', selectedFile);
    } else {
      formData.append('imageUrl', product.imagePreview); // Send existing image URL if no new file is selected
    }
  
    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
  
      setMessage('Product updated successfully');
      setOpen(true);
      navigate('/products');
    } catch (error) {
      console.error('Error updating product:', error);
      setError(error.response?.data?.message || 'Error updating product');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Edit Product
        </Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="name"
            label="Product Name"
            value={product.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            name="description"
            label="Description"
            multiline
            rows={4}
            value={product.description}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            name="price"
            label="Price"
            type="number"
            value={product.price}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            name="quantity"
            label="Quantity"
            type="number"
            value={product.quantity}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Upload Product Image:
            </Typography>
            <FormControl fullWidth>
              <InputLabel htmlFor="image-upload" shrink={true}>
                Choose an image
              </InputLabel>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                sx={{
                  mt: 1,
                  '& input': {
                    padding: '10px',
                  },
                }}
              />
            </FormControl>
          </Box>
          {product.imagePreview && (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Image Preview:
              </Typography>
              <CardMedia
                component="img"
                height="200"
                image={product.imagePreview}
                alt={product.name}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
                }}
                sx={{ 
                  objectFit: 'cover',
                  borderRadius: 1,
                  border: '1px solid #ddd'
                }}
              />
            </Box>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Product'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        message={message}
      />
    </Container>
  );
};

export default EditProduct;
