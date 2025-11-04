/**
 * Common utilities for AAGS checking across all content scripts
 * Shared by who_is_teaching_what page and catalog annotation scripts
 */

// AAGS subjects cache
let aagsSubjectsCache = null;

/**
 * Fetch the AAGS list from background script
 * @returns {Promise<Set<string>>} Set of AAGS subject numbers
 */
async function fetchAAGSList() {
    if (aagsSubjectsCache) {
        console.log('AAGS: Using cached list');
        return aagsSubjectsCache;
    }

    try {
        console.log('AAGS: Requesting list from background...');
        const response = await chrome.runtime.sendMessage({ action: 'fetchAAGS' });
        
        if (response.success) {
            aagsSubjectsCache = new Set(response.subjects);
            console.log(`AAGS: Loaded ${aagsSubjectsCache.size} subjects`);
            return aagsSubjectsCache;
        } else {
            console.error('AAGS: Failed to fetch list:', response.error);
            return new Set();
        }
    } catch (error) {
        console.error('AAGS: Error fetching list:', error);
        return new Set();
    }
}

/**
 * Parse subject number from a string
 * Handles formats like "6.1220[6.046]" or "6.1000/A/B"
 * @param {string} subjectString - The subject string to parse
 * @returns {string[]} Array of subject numbers
 */
function parseSubjectNumber(subjectString) {
    if (!subjectString || !subjectString.trim()) {
        return [];
    }

    subjectString = subjectString.trim();
    
    // Remove subscript content (old numbers in brackets)
    subjectString = subjectString.replace(/\[.*?\]/g, '');

    let newNumberPart = subjectString.trim();

    // Check for slash notation indicating multiple subjects
    if (newNumberPart.includes('/')) {
        return expandMultipleSubjects(newNumberPart);
    } else {
        return [newNumberPart];
    }
}

/**
 * Expand subject numbers with slash notation
 * Example: "6.1000/A/B" -> ["6.1000", "6.100A", "6.100B"]
 */
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
            subjects.push(base.slice(0, -1) + suffix);
        }
    }

    return subjects;
}

/**
 * Check if a subject number is on the AAGS list
 * @param {string} subjectNumber - Single subject number to check
 * @param {Set<string>} aagsSet - Set of AAGS subjects
 * @returns {boolean} True if subject is on AAGS list
 */
function isAAGSSubject(subjectNumber, aagsSet) {
    return aagsSet.has(subjectNumber);
}

/**
 * Create an AAGS superscript annotation element
 * @returns {HTMLElement} Superscript element with link
 */
function createAAGSSuperscript() {
    const sup = document.createElement('sup');
    sup.style.fontSize = '0.7em';
    sup.style.marginLeft = '0.2em';
    
    const link = document.createElement('a');
    link.href = 'https://eecsis.mit.edu/degree_requirements.html#AAGS';
    link.textContent = 'AAGS';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.color = 'green';
    link.style.fontWeight = 'bold';
    link.style.textDecoration = 'none';
    link.title = 'This subject satisfies AAGS requirements';
    
    // Add hover effect
    link.addEventListener('mouseenter', () => {
        link.style.textDecoration = 'underline';
    });
    link.addEventListener('mouseleave', () => {
        link.style.textDecoration = 'none';
    });
    
    sup.appendChild(link);
    return sup;
}

/**
 * Regular expression to match MIT subject numbers
 * Matches formats like:
 * - 6.1220 (standard)
 * - 6.100A (with letter suffix)
 * - 6.S890 (special subjects with letter prefix)
 * - 6.UAR, 6.UAT (undergraduate research/thesis)
 */
const SUBJECT_NUMBER_REGEX = /\b(\d+\.[A-Z]?\d+[A-Z]*|\d+\.UAR|\d+\.UAT)\b/gi;

/**
 * Find and annotate AAGS subjects in a text node
 * @param {Text} textNode - DOM text node to process
 * @param {Set<string>} aagsSet - Set of AAGS subjects
 */
function annotateTextNode(textNode, aagsSet) {
    const text = textNode.textContent;
    const matches = [];
    let match;
    
    // Find all subject numbers in the text
    SUBJECT_NUMBER_REGEX.lastIndex = 0;
    while ((match = SUBJECT_NUMBER_REGEX.exec(text)) !== null) {
        const subjectNum = match[0];
        const parsedSubjects = parseSubjectNumber(subjectNum);
        
        // Check if any of the parsed subjects are AAGS
        if (parsedSubjects.some(s => isAAGSSubject(s, aagsSet))) {
            matches.push({
                text: subjectNum,
                start: match.index,
                end: match.index + subjectNum.length
            });
        }
    }
    
    // If no matches, nothing to do
    if (matches.length === 0) {
        return;
    }
    
    // Replace text node with annotated version
    const parent = textNode.parentNode;
    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    
    matches.forEach(match => {
        // Add text before the match
        if (match.start > lastIndex) {
            fragment.appendChild(
                document.createTextNode(text.substring(lastIndex, match.start))
            );
        }
        
        // Add the subject number
        fragment.appendChild(document.createTextNode(match.text));
        
        // Add AAGS superscript
        fragment.appendChild(createAAGSSuperscript());
        
        lastIndex = match.end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
    }
    
    parent.replaceChild(fragment, textNode);
}

/**
 * Walk through DOM and annotate all AAGS subjects
 * @param {Element} rootElement - Root element to start from
 * @param {Set<string>} aagsSet - Set of AAGS subjects
 */
function annotateAAGSInElement(rootElement, aagsSet) {
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
                
                // Skip if text doesn't contain digits (optimization)
                if (!/\d/.test(node.textContent)) {
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
    
    // Process nodes (collect first to avoid iterator issues)
    textNodes.forEach(textNode => {
        annotateTextNode(textNode, aagsSet);
    });
}

// Export for use in content scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchAAGSList,
        parseSubjectNumber,
        isAAGSSubject,
        createAAGSSuperscript,
        annotateAAGSInElement,
        annotateTextNode
    };
}
