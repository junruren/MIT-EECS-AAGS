#!/usr/bin/env node

/**
 * Sync version and description from manifest.json to package.json
 * This ensures a single source of truth (manifest.json)
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../chrome-extension/manifest.json');
const packagePath = path.join(__dirname, '../package.json');

try {
  // Read manifest.json
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Update package.json with values from manifest.json
  const updated = {
    ...packageJson,
    version: manifest.version,
    description: manifest.description
  };
  
  // Write updated package.json
  fs.writeFileSync(packagePath, JSON.stringify(updated, null, 2) + '\n');
  
  console.log(`✓ Synced version ${manifest.version} from manifest.json to package.json`);
} catch (error) {
  console.error('✗ Failed to sync version:', error.message);
  process.exit(1);
}
