const { extractContactDataWithProgress } = require('./utils/ocrService');
const path = require('path');

/**
 * Test script to debug extraction issues
 * Usage: node test-extraction.js <image-path>
 */
async function testExtraction() {
  const imagePath = process.argv[2];
  
  if (!imagePath) {
    console.log('❌ Please provide an image path');
    console.log('Usage: node test-extraction.js <image-path>');
    process.exit(1);
  }

  if (!require('fs').existsSync(imagePath)) {
    console.log('❌ Image file not found:', imagePath);
    process.exit(1);
  }

  console.log('🧪 Testing extraction for:', imagePath);
  console.log('=' .repeat(50));

  try {
    const contactData = await extractContactDataWithProgress(imagePath, (progress) => {
      console.log(`📊 Progress: ${progress}%`);
    });

    console.log('=' .repeat(50));
    console.log('📋 Results:');
    console.log('📞 Contacts found:', contactData.length);
    
    if (contactData.length > 0) {
      contactData.forEach((contact, index) => {
        console.log(`\n📋 Contact ${index + 1}:`);
        console.log(`  Phone: ${contact.phoneNumber}`);
        console.log(`  Formatted: ${contact.formattedNumber}`);
        console.log(`  Name: ${contact.name || 'N/A'}`);
        console.log(`  Email: ${contact.email || 'N/A'}`);
        console.log(`  Valid: ${contact.isValid}`);
        console.log(`  Context: ${contact.context}`);
      });
    } else {
      console.log('❌ No contacts extracted');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testExtraction();
