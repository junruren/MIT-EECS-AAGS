const AAGS_URL = 'https://eecsis.mit.edu/degree_requirements.pcgi?program=AAGS';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.action !== 'offscreenFetchAAGS') {
    return false;
  }

  fetchAndParseAAGS()
    .then((subjects) => sendResponse({ success: true, subjects }))
    .catch((error) => {
      console.error('[Offscreen] Failed to fetch AAGS list:', error);
      sendResponse({ success: false, error: error.message ?? String(error) });
    });

  return true; // Keep the channel open for the async response
});

async function fetchAndParseAAGS() {
  let response;
  try {
    response = await fetch(AAGS_URL, { credentials: 'include' });
  } catch (error) {
    throw new Error(`Network error fetching AAGS list: ${error.message || 'Unable to connect to eecsis.mit.edu'}`);
  }

  if (!response.ok) {
    throw new Error(`AAGS list fetch failed with HTTP status ${response.status}. The MIT EECS degree requirements page may be unavailable.`);
  }

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const heading = doc.querySelector('h3');
  
  if (!heading || !heading.textContent.includes('AAGS')) {
    throw new Error('AAGS heading not found. The degree requirements page format may have changed.');
  }

  const container = doc.body;

  const linkElements = container.querySelectorAll('a.annotated-link');
  const subjects = [];

  for (const link of linkElements) {
    collectSubjectsFromLink(link, subjects);
  }

  if (!subjects.length) {
    // Fallback: scan all annotated-link elements in the document
    const allLinks = doc.querySelectorAll('a.annotated-link');
    const fallbackSubjects = new Set();

    for (const link of allLinks) {
      collectSubjectsFromLink(link, fallbackSubjects);
    }

    if (!fallbackSubjects.size) {
      throw new Error('No AAGS subjects found. The degree requirements page format may have changed. Please report this issue.');
    }

    return Array.from(fallbackSubjects);
  }

  return Array.from(new Set(subjects));
}

const SUBJECT_REGEX = /\b\d+(?:\.[0-9A-Z]+)+\b/g;

function collectSubjectsFromLink(link, collection) {
  const addMatches = (text) => {
    if (!text) return;
    const matches = text.match(SUBJECT_REGEX);
    if (!matches) return;
    for (const match of matches) {
      collection instanceof Set ? collection.add(match) : collection.push(match);
    }
  };

  const processElement = (element) => {
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        addMatches(node.textContent);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = /** @type {Element} */ (node);
        // Skip elements that contain old/hidden content
        if (el.classList.contains('annotation') || el.classList.contains('old') || el.tagName.toLowerCase() === 'old') {
          continue;
        }
        // Recursively process child elements instead of using textContent
        processElement(el);
      }
    }
  };

  processElement(link);

  const isCollectionEmpty =
    collection instanceof Set ? collection.size === 0 : collection.length === 0;

  // Fallback: if nothing found and collection is empty, try extracting from textContent
  // (only as last resort for simpler structures)
  if (isCollectionEmpty) {
    // Create a temporary element and process only visible text nodes
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = link.innerHTML.replace(/<span[^>]*class="[^"]*old[^"]*"[^>]*>.*?<\/span>/g, '');
    addMatches(tempDiv.textContent);
  }
}
