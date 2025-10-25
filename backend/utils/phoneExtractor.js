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
  
  // More flexible patterns for better detection
  /\b\d{10,11}\b/g, // 10-11 digit numbers
  /\b[6-9]\d{8,9}\b/g, // 9-10 digit numbers starting with 6-9
  /\b0[6-9]\d{8,9}\b/g, // 10-11 digit numbers starting with 0[6-9]
  
  // Patterns with spaces, dashes, or dots
  /\b\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g, // Formatted numbers
  /\b\d{5}[-.\s]?\d{5}\b/g, // 5-5 format
  /\b\d{4}[-.\s]?\d{3}[-.\s]?\d{3}\b/g, // 4-3-3 format
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
  console.log('🔍 Starting phone number extraction from text:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
  
  const phoneNumbers = new Set();
  
  // First, try to find all sequences of digits that could be phone numbers
  const digitSequences = text.match(/\d{7,15}/g) || [];
  console.log('🔢 Found digit sequences:', digitSequences);
  
  digitSequences.forEach(sequence => {
    console.log(`🔍 Checking sequence: "${sequence}"`);
    // Check if this sequence looks like an Indian phone number
    if (isValidPhoneNumber(sequence)) {
      console.log(`✅ Valid phone number found: "${sequence}"`);
      phoneNumbers.add(sequence);
    } else {
      console.log(`❌ Invalid phone number: "${sequence}"`);
    }
  });
  
  // Then apply regex patterns
  console.log('🔍 Applying regex patterns...');
  PHONE_PATTERNS.forEach((pattern, index) => {
    const matches = text.match(pattern);
    if (matches) {
      console.log(`📞 Pattern ${index + 1} found matches:`, matches);
      matches.forEach(match => {
        const cleaned = cleanPhoneNumber(match);
        console.log(`🔧 Cleaned match: "${match}" -> "${cleaned}"`);
        if (isValidPhoneNumber(cleaned)) {
          console.log(`✅ Valid phone number from pattern: "${cleaned}"`);
          phoneNumbers.add(cleaned);
        } else {
          console.log(`❌ Invalid phone number from pattern: "${cleaned}"`);
        }
      });
    }
  });
  
  console.log('📞 Final phone numbers set:', Array.from(phoneNumbers));
  
  const result = Array.from(phoneNumbers).map(phoneNumber => {
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
    
    const result = {
      original: phoneNumber,
      cleaned: normalizedNumber, // Store normalized 10-digit number
      formatted: formatPhoneNumber(phoneNumber),
      countryCode: '91', // Always India
      isValid: isValidPhoneNumber(phoneNumber)
    };
    
    console.log(`📋 Processed phone number:`, result);
    return result;
  });
  
  console.log('✅ Phone number extraction completed. Found:', result.length, 'numbers');
  return result;
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

// Email validation regex
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Name patterns - common Indian names and general patterns
const NAME_PATTERNS = [
  // Common Indian name patterns
  /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // First Last format
  /\b[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+\b/g, // First Middle Last format
  /\b[A-Z][a-z]+\b/g, // Single name (capitalized)
];

// Extract email addresses from text
const extractEmails = (text) => {
  const emails = text.match(EMAIL_REGEX) || [];
  return emails.map(email => email.toLowerCase().trim());
};

// Extract potential names from text
const extractNames = (text) => {
  const names = new Set();
  
  // Split text into lines for better context
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  lines.forEach(line => {
    // Skip lines that are clearly not names (contain numbers, special chars, etc.)
    if (/\d{3,}/.test(line) || line.includes('@') || line.includes('http') || line.includes('www')) {
      return;
    }
    
    // Apply name patterns
    NAME_PATTERNS.forEach(pattern => {
      const matches = line.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Additional validation for names
          if (isValidName(match)) {
            names.add(match.trim());
          }
        });
      }
    });
  });
  
  return Array.from(names);
};

// Validate if a string looks like a name
const isValidName = (name) => {
  // Must be at least 2 characters
  if (name.length < 2) return false;
  
  // Must contain only letters and spaces
  if (!/^[A-Za-z\s]+$/.test(name)) return false;
  
  // Must start with capital letter
  if (!/^[A-Z]/.test(name)) return false;
  
  // Must not be too long (likely not a name)
  if (name.length > 50) return false;
  
  // Must not be common non-name words
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'phone', 'call', 'contact', 'mobile', 'number', 'email', 'address', 'name', 'mr', 'mrs', 'ms', 'dr', 'prof'];
  const lowerName = name.toLowerCase();
  if (commonWords.includes(lowerName)) return false;
  
  return true;
};

// Find the most likely name associated with a phone number
const findAssociatedName = (phoneNumber, text, phonePosition) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Find the line containing the phone number
  let phoneLineIndex = -1;
  lines.forEach((line, index) => {
    if (line.includes(phoneNumber)) {
      phoneLineIndex = index;
    }
  });
  
  if (phoneLineIndex === -1) return '';
  
  // Look for names in the same line or nearby lines
  const searchLines = lines.slice(Math.max(0, phoneLineIndex - 2), phoneLineIndex + 3);
  const names = extractNames(searchLines.join('\n'));
  
  // Return the first valid name found
  return names.length > 0 ? names[0] : '';
};

// Find the most likely email associated with a phone number
const findAssociatedEmail = (phoneNumber, text) => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Find the line containing the phone number
  let phoneLineIndex = -1;
  lines.forEach((line, index) => {
    if (line.includes(phoneNumber)) {
      phoneLineIndex = index;
    }
  });
  
  if (phoneLineIndex === -1) return '';
  
  // Look for emails in the same line or nearby lines
  const searchLines = lines.slice(Math.max(0, phoneLineIndex - 2), phoneLineIndex + 3);
  const emails = extractEmails(searchLines.join('\n'));
  
  // Return the first email found
  return emails.length > 0 ? emails[0] : '';
};

module.exports = {
  extractPhoneNumbers,
  cleanPhoneNumber,
  formatPhoneNumber,
  extractCountryCode,
  isValidPhoneNumber,
  calculateConfidence,
  extractEmails,
  extractNames,
  findAssociatedName,
  findAssociatedEmail
};
