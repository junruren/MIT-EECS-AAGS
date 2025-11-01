# Contributing to MIT EECS AAGS Checker

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

This project aims to be welcoming and inclusive. Please:
- Be respectful and constructive
- Focus on what's best for the community
- Show empathy towards other contributors

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Browser version** and OS
- **Extension version**

### Suggesting Features

Feature suggestions are welcome! Please:
- Check if the feature has already been suggested
- Provide a clear use case
- Explain why this would be useful to MIT EECS students

### Code Contributions

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Development Setup

### Chrome Extension Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/junruren/MIT-EECS-AAGS.git
   cd MIT-EECS-AAGS-Classes
   ```

2. **Load the extension in Chrome**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

3. **Make changes**
   - Edit files in `chrome-extension/`
   - Click the refresh icon in `chrome://extensions/` to reload
   - Test on actual MIT EECS pages

### Python Tools Development (Optional)

1. **Set up Python environment**
   ```bash
   cd python-tools
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Run the tools**
   ```bash
   python eecs.py
   ```

## Testing

### Chrome Extension Testing Checklist

Before submitting a PR, verify:

- [ ] Extension loads without errors in `chrome://extensions/`
- [ ] Works on current semester's who_is_teaching_what page
- [ ] Works on previous semesters
- [ ] AAGS column appears at the beginning of the table
- [ ] Checkmarks appear for known AAGS subjects (e.g., 6.8300)
- [ ] Multi-subject entries are parsed correctly (e.g., "6.1000/A/B")
- [ ] Console shows no errors
- [ ] Background worker fetches AAGS data successfully
- [ ] No CORS errors
- [ ] Popup (if modified) displays correctly

### Python Tools Testing Checklist

- [ ] All functions have docstrings
- [ ] Type hints are used
- [ ] Code follows PEP 8 style
- [ ] No hardcoded URLs or credentials
- [ ] Error handling for network requests

## Pull Request Process

1. **Update documentation**
   - Update README.md if adding features
   - Update CHANGELOG.md with your changes
   - Add comments to complex code

2. **Commit message format**
   ```
   type: brief description

   Longer description if needed

   Fixes #123
   ```

   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

   Examples:
   - `feat: add caching for AAGS data`
   - `fix: handle subjects with special characters`
   - `docs: update installation instructions`

3. **PR description should include**
   - What changes were made and why
   - How to test the changes
   - Screenshots (if UI changes)
   - Related issue numbers

4. **Review process**
   - Maintainers will review your PR
   - Address any feedback
   - Once approved, your PR will be merged

## Style Guidelines

### JavaScript (Chrome Extension)

- Use ES6+ features (arrow functions, const/let, template literals)
- Use meaningful variable names
- Add comments for complex logic
- Keep functions focused and small
- Use async/await for asynchronous operations

```javascript
// Good
async function fetchAAGSList() {
  try {
    const response = await fetch(AAGS_URL);
    const html = await response.text();
    return parseAAGSFromHTML(html);
  } catch (error) {
    console.error('Failed to fetch AAGS:', error);
    return [];
  }
}

// Avoid
function getStuff() {
  // unclear name and no error handling
  return fetch(url).then(r => r.text());
}
```

### Python

- Follow PEP 8
- Use type hints
- Write docstrings for functions and classes
- Use descriptive variable names

```python
def parse_subject_number(subject_str: str) -> List[str]:
    """
    Parse a subject number string into its components.
    
    Args:
        subject_str: Subject string like "6.1000/A/B[6.046]"
    
    Returns:
        List of individual subject numbers
    """
    # Implementation
    pass
```

### HTML/CSS

- Use semantic HTML
- Keep styles minimal and focused
- Ensure accessibility (ARIA labels where needed)

## Release Process

Releases are automated via GitHub Actions. See [RELEASE.md](RELEASE.md) for details.

As a contributor, you typically don't need to worry about releases - maintainers handle this.

## Questions?

Feel free to:
- Open an issue for questions
- Check existing documentation in the repo
- Reach out to maintainers

---

Thank you for contributing to help MIT EECS students! 🎓
