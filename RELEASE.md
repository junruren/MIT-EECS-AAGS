# Release Process

This document explains how to create a new release of the MIT EECS AAGS Checker extension.

## Automated Release Workflow

The repository uses GitHub Actions to automatically build and publish releases when you push a version tag.

## How to Create a Release

### 1. Update Version Number

First, update the version in `chrome-extension/manifest.json`:

```json
{
  "version": "1.0.1",  // Update this
  ...
}
```

### 2. Update CHANGELOG.md

Document your changes in `CHANGELOG.md`:

```markdown
## [1.0.1] - 2025-11-01

### Added
- New feature X
- Improvement Y

### Fixed
- Bug Z
```

### 3. Commit Your Changes

```bash
git add chrome-extension/manifest.json CHANGELOG.md
git commit -m "chore: bump version to 1.0.1"
git push origin main
```

### 4. Create and Push a Tag

```bash
# Create a tag matching the version in manifest.json
git tag v1.0.1

# Push the tag to trigger the GitHub Action
git push origin v1.0.1
```

**Important:** The tag version (e.g., `v1.0.1`) must match the version in `manifest.json` (e.g., `1.0.1`), or the workflow will fail.

### 5. Monitor the Build

1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. You should see a workflow running called "Build and Release"
4. Click on it to see the build progress

### 6. Verify the Release

Once the workflow completes:
1. Go to the "Releases" section of your repository
2. You should see a new release with:
   - Release notes (auto-generated from commits)
   - The built extension zip file attached
   - Installation instructions

## What the Workflow Does

The GitHub Action automatically:

1. ✅ **Extracts version** from the git tag
2. ✅ **Verifies** that `manifest.json` version matches the tag
3. ✅ **Builds** the extension using `build.sh`
4. ✅ **Creates** a GitHub release
5. ✅ **Attaches** the zip file to the release
6. ✅ **Generates** release notes from commits

## Manual Build (Optional)

If you want to build locally without creating a release:

```bash
npm run build
```

This creates the zip file in `chrome-extension/` directory.

## Troubleshooting

### ❌ "Version mismatch" error

**Problem:** The tag version doesn't match `manifest.json` version.

**Solution:** Make sure they match exactly:
- Tag: `v1.0.1`
- manifest.json: `"version": "1.0.1"`

### ❌ "Build output not found" error

**Problem:** The build script failed to create the zip file.

**Solution:** Test the build locally:
```bash
cd chrome-extension
./build.sh
```

### ❌ "Permission denied" error on build.sh

**Problem:** The build script isn't executable.

**Solution:** The workflow automatically runs `chmod +x build.sh`, but if you encounter this locally:
```bash
chmod +x chrome-extension/build.sh
```

## Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version (1.0.0 → 2.0.0): Breaking changes
- **MINOR** version (1.0.0 → 1.1.0): New features, backwards compatible
- **PATCH** version (1.0.0 → 1.0.1): Bug fixes, backwards compatible

## Quick Reference

```bash
# Standard release process
vim chrome-extension/manifest.json  # Update version
vim CHANGELOG.md                     # Document changes
git add chrome-extension/manifest.json CHANGELOG.md
git commit -m "chore: bump version to X.Y.Z"
git push origin main
git tag vX.Y.Z
git push origin vX.Y.Z

# Delete a tag (if you made a mistake)
git tag -d v1.0.1                   # Delete locally
git push origin :refs/tags/v1.0.1   # Delete remotely
```

## Chrome Web Store Submission

After the release is created:

1. Download the zip file from the GitHub release
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Upload the zip file
4. Fill in the store listing details
5. Submit for review

---

**Note:** The first time you push a tag, you may need to ensure GitHub Actions is enabled in your repository settings.
