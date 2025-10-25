const { cleanupAllUploads, cleanupOldFiles } = require('./utils/fileCleanup');
const path = require('path');

/**
 * Manual cleanup script
 * Usage: 
 *   node manual-cleanup.js all          - Clean all files
 *   node manual-cleanup.js old <days>  - Clean files older than X days
 */
async function manualCleanup() {
  const command = process.argv[2];
  const uploadsDir = path.join(__dirname, 'uploads');

  console.log('🧹 Manual Cleanup Script');
  console.log('=' .repeat(40));

  try {
    if (command === 'all') {
      console.log('🗑️ Cleaning all files in uploads directory...');
      const results = await cleanupAllUploads(uploadsDir);
      
      console.log('📊 Cleanup Results:');
      console.log(`✅ Successfully cleaned: ${results.success.length} files`);
      console.log(`❌ Failed to clean: ${results.failed.length} files`);
      console.log(`📁 Total files: ${results.total}`);
      
      if (results.success.length > 0) {
        console.log('\n✅ Cleaned files:');
        results.success.forEach(file => console.log(`  - ${file}`));
      }
      
      if (results.failed.length > 0) {
        console.log('\n❌ Failed files:');
        results.failed.forEach(file => console.log(`  - ${file}`));
      }

    } else if (command === 'old') {
      const days = parseInt(process.argv[3]) || 7;
      console.log(`🗑️ Cleaning files older than ${days} days...`);
      
      const results = await cleanupOldFiles(uploadsDir, days);
      
      console.log('📊 Cleanup Results:');
      console.log(`✅ Successfully cleaned: ${results.success.length} files`);
      console.log(`❌ Failed to clean: ${results.failed.length} files`);
      console.log(`📁 Total files: ${results.total}`);

    } else {
      console.log('❌ Invalid command');
      console.log('Usage:');
      console.log('  node manual-cleanup.js all          - Clean all files');
      console.log('  node manual-cleanup.js old <days>    - Clean files older than X days');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

manualCleanup();
