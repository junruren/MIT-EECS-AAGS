/**
 * MIT EECS AAGS Checker Chrome Extension
 * Content script that runs on who_is_teaching_what pages
 */

// Global variable to store AAGS subjects
let aagsSubjects = new Set();

async function fetchAAGSList() {
    try {
        console.log('Content: Requesting AAGS list from background...');
        
        // Send message to background script to fetch AAGS (bypasses CORS)
        const response = await chrome.runtime.sendMessage({ action: 'fetchAAGS' });
        
        if (response.success) {
            // Populate the global set
            response.subjects.forEach(subject => aagsSubjects.add(subject));
            console.log(`Content: Loaded ${aagsSubjects.size} AAGS subjects`);
            console.log('Sample AAGS subjects:', Array.from(aagsSubjects).slice(0, 10));
        } else {
            console.error('Failed to fetch AAGS list:', response.error);
        }
    } catch (error) {
        console.error('Error fetching AAGS list:', error);
    }
}

function parseSubjectNumber(subjectString) {
    if (!subjectString || !subjectString.trim()) {
        return [];
    }

    subjectString = subjectString.trim();
    
    // Remove subscript content (old numbers in brackets)
    // Example: "6.1220[6.046]" or "6.1220J[6.046]"
    subjectString = subjectString.replace(/\[.*?\]/g, '');

    // Step 1: Extract the new number portion
    let newNumberPart = subjectString.trim();

    // Step 2: Check for slash notation indicating multiple subjects
    if (newNumberPart.includes('/')) {
        return expandMultipleSubjects(newNumberPart);
    } else {
        return [newNumberPart];
    }
}

function expandMultipleSubjects(subjectPart) {
    const parts = subjectPart.split('/');
    if (parts.length === 1) {
        return [subjectPart];
    }

    const base = parts[0].trim();
    const subjects = [base];

    for (let i = 1; i < parts.length; i++) {
        const suffix = parts[i].trim();
        if (suffix) {
            // Replace last char with suffix
            subjects.push(base.slice(0, -1) + suffix);
        }
    }

    return subjects;
}

function checkAAGSSubjects(subjectNumbers) {
    const aagsMatches = subjectNumbers.filter(num => aagsSubjects.has(num));
    return aagsMatches;
}

function addAAGSColumn() {
    const table = document.querySelector('table');
    if (!table) {
        console.error('Could not find table on page');
        return;
    }

    console.log(`Processing table with ${aagsSubjects.size} AAGS subjects loaded`);

    // Add header to first row
    const headerRows = table.querySelectorAll('thead tr');
    if (headerRows.length > 0) {
        const firstHeaderRow = headerRows[0];
        const aagsHeader = document.createElement('th');
        aagsHeader.style.fontWeight = 'bold';
        aagsHeader.style.textAlign = 'center';
        
        // Make AAGS header a hyperlink to the official requirements page
        const aagsLink = document.createElement('a');
        aagsLink.href = 'https://eecsis.mit.edu/degree_requirements.html#AAGS';
        aagsLink.textContent = 'AAGS';
        aagsLink.target = '_blank';
        aagsLink.rel = 'noopener noreferrer';
        //aagsLink.style.color = 'inherit';
        //aagsLink.style.textDecoration = 'none';
        aagsLink.title = 'View official AAGS requirements';
        
        // Add hover effect
        aagsLink.addEventListener('mouseenter', () => {
            aagsLink.style.textDecoration = 'underline';
        });
        aagsLink.addEventListener('mouseleave', () => {
            aagsLink.style.textDecoration = 'none';
        });
        
        aagsHeader.appendChild(aagsLink);
        firstHeaderRow.insertBefore(aagsHeader, firstHeaderRow.firstChild);
        
        // Add hint cell to second header row if it exists
        if (headerRows.length > 1) {
            const secondHeaderRow = headerRows[1];
            const hintCell = document.createElement('td');
            hintCell.style.textAlign = 'center';
            hintCell.style.whiteSpace = 'normal';
            hintCell.style.maxWidth = '8em';  // Use em units for better responsiveness
            hintCell.style.wordBreak = 'break-word';
            
            const hintSpan = document.createElement('span');
            hintSpan.style.fontSize = '80%';
            hintSpan.style.fontStyle = 'italic';
            hintSpan.innerHTML = 'scroll down to see <span style="color: green; font-weight: bold;">eligible subjects</span> identified in green';
            
            hintCell.appendChild(hintSpan);
            secondHeaderRow.insertBefore(hintCell, secondHeaderRow.firstChild);
        }
    }

    // Add data cells
    const rows = table.querySelectorAll('tbody tr');
    console.log(`Found ${rows.length} data rows`);
    
    let processedCount = 0;
    let aagsFoundCount = 0;
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) { // Valid data row
            // Subject column is at index 1 (after Area column at index 0)
            const subjectCell = cells[1];
            
            // Get text content, removing subscript content in brackets
            const subjectHTML = subjectCell.innerHTML;
            let subjectText = subjectCell.textContent.trim();
            
            // Parse subject numbers
            const subjectNumbers = parseSubjectNumber(subjectText);
            console.log(`Row ${processedCount}: "${subjectText}" -> [${subjectNumbers.join(', ')}]`);
            
            // Check which are on AAGS list
            const aagsMatches = checkAAGSSubjects(subjectNumbers);
            if (aagsMatches.length > 0) {
                console.log(`  AAGS match found: [${aagsMatches.join(', ')}]`);
                aagsFoundCount++;
            }

            // Create AAGS cell
            const aagsCell = document.createElement('td');
            aagsCell.style.textAlign = 'center';

            if (aagsMatches.length === 0) {
                // No matches - empty cell
                aagsCell.textContent = '';
            } else if (aagsMatches.length === 1 && subjectNumbers.length === 1) {
                // Single subject match - show checkmark
                aagsCell.innerHTML = '✓';
                aagsCell.style.color = 'green';
                aagsCell.style.fontSize = '18px';
                aagsCell.style.fontWeight = 'bold';
                aagsFoundCount++;
            } else {
                // Multiple subjects or partial matches - show matched subjects
                aagsCell.textContent = aagsMatches.join(', ');
                aagsCell.style.fontSize = '12px';
                aagsCell.style.color = 'green';
                aagsFoundCount++;
            }

            row.insertBefore(aagsCell, row.firstChild);
            processedCount++;
        }
    });
    
    console.log(`Processed ${processedCount} rows, found ${aagsFoundCount} AAGS matches`);
    
    console.log(`Processed ${processedCount} rows, found ${aagsFoundCount} AAGS matches`);
}

// Main execution
async function main() {
    console.log('EECS AAGS Checker: Loading...');

    // Fetch AAGS list
    await fetchAAGSList();

    // Add AAGS column to table
    addAAGSColumn();

    console.log('EECS AAGS Checker: Complete');
}

// Run when page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}