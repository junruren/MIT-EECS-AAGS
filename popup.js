// Popup script for EECS AAGS Checker

document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const refreshBtn = document.getElementById('refresh');

    // Check if we're on a who_is_teaching_what page
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];
        const isValidPage = currentTab.url.includes('eecseduportal.mit.edu/eduportal/who_is_teaching_what');

        if (isValidPage) {
            statusDiv.className = 'status active';
            statusDiv.textContent = 'Active on who_is_teaching_what page';
        } else {
            statusDiv.className = 'status inactive';
            statusDiv.textContent = 'Not on a who_is_teaching_what page';
        }
    });

    // Refresh button
    refreshBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.reload(tabs[0].id);
        });
    });
});