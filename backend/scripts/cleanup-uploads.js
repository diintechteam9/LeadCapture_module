#!/usr/bin/env node

/**
 * Cleanup script for uploads directory
 * Usage: node cleanup-uploads.js [--all] [--older-than=7]
 */

const path = require('path');
const { cleanupOldFiles, cleanupAllUploads } = require('../utils/fileCleanup');

async function main() {
  const args = process.argv.slice(2);
  const uploadsDir = path.join(__dirname, '../uploads');
  
  console.log('🧹 Starting uploads cleanup...');
  console.log('📁 Uploads directory:', uploadsDir);
  
  try {
    let results;
    
    if (args.includes('--all')) {
      console.log('🗑️ Cleaning up ALL files in uploads directory...');
      results = await cleanupAllUploads(uploadsDir);
    } else {
      const olderThanDays = args.find(arg => arg.startsWith('--older-than='))?.split('=')[1] || '7';
      console.log(`🗑️ Cleaning up files older than ${olderThanDays} days...`);
      results = await cleanupOldFiles(uploadsDir, parseInt(olderThanDays));
    }
    
    console.log('\n📊 Cleanup Results:');
    console.log(`✅ Successfully cleaned: ${results.success.length} files`);
    console.log(`❌ Failed to clean: ${results.failed.length} files`);
    console.log(`📁 Total processed: ${results.total} files`);
    
    if (results.success.length > 0) {
      console.log('\n✅ Successfully cleaned files:');
      results.success.forEach(filename => console.log(`  - ${filename}`));
    }
    
    if (results.failed.length > 0) {
      console.log('\n❌ Failed to clean files:');
      results.failed.forEach(filename => console.log(`  - ${filename}`));
    }
    
    console.log('\n🎉 Cleanup completed!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Show usage if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🧹 Uploads Cleanup Script

Usage:
  node cleanup-uploads.js [options]

Options:
  --all                    Clean up ALL files in uploads directory
  --older-than=DAYS        Clean up files older than specified days (default: 7)
  --help, -h               Show this help message

Examples:
  node cleanup-uploads.js                    # Clean files older than 7 days
  node cleanup-uploads.js --older-than=3     # Clean files older than 3 days
  node cleanup-uploads.js --all              # Clean ALL files
  `);
  process.exit(0);
}

main();

