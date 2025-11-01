# Changelog

All notable changes to the MIT EECS AAGS Checker will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Custom icon designs
- Chrome Web Store publication
- Performance optimization with caching
- Support for multiple AAGS requirement categories
- Firefox extension version

## [1.0.0] - 2025-10-31

### Added
- Initial release of Chrome extension
- Automatic AAGS column insertion on who_is_teaching_what pages
- Real-time fetching of AAGS subject list from MIT degree requirements page
- Smart parsing of complex subject numbers (e.g., "6.1000/A/B[6.046]")
- Visual indicators (checkmarks) for AAGS subjects
- Support for all semesters and years
- Background service worker to bypass CORS restrictions
- Regex-based HTML parsing for reliable data extraction
- Comprehensive error handling and debug logging

### Technical
- Chrome Extension Manifest v3
- Message passing architecture between content script and background worker
- Support for multiple subject number formats (new 4-digit and legacy 3-digit)
- Cross-origin fetch with proper permissions

---

## Version History

- **v1.0.0** (2025-10-31) - Initial release

[Unreleased]: https://github.com/junruren/MIT-EECS-AAGS/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/junruren/MIT-EECS-AAGS/releases/tag/v1.0.0
