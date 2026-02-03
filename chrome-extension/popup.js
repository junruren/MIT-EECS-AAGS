// Popup script for EECS AAGS Checker

document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const aagsStatusDiv = document.getElementById('aags-status');
    const aagsStatusText = document.getElementById('aags-status-text');
    const refreshBtn = document.getElementById('refresh');

    // Define supported page patterns
    const supportedPages = [
        {
            pattern: 'eecseduportal.mit.edu/eduportal/who_is_teaching_what',
            name: 'Who Is Teaching What table'
        },
        {
            pattern: 'catalog.mit.edu/subjects/',
            name: 'MIT Course Catalog'
        },
        {
            pattern: 'student.mit.edu/catalog/',
            name: 'MIT Student Catalog'
        },
        {
            pattern: 'www.eecs.mit.edu/academics/subject-updates',
            name: 'EECS Subject Updates'
        }
    ];

    // Check if we're on a supported page
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const currentUrl = currentTab.url || '';

        // Find which supported page we're on (if any)
        const matchedPage = supportedPages.find(page => currentUrl.includes(page.pattern));

        if (matchedPage) {
            statusDiv.className = 'status active';
            statusDiv.innerHTML = `<strong>Active</strong><br>On ${matchedPage.name}`;
        } else {
            statusDiv.className = 'status inactive';
            statusDiv.innerHTML = `
                <strong>Not on a supported page</strong><br>
                <br>
                <small>Supported pages:</small><br>
                <small>• Who Is Teaching What table</small><br>
                <small>• MIT Course Catalog (catalog.mit.edu)</small><br>
                <small>• Student Catalog (student.mit.edu)</small><br>
                <small>• EECS Subject Updates</small>
            `;
        }
    });

    // Check AAGS list status
    checkAAGSStatus();

    // Refresh button
    refreshBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.reload(tabs[0].id);
        });
    });
});

async function checkAAGSStatus() {
    const aagsStatusDiv = document.getElementById('aags-status');
    const aagsStatusText = document.getElementById('aags-status-text');
    
    try {
        aagsStatusText.textContent = 'Checking...';
        
        // Request AAGS list from background
        const response = await chrome.runtime.sendMessage({ action: 'fetchAAGS' });
        
        if (response.success) {
            const count = response.subjects?.length || 0;
            aagsStatusDiv.className = 'success';
            aagsStatusText.innerHTML = `<strong>OK:</strong> Loaded ${count} AAGS subjects`;
        } else {
            aagsStatusDiv.className = 'error';
            const errorMsg = typeof response.error === 'string' ? response.error : (response.error?.message || 'Unknown error');
            aagsStatusText.innerHTML = `<strong>Failed:</strong> ${errorMsg}`;
        }
    } catch (error) {
        aagsStatusDiv.className = 'error';
        const errorMsg = error?.message || String(error) || 'Unable to check status';
        aagsStatusText.innerHTML = `<strong>Error:</strong> ${errorMsg}`;
    }
}