/**
 * MIT EECS AAGS Checker Chrome Extension
 * Content script that runs on who_is_teaching_what pages
 * Uses shared functions from aags-common.js
 */

// Global variable to store AAGS subjects (for this script)
let aagsSubjects = new Set();

// Note: fetchAAGSList() and parseSubjectNumber() are now provided by aags-common.js

async function fetchAAGSListForTable() {
    const result = await fetchAAGSList();
    if (!result.success) {
        showErrorBanner(`Failed to load AAGS list: ${result.error}`);
        console.error('Content: Failed to fetch AAGS list:', result.error);
        aagsSubjects = new Set();
        return;
    }
    aagsSubjects = result.subjects;
    console.log(`Content: Loaded ${aagsSubjects.size} AAGS subjects`);
    console.log('Sample AAGS subjects:', Array.from(aagsSubjects).slice(0, 10));
}

function showErrorBanner(message) {
    // Create error banner at the top of the page
    const banner = document.createElement('div');
    banner.id = 'aags-error-banner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background-color: #f8d7da;
        color: #721c24;
        border-bottom: 2px solid #f5c6cb;
        padding: 12px 20px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    `;
    
    banner.innerHTML = `
        <strong>WARNING - EECS AAGS Checker Extension:</strong> ${message}
        <span style="margin-left: 10px; color: #666; font-size: 12px;">This may be due to changes in the MIT EECS website.</span>
        <button id="aags-dismiss-banner" style="
            float: right;
            background: transparent;
            border: 1px solid #721c24;
            color: #721c24;
            padding: 4px 12px;
            cursor: pointer;
            border-radius: 3px;
            font-size: 12px;
        ">Dismiss</button>
    `;
    
    document.body.insertBefore(banner, document.body.firstChild);
    
    // Add dismiss functionality
    document.getElementById('aags-dismiss-banner')?.addEventListener('click', () => {
        banner.remove();
    });
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        if (banner.parentNode) {
            banner.remove();
        }
    }, 10000);
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
        aagsLink.href = 'https://eecsis.mit.edu/degree_requirements.pcgi?program=AAGS';
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
    await fetchAAGSListForTable();

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