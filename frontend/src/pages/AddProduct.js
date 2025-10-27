import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Snackbar, 
  CardMedia 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddProduct = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    quantity: 0,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If the field is price, allow only numeric input (including decimal point)
    if (name === "price") {
      // Allow only digits and one decimal point
      const numericValue = value.replace(/[^0-9.]/g, ''); // remove anything that is not a number or a decimal point
      setProduct(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (name === "quantity") {
      // If the field is quantity, allow only positive integers
      const numericValue = value.replace(/[^0-9]/g, ''); // remove anything that is not a digit
      setProduct(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      // For other fields, just update as usual
      setProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');  // Clear previous error

    // Validate price
    const numericPrice = parseFloat(product.price);
    if (isNaN(numericPrice) || numericPrice <= 0 || numericPrice > 999999.99) {
      setError('Price must be between 0 and 999,999.99');
      return;
    }

    // Validate two decimal precision
    const priceDecimalCheck = /^[0-9]+(\.[0-9]{1,2})?$/;
    if (!priceDecimalCheck.test(product.price)) {
      setError('Price should have up to two decimal places');
      return;
    }

    // Validate quantity
    const numericQuantity = parseInt(product.quantity);
    if (isNaN(numericQuantity) || numericQuantity < 0) {
      setError('Quantity must be 0 or greater');
      return;
    }

    const formData = new FormData();
    formData.append('name', String(product.name).trim());
    formData.append('description', String(product.description).trim());
    formData.append('price', numericPrice.toFixed(2));
    formData.append('quantity', numericQuantity);
    
    if (selectedFile) {
      formData.append('imageUrl', selectedFile);
    }
    console.log("mskxmksmxkm",formData);
    try {
      const response = await axios.post('http://localhost:5000/api/products', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage('Product added successfully');
      setOpen(true);
      navigate('/products');
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.response?.data?.message || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <Container maxWidth="md" sx={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      
      <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)', background: '#E8E8E8' }}>
      <Typography variant="h4" component="h1" className="text-[#0056D2] font-bold mb-8 macondo-regular"
        style={{ fontFamily: 'Macondo, serif' }} gutterBottom sx={{ fontWeight: 600, color: '#333' }}>
          Add New Product
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={product.name}
            onChange={handleChange}
            margin="normal"
            required
            sx={{ backgroundColor: 'white', borderRadius: 1, '& .MuiOutlinedInput-root': { borderRadius: '4px' }}}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={product.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            required
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />
          <TextField
            fullWidth
            label="Price"
            name="price"
            type="text" // Changed to text to allow full control over the input
            value={product.price}
            onChange={handleChange}
            margin="normal"
            required
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          />
          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            type="text"
            value={product.quantity}
            onChange={handleChange}
            margin="normal"
            required
            InputProps={{
              inputProps: { min: 0 }
            }}
            sx={{ backgroundColor: 'white', borderRadius: 1, '& .MuiOutlinedInput-root': { borderRadius: '4px' }}}
          />
          
          <Button
            component="label"
            // variant="outlined"
            sx={{
              mt: 2, 
              mb: 2, 
              background: '#4CAF50', 
              '&:hover': { 
                background: 'white', 
                color: '#4CAF50'  // Change text color to black
              },
              borderRadius: '8px', 
              color: 'white', 
              fontWeight: '600', 
              padding: '10px 20px'
            }}
            fullWidth
          >
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>

          
          {previewImage && (
            <Box sx={{ mt: 2, mb: 2, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#333' }}>
                Image Preview:
              </Typography>
              <CardMedia
                component="img"
                height="200"
                image={previewImage}
                alt="Product preview"
                sx={{
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '2px solid #ddd',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                  marginTop: '1rem'
                }}
              />
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 2, 
              backgroundColor: '#1976D2', 
              '&:hover': { backgroundColor: 'white' ,
                color:'#1976D2'
              },
              borderRadius: '8px',
              padding: '10px 20px', 
              fontWeight: '600'
            }}
            disabled={loading}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        message={message}
        sx={{
          '& .MuiSnackbarContent-root': {
            backgroundColor: '#388E3C',
            color: 'white',
            fontWeight: 'bold',
          }
        }}
      />
    </Container>
  );
};

export default AddProduct;
