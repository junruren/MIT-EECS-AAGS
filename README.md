# MIT EECS AAGS Tools

A collection of tools for MIT EECS students to work with subject data and AAGS (Approved Advanced Graduate Subjects) requirements.

## Components

### 1. Python Modules (`eecs.py` & `eecs_course_parser.py`)

Command-line tools for scraping and parsing MIT EECS data.

#### Features
- **Subject Schedule Scraping**: Fetch course schedules from any semester
- **AAGS List Extraction**: Get the complete list of AAGS subjects
- **Subject Number Parsing**: Handle new/old numbering system transitions
- **Multiple Subject Expansion**: Parse complex subject formats like "6.1000/A/B"

#### Usage
```python
from eecs import get_who_is_teaching_what, get_aags
from eecs_course_parser import parse_subject_number

# Get current semester schedule
df, semester = get_who_is_teaching_what()
print(f"Found {len(df)} subjects for {semester}")

# Get AAGS list
aags_subjects = get_aags()
print(f"AAGS subjects: {len(aags_subjects)}")

# Parse complex subject formats
subjects = parse_subject_number("6.1000/A/B[6.0001+2]")
print(subjects)  # ['6.1000', '6.100A', '6.100B']
```

### 2. Chrome Extension (`chrome-extension/`)

Browser extension that automatically enhances who_is_teaching_what pages.

#### Features
- **Automatic AAGS Detection**: Adds AAGS column to any who_is_teaching_what page
- **Smart Subject Matching**: Handles single and multiple subject entries
- **Visual Indicators**: Checkmarks for AAGS subjects, lists for partial matches
- **Real-time Updates**: Fetches latest AAGS data automatically

#### Installation
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `chrome-extension` folder
4. Visit any who_is_teaching_what page to see the AAGS column

#### What It Does
- **Single Subject**: `6.0001` → ✓ (checkmark if on AAGS)
- **Multiple Subjects**: `6.1000/A/B[6.0001+2]` → `6.100A, 6.100B` (only AAGS matches)
- **No Match**: Empty cell

## Subject Number Formats

The tools handle various MIT EECS subject number formats:

### Simple Format
- `6.0001` - Single subject in new numbering
- `6.UAR` - Lettered subject (unchanged)

### Combo Format
- `6.1220J[6.046]` - New number with old number in brackets
- Parsed as: `["6.1220J"]`

### Multiple Subjects
- `6.1000/A/B` - Subject with variants
- Parsed as: `["6.1000", "6.100A", "6.100B"]`

### Complex Format
- `6.1000/A/B[6.0001+2]` - Multiple subjects with old numbering
- Parsed as: `["6.1000", "6.100A", "6.100B"]`

## Development

### Python Modules
- `eecs.py`: Main scraping functionality
- `eecs_course_parser.py`: Subject number parsing logic
- `main.ipynb`: Test notebook

### Chrome Extension
- `manifest.json`: Extension configuration
- `content.js`: Main content script
- `popup.html/js`: Extension popup
- `test.html`: Local test page

## Requirements

### Python
- Python 3.8+
- requests
- beautifulsoup4
- pandas

### Chrome Extension
- Chrome browser
- Developer mode enabled

## License

For educational use by MIT EECS students.