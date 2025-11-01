const AAGS_URL = 'https://eecsis.mit.edu/degree_requirements.html';

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
  const response = await fetch(AAGS_URL, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const anchor =
    doc.querySelector('a[name="AAGS"], a[name="aags"]') ??
    doc.querySelector('a[id="AAGS"], a[id="aags"]');

  if (!anchor) {
    throw new Error('AAGS anchor not found in degree requirements page');
  }

  const container =
    anchor.nextElementSibling ??
    anchor.parentElement?.querySelector('div, table') ??
    doc.body;

  const linkElements = container.querySelectorAll('a.annotated-link');
  const subjects = [];

  for (const link of linkElements) {
    collectSubjectsFromLink(link, subjects);
  }

  if (!subjects.length) {
    // As a last resort, scan everything after the anchor
    const treeWalker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
    const fallbackSubjects = new Set();
    let reachedAnchor = false;

    while (treeWalker.nextNode()) {
      const node = treeWalker.currentNode;
      if (node === anchor) {
        reachedAnchor = true;
        continue;
      }

      if (!reachedAnchor) {
        continue;
      }

      if (node instanceof Element && node.matches('a.annotated-link')) {
        collectSubjectsFromLink(node, fallbackSubjects);
      }
    }

    if (!fallbackSubjects.size) {
      throw new Error('No AAGS subjects found in parsed document');
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

  for (const node of link.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      addMatches(node.textContent);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = /** @type {Element} */ (node);
      if (element.classList.contains('annotation')) {
        continue; // Skip the descriptive tooltip content
      }

      if (element.tagName.toLowerCase() === 'old') {
        continue; // Ignore legacy numbers shown in annotations
      }

      addMatches(element.textContent);
    }
  }

  const isCollectionEmpty =
    collection instanceof Set ? collection.size === 0 : collection.length === 0;

  // Some links contain the subject code as their first child only; ensure we capture that
  if (isCollectionEmpty) {
    addMatches(link.textContent);
  }
}
