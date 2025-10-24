import React, { useState, useRef } from 'react';
import { Upload, Camera, FileImage, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { extractTextWithProgress } from '../services/ocrService';
import toast from 'react-hot-toast';

const ScreenshotUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [screenshotId, setScreenshotId] = useState(null);
  const [formData, setFormData] = useState({
    url: '',
    title: ''
  });
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    toast.success('File selected successfully');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const [ocrProgress, setOcrProgress] = useState(0);

  const extractTextFromImage = async (imageFile) => {
    try {
      // Use Tesseract.js for real OCR processing
      const extractedText = await extractTextWithProgress(imageFile, (progress) => {
        setOcrProgress(progress);
      });
      
      return extractedText;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      
      const uploadFormData = new FormData();
      uploadFormData.append('screenshot', uploadedFile);
      uploadFormData.append('url', formData.url);
      uploadFormData.append('title', formData.title);

      const res = await fetch(`${API_BASE_URL}/api/screenshots/upload`, {
        method: 'POST',
        body: uploadFormData,
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to upload screenshot');
      }
      
      const response = await res.json();
      
      toast.success('Screenshot uploaded successfully!');
      setScreenshotId(response.data.id);
      
      // Automatically process the screenshot
      await handleProcessScreenshot(response.data.id);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload screenshot');
    } finally {
      setUploading(false);
    }
  };

  const handleProcessScreenshot = async (id) => {
    if (!uploadedFile) {
      toast.error('No file to process');
      return;
    }

    try {
      setProcessing(true);
      setOcrProgress(0);
      toast.loading('Extracting text from image...', { id: 'processing' });

      // Extract text from the image using Tesseract.js
      const extractedText = await extractTextFromImage(uploadedFile);
      
      toast.success(`Text extracted successfully! (${ocrProgress}%)`, { id: 'processing' });
      toast.loading('Processing phone numbers...', { id: 'phone-processing' });

      // Send extracted text to backend for phone number processing
      const res = await fetch(`${API_BASE_URL}/api/screenshots/${id}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ extractedText }),
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to process screenshot');
      }
      
      const response = await res.json();
      
      toast.success(`Found ${response.data.phoneNumbersFound} phone numbers!`, { id: 'phone-processing' });
      
      // Reset form
      setUploadedFile(null);
      setScreenshotId(null);
      setOcrProgress(0);
      setFormData({ url: '', title: '' });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call the success callback to refresh stats
      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process screenshot', { id: 'processing' });
      toast.error('Failed to process screenshot', { id: 'phone-processing' });
    } finally {
      setProcessing(false);
      setOcrProgress(0);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setScreenshotId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Screenshot</h2>
        <p className="text-gray-600">Upload a screenshot to extract phone numbers from it</p>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading || processing}
        />
        
        {uploadedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <FileImage className="h-12 w-12 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(uploadedFile.size)}</p>
                {screenshotId && (
                  <p className="text-xs text-blue-600">Ready for processing</p>
                )}
              </div>
              <button
                onClick={removeFile}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                disabled={uploading || processing}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-gray-100 rounded-full">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your screenshot here, or{' '}
                <span className="text-blue-600 hover:text-blue-500 cursor-pointer">
                  browse
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports PNG, JPG, JPEG up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Source URL (Optional)
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={uploading || processing}
          />
        </div>
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Page Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Page title or description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={uploading || processing}
          />
        </div>
      </div>

      {/* OCR Progress Indicator */}
      {processing && ocrProgress > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">OCR Processing</span>
            <span className="text-sm text-gray-500">{ocrProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${ocrProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-center">
        <button
          onClick={handleUpload}
          disabled={!uploadedFile || uploading || processing}
          className={`px-8 py-3 rounded-md font-medium flex items-center space-x-2 transition-colors ${
            !uploadedFile || uploading || processing
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Uploading...</span>
            </>
          ) : processing ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              <span>Upload & Process</span>
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Upload a screenshot containing phone numbers</li>
              <li>Our system will automatically extract text from the image</li>
              <li>Phone numbers will be detected and saved to the database</li>
              <li>You can view and export the extracted data</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotUpload;