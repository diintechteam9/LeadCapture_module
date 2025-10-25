import Tesseract from 'tesseract.js';

/**
 * OCR Service for extracting text from images using Tesseract.js
 */

// Configure Tesseract.js for better phone number recognition
const OCR_CONFIG = {
  logger: m => {
    if (m.status === 'recognizing text') {
      console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
    }
  },
  // Optimize for phone number detection
  tessedit_char_whitelist: '0123456789+()- .ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  tessedit_pageseg_mode: Tesseract.PSM.AUTO,
};

/**
 * Extract text from an image file using Tesseract.js
 * @param {File} imageFile - The image file to process
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextFromImage = async (imageFile) => {
  try {
    console.log('Starting OCR processing...');
    console.log('Image file:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type);
    
    // Initialize Tesseract
    const worker = await Tesseract.createWorker('eng');
    
    try {
      const { data: { text } } = await worker.recognize(imageFile, OCR_CONFIG);
      
      await worker.terminate();
      
      console.log('OCR completed successfully');
      console.log('Extracted text length:', text ? text.length : 0);
      
      return text || '';
    } catch (workerError) {
      await worker.terminate();
      throw workerError;
    }
  } catch (error) {
    console.error('OCR processing failed:', error);
    console.error('Error details:', error.message, error.stack);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
};

/**
 * Extract text from an image with progress callback
 * @param {File} imageFile - The image file to process
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<string>} - Extracted text
 */
export const extractTextWithProgress = async (imageFile, onProgress) => {
  try {
    console.log('Starting OCR processing with progress tracking...');
    console.log('Image file:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type);
    
    // Initialize Tesseract
    const worker = await Tesseract.createWorker('eng');
    
    try {
      const { data: { text } } = await worker.recognize(imageFile, {
        ...OCR_CONFIG,
        logger: m => {
          if (m.status === 'recognizing text') {
            const progress = Math.round(m.progress * 100);
            console.log(`OCR Progress: ${progress}%`);
            if (onProgress) {
              onProgress(progress);
            }
          }
        }
      });
      
      await worker.terminate();
      
      console.log('OCR completed successfully');
      console.log('Extracted text length:', text ? text.length : 0);
      
      return text || '';
    } catch (workerError) {
      await worker.terminate();
      throw workerError;
    }
  } catch (error) {
    console.error('OCR processing failed:', error);
    console.error('Error details:', error.message, error.stack);
    throw new Error(`Failed to extract text from image: ${error.message}`);
  }
};

/**
 * Preprocess image for better OCR results
 * @param {File} imageFile - The image file to preprocess
 * @returns {Promise<File>} - Preprocessed image file
 */
export const preprocessImage = async (imageFile) => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Set canvas size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply preprocessing (contrast enhancement, noise reduction)
      for (let i = 0; i < data.length; i += 4) {
        // Convert to grayscale
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        
        // Apply contrast enhancement
        const enhanced = gray > 128 ? 255 : 0;
        
        data[i] = enhanced;     // Red
        data[i + 1] = enhanced; // Green
        data[i + 2] = enhanced; // Blue
        // Alpha channel remains unchanged
      }
      
      // Put processed data back
      ctx.putImageData(imageData, 0, 0);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const processedFile = new File([blob], imageFile.name, {
          type: 'image/png'
        });
        resolve(processedFile);
      }, 'image/png');
    };
    
    img.src = URL.createObjectURL(imageFile);
  });
};

export default {
  extractTextFromImage,
  extractTextWithProgress,
  preprocessImage
};
