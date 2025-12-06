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
        
        // Also highlight existing "AAGS" text in descriptions (for new subjects not yet in the list)
        highlightExistingAAGSText(document.body);
        
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
                    highlightExistingAAGSText(node);
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

/**
 * Highlight existing "AAGS" text in descriptions
 * Useful for new subjects that mention AAGS eligibility but aren't in the official list yet
 * @param {Element} rootElement - Root element to start from
 */
function highlightExistingAAGSText(rootElement) {
    // Only run on EECS subject updates pages
    if (!window.location.href.includes('eecs.mit.edu/academics/subject-updates')) {
        return;
    }

    const walker = document.createTreeWalker(
        rootElement,
        NodeFilter.SHOW_TEXT,
        {
            acceptNode: function(node) {
                // Skip script, style, and already processed nodes
                const parent = node.parentNode;
                if (!parent) return NodeFilter.FILTER_REJECT;
                
                const tagName = parent.tagName?.toLowerCase();
                if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
                    return NodeFilter.FILTER_REJECT;
                }
                
                // Skip if inside our own AAGS annotations (sup > a)
                if (tagName === 'a' && parent.parentElement?.tagName?.toLowerCase() === 'sup') {
                    return NodeFilter.FILTER_REJECT;
                }
                
                // Skip if text doesn't contain "AAGS"
                if (!node.textContent.includes('AAGS')) {
                    return NodeFilter.FILTER_REJECT;
                }
                
                return NodeFilter.FILTER_ACCEPT;
            }
        }
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        textNodes.push(node);
    }
    
    textNodes.forEach(textNode => {
        const text = textNode.textContent;
        // Match "AAGS" word boundary to avoid partial matches
        const regex = /\bAAGS\b/g;
        
        if (!regex.test(text)) return;
        
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        regex.lastIndex = 0;
        
        let match;
        while ((match = regex.exec(text)) !== null) {
            // Add text before match
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
            }
            
            // Add highlighted AAGS
            const span = document.createElement('span');
            span.textContent = 'AAGS';
            span.style.color = 'green';
            span.style.fontWeight = 'bold';
            fragment.appendChild(span);
            
            lastIndex = regex.lastIndex;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }
        
        textNode.parentNode.replaceChild(fragment, textNode);
    });
}

// Run when page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
