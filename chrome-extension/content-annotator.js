/**
 * Content script for MIT catalog pages
 * Annotates AAGS subjects with superscript links
 * Runs on: catalog.mit.edu/subjects/*, student.mit.edu/catalog/*, eecs.mit.edu/academics/subject-updates*
 */

console.log('AAGS Annotator: Initializing...');

// Main execution
async function main() {
    try {
        console.log('AAGS Annotator: Loading AAGS list...');
        
        // Fetch AAGS list
        const aagsSet = await fetchAAGSList();
        
        if (aagsSet.size === 0) {
            console.warn('AAGS Annotator: No AAGS subjects loaded, skipping annotation');
            return;
        }
        
        console.log(`AAGS Annotator: Annotating page with ${aagsSet.size} AAGS subjects...`);
        
        // Annotate the entire page
        annotateAAGSInElement(document.body, aagsSet);
        
        console.log('AAGS Annotator: Complete');
        
        // Watch for dynamic content changes (optional, for SPA-like pages)
        observeDynamicContent(aagsSet);
        
    } catch (error) {
        console.error('AAGS Annotator: Error:', error);
    }
}

/**
 * Observe DOM changes and annotate new content
 * @param {Set<string>} aagsSet - Set of AAGS subjects
 */
function observeDynamicContent(aagsSet) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Annotate newly added elements
                    annotateAAGSInElement(node, aagsSet);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    console.log('AAGS Annotator: Watching for dynamic content');
}

// Run when page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
