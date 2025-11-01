/**
 * Background service worker for EECS AAGS Checker
 * Handles CORS-restricted fetches from the degree requirements page
 */

const OFFSCREEN_DOCUMENT_PATH = 'offscreen.html';
const OFFSCREEN_FETCH_ACTION = 'offscreenFetchAAGS';

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
    console.log('Background: Fetching AAGS list via offscreen document...');

    await ensureOffscreenDocument();

    try {
        const response = await requestFromOffscreen();

        if (!response?.success) {
            throw new Error(response?.error || 'Unknown error from offscreen parser');
        }

        console.log(`Background: Loaded ${response.subjects.length} AAGS subjects`, response.subjects.slice(0, 10));
        return response.subjects;
    } finally {
        await closeOffscreenDocument();
    }
}

async function ensureOffscreenDocument() {
    if (!chrome.offscreen?.createDocument) {
        throw new Error('Offscreen documents are not supported in this environment');
    }

    if (chrome.offscreen.hasDocument) {
        const hasDoc = await chrome.offscreen.hasDocument();
        if (hasDoc) {
            return;
        }
    }

    await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: ['DOM_PARSER'],
        justification: 'Parse MIT EECS degree requirements HTML with DOM APIs'
    });
}

async function closeOffscreenDocument() {
    if (!chrome.offscreen?.closeDocument) {
        return;
    }

    try {
        const hasDoc = chrome.offscreen.hasDocument ? await chrome.offscreen.hasDocument() : true;
        if (hasDoc) {
            await chrome.offscreen.closeDocument();
        }
    } catch (error) {
        console.warn('Background: Failed to close offscreen document', error);
    }
}

async function requestFromOffscreen(retries = 5) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await sendMessageToOffscreen({ action: OFFSCREEN_FETCH_ACTION });
        } catch (error) {
            const isMissingListener =
                error?.message?.includes('Receiving end does not exist') ||
                error?.message?.includes('Could not establish connection');

            if (isMissingListener && attempt < retries - 1) {
                await delay(100 * (attempt + 1));
                continue;
            }

            throw error instanceof Error ? error : new Error(String(error));
        }
    }

    throw new Error('Failed to communicate with offscreen document');
}

function sendMessageToOffscreen(payload) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(payload, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }

            resolve(response);
        });
    });
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
