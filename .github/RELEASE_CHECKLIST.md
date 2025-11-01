# Release Checklist

Use this checklist when preparing a new release.

## Pre-Release

- [ ] All tests passing locally
- [ ] Extension tested in Chrome with latest changes
- [ ] CHANGELOG.md updated with all changes
- [ ] Version number updated in `chrome-extension/manifest.json`
- [ ] Version follows [semantic versioning](https://semver.org/)
- [ ] All changes committed and pushed to main branch

## Version Numbers

Current version in manifest.json: `_____`

New version: `_____`

Reason for version bump:
- [ ] Major (breaking changes)
- [ ] Minor (new features, backwards compatible)
- [ ] Patch (bug fixes, backwards compatible)

## Changes in This Release

### Added
- 

### Changed
- 

### Fixed
- 

### Removed
- 

## Release Steps

```bash
# 1. Update manifest.json version
vim chrome-extension/manifest.json

# 2. Update CHANGELOG.md
vim CHANGELOG.md

# 3. Commit changes
git add chrome-extension/manifest.json CHANGELOG.md
git commit -m "chore: bump version to X.Y.Z"

# 4. Push to main
git push origin main

# 5. Create and push tag
git tag vX.Y.Z
git push origin vX.Y.Z

# 6. Monitor GitHub Actions
# Go to: https://github.com/junruren/MIT-EECS-AAGS/actions
```

## Post-Release

- [ ] GitHub Action completed successfully
- [ ] Release created on GitHub with zip file attached
- [ ] Download and test the release zip file
- [ ] Release notes look correct
- [ ] Consider updating Chrome Web Store (if published)

## Notes

Additional notes or considerations for this release:
