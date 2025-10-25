const Screenshot = require('../models/Screenshot');
const PhoneNumber = require('../models/PhoneNumber');
const { extractPhoneNumbers, calculateConfidence } = require('../utils/phoneExtractor');
const { generateExcelBuffer } = require('../utils/excelGenerator');
const { cleanupFile, cleanupOldFiles } = require('../utils/fileCleanup');
const { extractTextFromImage } = require('../utils/ocrService');
const path = require('path');
const fs = require('fs');

// Upload screenshot and automatically process with OCR
const uploadScreenshot = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { url, title } = req.body;

    // Create screenshot record
    const screenshot = new Screenshot({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      url: url || '',
      title: title || ''
    });

    await screenshot.save();

    // Automatically process with OCR in the background
    processScreenshotWithOCR(screenshot._id.toString(), req.file.path).catch(err => {
      console.error('Background OCR processing failed:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Screenshot uploaded successfully. OCR processing started.',
      data: {
        id: screenshot._id,
        filename: screenshot.filename,
        url: screenshot.url,
        title: screenshot.title,
        uploadedAt: screenshot.createdAt
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading screenshot',
      error: error.message
    });
  }
};

// Helper function to process screenshot with OCR
const processScreenshotWithOCR = async (screenshotId, imagePath) => {
  try {
    console.log('Starting OCR processing for screenshot:', screenshotId);
    
    // Extract text using OCR
    const extractedText = await extractTextFromImage(imagePath);
    
    console.log('OCR completed. Extracted text length:', extractedText.length);
    
    if (!extractedText || extractedText.trim().length === 0) {
      console.log('No text extracted from image');
      return { phoneNumbersFound: 0 };
    }

    // Extract phone numbers from the text
    const phoneNumbers = extractPhoneNumbers(extractedText);
    
    console.log('Found', phoneNumbers.length, 'potential phone numbers');

    // Find the screenshot
    const screenshot = await Screenshot.findById(screenshotId);
    if (!screenshot) {
      console.error('Screenshot not found:', screenshotId);
      return { phoneNumbersFound: 0 };
    }

    // Save phone numbers to database
    const savedPhoneNumbers = [];
    
    for (const phoneData of phoneNumbers) {
      const confidence = calculateConfidence(phoneData.cleaned, extractedText);
      
      const phoneNumber = new PhoneNumber({
        screenshot: screenshotId,
        phoneNumber: phoneData.cleaned,
        formattedNumber: phoneData.formatted,
        countryCode: phoneData.countryCode,
        confidence: confidence,
        context: extractedText.substring(
          Math.max(0, extractedText.indexOf(phoneData.original) - 50),
          Math.min(extractedText.length, extractedText.indexOf(phoneData.original) + phoneData.original.length + 50)
        ),
        isValid: phoneData.isValid
      });

      const savedPhone = await phoneNumber.save();
      savedPhoneNumbers.push(savedPhone);
    }

    // Update screenshot as processed
    screenshot.processed = true;
    screenshot.phoneNumbers = savedPhoneNumbers.map(p => p._id);
    await screenshot.save();

    console.log('Successfully saved', savedPhoneNumbers.length, 'phone numbers');

    // Clean up the uploaded file after successful processing
    const cleanupSuccess = await cleanupFile(screenshot.filePath, screenshot.filename);
    
    // Update screenshot record to indicate file has been cleaned up
    if (cleanupSuccess) {
      screenshot.fileCleaned = true;
      await screenshot.save();
    }

    return {
      phoneNumbersFound: savedPhoneNumbers.length,
      fileCleaned: cleanupSuccess
    };

  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
};

// Process screenshot for phone number extraction
const processScreenshot = async (req, res) => {
  try {
    const { screenshotId } = req.params;
    const { extractedText } = req.body;

    if (!extractedText) {
      return res.status(400).json({
        success: false,
        message: 'No extracted text provided'
      });
    }

    // Find the screenshot
    const screenshot = await Screenshot.findById(screenshotId);
    if (!screenshot) {
      return res.status(404).json({
        success: false,
        message: 'Screenshot not found'
      });
    }

    // Extract phone numbers from the text
    const phoneNumbers = extractPhoneNumbers(extractedText);
    
    // Save phone numbers to database
    const savedPhoneNumbers = [];
    
    for (const phoneData of phoneNumbers) {
      const confidence = calculateConfidence(phoneData.cleaned, extractedText);
      
      const phoneNumber = new PhoneNumber({
        screenshot: screenshotId,
        phoneNumber: phoneData.cleaned,
        formattedNumber: phoneData.formatted,
        countryCode: phoneData.countryCode,
        confidence: confidence,
        context: extractedText.substring(
          Math.max(0, extractedText.indexOf(phoneData.original) - 50),
          Math.min(extractedText.length, extractedText.indexOf(phoneData.original) + phoneData.original.length + 50)
        ),
        isValid: phoneData.isValid
      });

      const savedPhone = await phoneNumber.save();
      savedPhoneNumbers.push(savedPhone);
    }

    // Update screenshot as processed
    screenshot.processed = true;
    screenshot.phoneNumbers = savedPhoneNumbers.map(p => p._id);
    await screenshot.save();

    // Clean up the uploaded file after successful processing
    const cleanupSuccess = await cleanupFile(screenshot.filePath, screenshot.filename);
    
    // Update screenshot record to indicate file has been cleaned up
    if (cleanupSuccess) {
      screenshot.fileCleaned = true;
      await screenshot.save();
    }

    res.json({
      success: true,
      message: 'Screenshot processed successfully',
      data: {
        screenshotId: screenshot._id,
        phoneNumbersFound: savedPhoneNumbers.length,
        fileCleaned: cleanupSuccess,
        phoneNumbers: savedPhoneNumbers.map(p => ({
          id: p._id,
          phoneNumber: p.phoneNumber,
          formattedNumber: p.formattedNumber,
          confidence: p.confidence,
          isValid: p.isValid
        }))
      }
    });

  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing screenshot',
      error: error.message
    });
  }
};

// Get all screenshots
const getAllScreenshots = async (req, res) => {
  try {
    const { page = 1, limit = 10, processed } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (processed !== undefined) {
      query.processed = processed === 'true';
    }

    const screenshots = await Screenshot.find(query)
      .populate('phoneNumbers')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Screenshot.countDocuments(query);

    res.json({
      success: true,
      data: {
        screenshots,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get screenshots error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching screenshots',
      error: error.message
    });
  }
};

// Get single screenshot
const getScreenshot = async (req, res) => {
  try {
    const { screenshotId } = req.params;

    const screenshot = await Screenshot.findById(screenshotId)
      .populate('phoneNumbers');

    if (!screenshot) {
      return res.status(404).json({
        success: false,
        message: 'Screenshot not found'
      });
    }

    res.json({
      success: true,
      data: screenshot
    });

  } catch (error) {
    console.error('Get screenshot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching screenshot',
      error: error.message
    });
  }
};

// Delete screenshot
const deleteScreenshot = async (req, res) => {
  try {
    const { screenshotId } = req.params;

    const screenshot = await Screenshot.findById(screenshotId);
    if (!screenshot) {
      return res.status(404).json({
        success: false,
        message: 'Screenshot not found'
      });
    }

    // Delete associated phone numbers
    await PhoneNumber.deleteMany({ screenshot: screenshotId });

    // Delete file from filesystem (only if it hasn't been cleaned up already)
    if (!screenshot.fileCleaned && fs.existsSync(screenshot.filePath)) {
      fs.unlinkSync(screenshot.filePath);
      console.log(`🗑️ File deleted: ${screenshot.filename}`);
    } else if (screenshot.fileCleaned) {
      console.log(`ℹ️ File already cleaned up: ${screenshot.filename}`);
    }

    // Delete screenshot record
    await Screenshot.findByIdAndDelete(screenshotId);

    res.json({
      success: true,
      message: 'Screenshot deleted successfully'
    });

  } catch (error) {
    console.error('Delete screenshot error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting screenshot',
      error: error.message
    });
  }
};

// Get screenshot statistics
const getScreenshotStats = async (req, res) => {
  try {
    const totalScreenshots = await Screenshot.countDocuments();
    const processedScreenshots = await Screenshot.countDocuments({ processed: true });
    const totalPhoneNumbers = await PhoneNumber.countDocuments();
    const validPhoneNumbers = await PhoneNumber.countDocuments({ isValid: true });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentScreenshots = await Screenshot.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    const recentPhoneNumbers = await PhoneNumber.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalScreenshots,
        processedScreenshots,
        unprocessedScreenshots: totalScreenshots - processedScreenshots,
        totalPhoneNumbers,
        validPhoneNumbers,
        invalidPhoneNumbers: totalPhoneNumbers - validPhoneNumbers,
        recentActivity: {
          screenshots: recentScreenshots,
          phoneNumbers: recentPhoneNumbers
        }
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// Manual cleanup of old files
const cleanupOldUploads = async (req, res) => {
  try {
    const { olderThanDays = 7 } = req.query;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    const results = await cleanupOldFiles(uploadsDir, parseInt(olderThanDays));
    
    res.json({
      success: true,
      message: 'Cleanup completed',
      data: {
        ...results,
        olderThanDays: parseInt(olderThanDays)
      }
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during cleanup',
      error: error.message
    });
  }
};

module.exports = {
  uploadScreenshot,
  processScreenshot,
  processScreenshotWithOCR,
  getAllScreenshots,
  getScreenshot,
  deleteScreenshot,
  getScreenshotStats,
  cleanupOldUploads
};
