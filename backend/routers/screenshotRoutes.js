const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadScreenshot,
  processScreenshot,
  getAllScreenshots,
  getScreenshot,
  deleteScreenshot,
  getScreenshotStats,
} = require('../controllers/screenshotController');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'screenshot-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes
router.post('/upload', upload.single('screenshot'), uploadScreenshot);
router.post('/:screenshotId/process', processScreenshot);
router.get('/', getAllScreenshots);
router.get('/stats', getScreenshotStats);
router.get('/:screenshotId', getScreenshot);
router.delete('/:screenshotId', deleteScreenshot);

module.exports = router;
