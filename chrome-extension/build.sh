#!/bin/bash

# Build script for MIT EECS AAGS Checker Chrome Extension
# This script creates a production-ready zip file for Chrome Web Store submission

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building MIT EECS AAGS Checker Extension${NC}"
echo "=========================================="

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Read version from manifest.json
VERSION=$(grep -o '"version": "[^"]*' manifest.json | cut -d'"' -f4)
echo -e "${YELLOW}Version: $VERSION${NC}"

# Build directory and output file
BUILD_DIR="build"
OUTPUT_FILE="mit-eecs-aags-checker-v${VERSION}.zip"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf "$BUILD_DIR"
rm -f *.zip

# Create build directory
echo "Creating build directory..."
mkdir -p "$BUILD_DIR"

# Copy necessary files
echo "Copying extension files..."
cp manifest.json "$BUILD_DIR/"
cp background.js "$BUILD_DIR/"
cp content.js "$BUILD_DIR/"
cp offscreen.html "$BUILD_DIR/"
cp offscreen.js "$BUILD_DIR/"
cp popup.html "$BUILD_DIR/"
cp popup.js "$BUILD_DIR/"

# Copy icons
echo "Copying icons..."
cp icon16.png "$BUILD_DIR/"
cp icon48.png "$BUILD_DIR/"
cp icon128.png "$BUILD_DIR/"

# Create zip file
echo "Creating zip archive..."
cd "$BUILD_DIR"
zip -r "../$OUTPUT_FILE" . -x "*.DS_Store" "*.git*"
cd ..

# Clean up build directory
rm -rf "$BUILD_DIR"

# Verify zip was created
if [ -f "$OUTPUT_FILE" ]; then
    SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo -e "${GREEN}✓ Build successful!${NC}"
    echo -e "Output: ${YELLOW}$OUTPUT_FILE${NC} (${SIZE})"
    echo ""
    echo "Next steps:"
    echo "1. Test the extension: Extract and load the zip in Chrome"
    echo "2. Go to: https://chrome.google.com/webstore/devconsole"
    echo "3. Upload $OUTPUT_FILE"
else
    echo -e "${RED}✗ Build failed!${NC}"
    exit 1
fi
