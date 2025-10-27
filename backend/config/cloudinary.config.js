const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure local storage temporarily
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Configure Multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('imageUrl');

// Middleware to handle file upload and Cloudinary upload
const uploadMiddleware = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        message: err.message || 'Error uploading file',
        error: err
      });
    }

    // If no file was uploaded, continue
    if (!req.file) {
      return next();
    }

    try {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
      // Add the Cloudinary URL to the request body
      req.body.imageUrl = result.secure_url;
      next();
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return res.status(500).json({
        message: 'Error uploading to Cloudinary',
        error: error
      });
    }
  });
};

module.exports = {
  cloudinary,
  uploadMiddleware
}; 