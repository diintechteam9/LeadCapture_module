import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcManifest = path.join(__dirname, '../manifest.json');
const distManifest = path.join(__dirname, '../dist/manifest.json');

try {
  // Check if manifest.json exists in the root
  if (fs.existsSync(srcManifest)) {
    // Copy manifest.json to dist folder
    fs.copyFileSync(srcManifest, distManifest);
    console.log('✓ manifest.json copied to dist folder');
  } else {
    console.error('✗ manifest.json not found in root directory');
    process.exit(1);
  }
  
  // Also copy the vite.svg icon if it exists in public
  const publicIcon = path.join(__dirname, '../public/vite.svg');
  const distIcon = path.join(__dirname, '../dist/vite.svg');
  
  if (fs.existsSync(publicIcon)) {
    fs.copyFileSync(publicIcon, distIcon);
    console.log('✓ vite.svg copied to dist folder');
  }
} catch (error) {
  console.error('Error copying files:', error);
  process.exit(1);
}
