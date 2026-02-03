# Plan: Fix EECSIS Website Update Breaking Extension

The AAGS list has moved to a new URL with a completely different HTML structure. The extension currently fails because it looks for an `<a name="AAGS">` anchor and `<a class="annotated-link">` elements that no longer exist on the new page.

## Steps

1. Update [AAGS_URL constant](chrome-extension/offscreen.js#L1) from `degree_requirements.html` to `degree_requirements.pcgi?program=AAGS`

2. Rewrite [parseSubjectsFromHTML function](chrome-extension/offscreen.js#L29-L77) to find the `<h3>AAGS Subject List</h3>` heading and extract subject numbers from plain `<a>` links to `student.mit.edu/catalog/search.cgi`

3. Update deep link URLs in [content-annotator.js](chrome-extension/content-annotator.js#L109) and [content.js](chrome-extension/content.js#L50) to point to the new `.pcgi` URL

4. Test the extension to verify it correctly fetches and parses the ~200+ AAGS subjects from the new page format

## Further Considerations

1. **Backward compatibility**: The old URL might redirect or still work - should we add fallback logic, or is a clean break acceptable? A: no need for backward compatibility since the old URL is defunct.
2. **Future-proofing**: Should we add more robust error handling for the next time EECSIS changes their page structure? A: instead of trying to predict the future EECSIS changes, we should improve logging and monitoring to quickly identify and fix any future breakages. Also display to the extension user when data cannot be fetched or parsed.
