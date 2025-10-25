const Tesseract = require('tesseract.js');
const fs = require('fs');

/**
 * Extract text from an image file using Tesseract.js
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromImage = async (imagePath) => {
  try {
    console.log('Starting OCR processing for:', imagePath);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file not found');
    }

    // Initialize Tesseract worker
    const worker = await Tesseract.createWorker('eng');
    
    try {
      // Configure OCR for better phone number detection
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789+()- .ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        tessedit_pageseg_mode: '6', // Uniform block of text
      });

      // Perform OCR
      const { data: { text } } = await worker.recognize(imagePath);
      
      // Terminate worker
      await worker.terminate();
      
      console.log('OCR completed successfully. Text length:', text ? text.length : 0);
      
      return text || '';
    } catch (workerError) {
      await worker.terminate();
      throw workerError;
    }
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
};

/**
 * Extract text from image with progress callback
 * @param {string} imagePath - Path to the image file
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string>} - Extracted text
 */
const extractTextWithProgress = async (imagePath, onProgress) => {
  try {
    console.log('Starting OCR processing with progress tracking for:', imagePath);
    
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file not found');
    }

    // Initialize Tesseract worker
    const worker = await Tesseract.createWorker('eng');
    
    try {
      // Configure OCR for better phone number detection
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789+()- .ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        tessedit_pageseg_mode: '6', // Uniform block of text
      });

      // Perform OCR with progress tracking
      const { data: { text } } = await worker.recognize(imagePath, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            console.log(`OCR Progress: ${progress}%`);
            if (onProgress) {
              onProgress(progress);
            }
          }
        }
      });
      
      // Terminate worker
      await worker.terminate();
      
      console.log('OCR completed successfully. Text length:', text ? text.length : 0);
      
      return text || '';
    } catch (workerError) {
      await worker.terminate();
      throw workerError;
    }
  } catch (error) {
    console.error('OCR processing failed:', error);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
};

module.exports = {
  extractTextFromImage,
  extractTextWithProgress
};
