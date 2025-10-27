const config = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  CLOUDINARY_URL: process.env.REACT_APP_CLOUDINARY_URL,
  ENV: process.env.NODE_ENV
};

export default config; 