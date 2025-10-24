/**
 * Utility functions for extracting and validating phone numbers from text
 */

// Indian phone number patterns (optimized for Indian numbers only)
const PHONE_PATTERNS = [
  // Indian mobile numbers with +91 country code
  /\+91[-.\s]?[6-9]\d{9}/g, // +91 followed by 10-digit mobile
  /\+91[-.\s]?0[6-9]\d{9}/g, // +91 followed by 0 and 10-digit mobile
  
  // Indian mobile numbers with 0 prefix
  /0[6-9]\d{9}/g, // 0 followed by 10-digit mobile
  
  // Indian mobile numbers without prefix (10 digits starting with 6-9)
  /\b[6-9]\d{9}\b/g, // 10-digit mobile number
  
  // Indian landline numbers (with area codes)
  /0[1-9]\d{9}/g, // 0 followed by area code and 7-digit number
  
  // Generic patterns for Indian numbers
  /\b\d{10}\b/g, // Any 10-digit number
  /\b0\d{9,10}\b/g, // Numbers starting with 0 (10-11 digits)
];

// Clean phone number by removing non-digit characters except +
const cleanPhoneNumber = (phoneNumber) => {
  return phoneNumber.replace(/[^\d+]/g, '');
};

// Format phone number for display (Indian format)
const formatPhoneNumber = (phoneNumber) => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  // Handle +91 format
  if (cleaned.startsWith('+91')) {
    const number = cleaned.substring(3); // Remove +91
    if (number.length === 10) {
      return `+91 ${number.slice(0, 5)} ${number.slice(5)}`; // +91 XXXXX XXXXX
    } else if (number.length === 11 && number.startsWith('0')) {
      const mobileNumber = number.substring(1); // Remove leading 0
      return `+91 ${mobileNumber.slice(0, 5)} ${mobileNumber.slice(5)}`; // +91 XXXXX XXXXX
    }
  }
  
  // Handle 0 prefix format
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    const mobileNumber = cleaned.substring(1); // Remove leading 0
    return `+91 ${mobileNumber.slice(0, 5)} ${mobileNumber.slice(5)}`; // +91 XXXXX XXXXX
  }
  
  // Handle 10-digit format (assume Indian mobile)
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`; // +91 XXXXX XXXXX
  }
  
  // Handle 11-digit format starting with 0
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    const mobileNumber = cleaned.substring(1);
    return `+91 ${mobileNumber.slice(0, 5)} ${mobileNumber.slice(5)}`; // +91 XXXXX XXXXX
  }
  
  // Default format
  return cleaned;
};

// Extract country code from phone number (Indian numbers only)
const extractCountryCode = (phoneNumber) => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  // All Indian numbers get country code 91
  if (cleaned.startsWith('+91')) {
    return '91';
  }
  
  // Indian mobile numbers (10 digits starting with 6-9)
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return '91';
  }
  
  // Indian mobile numbers with 0 prefix (11 digits)
  if (cleaned.length === 11 && cleaned.startsWith('0') && /^0[6-9]/.test(cleaned)) {
    return '91';
  }
  
  // Indian landline numbers with 0 prefix
  if (cleaned.length === 11 && cleaned.startsWith('0') && /^0[1-9]/.test(cleaned)) {
    return '91';
  }
  
  // Default to India for any valid Indian number format
  return '91';
};

// Validate phone number (Indian numbers only)
const isValidPhoneNumber = (phoneNumber) => {
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  // Must contain only digits and optional leading +
  if (!/^\+?\d+$/.test(cleaned)) {
    return false;
  }
  
  // Indian mobile numbers with +91 country code
  if (cleaned.startsWith('+91')) {
    const number = cleaned.substring(3);
    return (number.length === 10 && /^[6-9]/.test(number)) || 
           (number.length === 11 && number.startsWith('0') && /^0[6-9]/.test(number));
  }
  
  // Indian mobile numbers (10 digits starting with 6-9)
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return true;
  }
  
  // Indian mobile numbers with 0 prefix (11 digits)
  if (cleaned.length === 11 && cleaned.startsWith('0') && /^0[6-9]/.test(cleaned)) {
    return true;
  }
  
  // Indian landline numbers with 0 prefix (11 digits)
  if (cleaned.length === 11 && cleaned.startsWith('0') && /^0[1-9]/.test(cleaned)) {
    return true;
  }
  
  return false;
};

// Extract phone numbers from text using multiple patterns
const extractPhoneNumbers = (text) => {
  const phoneNumbers = new Set();
  
  // First, try to find all sequences of digits that could be phone numbers
  const digitSequences = text.match(/\d{7,15}/g) || [];
  
  digitSequences.forEach(sequence => {
    // Check if this sequence looks like an Indian phone number
    if (isValidPhoneNumber(sequence)) {
      phoneNumbers.add(sequence);
    }
  });
  
  // Then apply regex patterns
  PHONE_PATTERNS.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleaned = cleanPhoneNumber(match);
        if (isValidPhoneNumber(cleaned)) {
          phoneNumbers.add(cleaned);
        }
      });
    }
  });
  
  return Array.from(phoneNumbers).map(phoneNumber => {
    const cleaned = cleanPhoneNumber(phoneNumber);
    
    // Normalize to standard format for storage
    let normalizedNumber = cleaned;
    if (cleaned.startsWith('+91')) {
      normalizedNumber = cleaned.substring(3); // Remove +91
      if (normalizedNumber.startsWith('0')) {
        normalizedNumber = normalizedNumber.substring(1); // Remove leading 0
      }
    } else if (cleaned.startsWith('0') && cleaned.length === 11) {
      normalizedNumber = cleaned.substring(1); // Remove leading 0
    }
    
    return {
      original: phoneNumber,
      cleaned: normalizedNumber, // Store normalized 10-digit number
      formatted: formatPhoneNumber(phoneNumber),
      countryCode: '91', // Always India
      isValid: isValidPhoneNumber(phoneNumber)
    };
  });
};

// Calculate confidence score based on pattern matching and context
const calculateConfidence = (phoneNumber, context) => {
  let confidence = 0.5; // Base confidence
  
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  // Length-based confidence
  if (cleaned.length >= 10 && cleaned.length <= 15) {
    confidence += 0.2;
  }
  
  // Format-based confidence
  if (/^\+?\d{10,15}$/.test(cleaned)) {
    confidence += 0.2;
  }
  
  // Context-based confidence
  const contextLower = context.toLowerCase();
  const phoneKeywords = ['phone', 'call', 'contact', 'mobile', 'tel', 'number'];
  if (phoneKeywords.some(keyword => contextLower.includes(keyword))) {
    confidence += 0.1;
  }
  
  return Math.min(confidence, 1.0);
};

module.exports = {
  extractPhoneNumbers,
  cleanPhoneNumber,
  formatPhoneNumber,
  extractCountryCode,
  isValidPhoneNumber,
  calculateConfidence
};
