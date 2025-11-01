/**
 * Background service worker for EECS AAGS Checker
 * Handles CORS-restricted fetches from the degree requirements page
 */

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchAAGS') {
        fetchAAGSList()
            .then(subjects => {
                sendResponse({ success: true, subjects: subjects });
            })
            .catch(error => {
                console.error('Error in background fetch:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Keep the message channel open for async response
    }
});

async function fetchAAGSList() {
    try {
        console.log('Background: Fetching AAGS list...');
        const response = await fetch('https://eecsis.mit.edu/degree_requirements.html');
        const html = await response.text();

        // Parse HTML using regex since DOMParser is not available in service workers
        const subjects = [];
        
        // Find the AAGS section - try multiple patterns
        let aagsSection = null;
        
        // Try pattern 1: <a name="AAGS">
        if (html.includes('<a name="AAGS">')) {
            aagsSection = html.split('<a name="AAGS">')[1];
        }
        // Try pattern 2: <a name='AAGS'>
        else if (html.includes("<a name='AAGS'>")) {
            aagsSection = html.split("<a name='AAGS'>")[1];
        }
        // Try pattern 3: name attribute with quotes variations
        else {
            const nameMatch = html.match(/<a[^>]*name\s*=\s*["']AAGS["'][^>]*>/i);
            if (nameMatch) {
                aagsSection = html.substring(html.indexOf(nameMatch[0]) + nameMatch[0].length);
            }
        }
        
        if (!aagsSection) {
            console.error('Background: Could not find AAGS anchor in HTML');
            console.log('Background: HTML preview:', html.substring(0, 500));
            throw new Error('Could not find AAGS section in HTML');
        }
        
        console.log('Background: Found AAGS section, length:', aagsSection.length);
        
        // Extract subject numbers from annotated-link elements
        // The section should end at the next main section or a large closing tag
        const aagsContent = aagsSection.split(/<\/div>\s*<div/)[0];
        
        // Match all subject numbers in annotated-link elements
        // Pattern: <a class="annotated-link" ...>DIGITS.DIGITS
        const linkPattern = /<a[^>]*class\s*=\s*["']annotated-link["'][^>]*>(\d+\.\d+)/gi;
        let match;
        
        while ((match = linkPattern.exec(aagsContent)) !== null) {
            subjects.push(match[1]);
        }

        if (subjects.length === 0) {
            console.warn('Background: No subjects found, trying broader pattern...');
            // Try a broader pattern that just looks for number patterns after annotated-link
            const broaderPattern = /annotated-link[^>]*>(\d+\.\d+)/gi;
            while ((match = broaderPattern.exec(aagsContent)) !== null) {
                subjects.push(match[1]);
            }
        }

        console.log(`Background: Loaded ${subjects.length} AAGS subjects`, subjects.slice(0, 10));
        
        if (subjects.length === 0) {
            console.error('Background: AAGS content preview:', aagsContent.substring(0, 1000));
        }
        
        return subjects;
    } catch (error) {
        console.error('Background: Error fetching AAGS list:', error);
        throw error;
    }
}
