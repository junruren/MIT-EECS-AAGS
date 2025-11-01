# MIT EECS AAGS Checker Chrome Extension

A Chrome extension that automatically highlights AAGS (Approved Advanced Graduate Subjects) on MIT EECS "who is teaching what" pages.

## Features

- **Automatic Detection**: Works on any semester's who_is_teaching_what page
- **AAGS Column**: Adds a new "AAGS" column at the beginning of the table
- **Smart Matching**: Handles both single subjects and multiple subject entries
- **New Numbering System**: Consistently uses new 4-digit subject numbering for matching

## How It Works

1. **Automatic Loading**: When you visit a who_is_teaching_what page, the extension automatically fetches the current AAGS list
2. **Subject Parsing**: Parses subject numbers from the table, handling complex formats like "6.1000/A/B[6.0001+2]"
3. **AAGS Checking**: Compares parsed subject numbers against the AAGS list
4. **Visual Indicators**:
   - ✓ Green checkmark for single subjects on AAGS list
   - Comma-separated list for multiple subjects (showing only AAGS matches)
   - Empty cell for subjects not on AAGS list

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the `chrome-extension` folder
5. The extension should now be installed and active

## Usage

1. Navigate to any MIT EECS who_is_teaching_what page (e.g., https://eecseduportal.mit.edu/eduportal/who_is_teaching_what/)
2. The extension will automatically add an "AAGS" column to the table
3. Look for checkmarks (✓) or subject lists in the first column

## Subject Number Parsing

The extension handles various subject number formats:

- **Simple**: `"6.0001"` → `["6.0001"]`
- **Combo**: `"6.1220J[6.046]"` → `["6.1220J"]` (extracts new number)
- **Multiple**: `"6.1000/A/B[6.0001+2]"` → `["6.1000", "6.100A", "6.100B"]`

For multiple subjects, only those found on the AAGS list are displayed in the AAGS column.

## Development

The extension consists of:

- `manifest.json`: Extension configuration
- `content.js`: Main content script that runs on who_is_teaching_what pages
- `popup.html` & `popup.js`: Extension popup interface
- Icon files: Extension icons

## Permissions

The extension requires:
- `activeTab`: To access the current tab
- `host_permissions`: Access to MIT EECS domains for fetching AAGS data

## Troubleshooting

- **Extension not working**: Make sure you're on a who_is_teaching_what page and try refreshing
- **AAGS data not loading**: Check browser console for error messages
- **Table not modified**: Ensure the page has fully loaded before the extension runs

## License

This project is for educational purposes and MIT EECS students.