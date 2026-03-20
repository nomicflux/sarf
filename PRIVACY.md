# Privacy Policy — Sarf

Last updated: 2026-03-19

## What data is collected

Sarf does not collect, store, or transmit any personal information. It does not track browsing history, and it does not use analytics.

## What data is sent externally

Primary morphological analysis runs entirely locally using CAMeL Tools via Pyodide (Python in WebAssembly). No words are sent to any external service for primary analysis.

If local analysis fails, the extension falls back to the [AlKhalil MorphoSys](http://alkhalil.oujda-nlp-team.net/AlKhalil-MorphoSys.php) service (`oujda-nlp-team.net`, operated by [Université Mohammed Premier](https://www.sciencedirect.com/science/article/pii/S131915781630026X), Oujda, Morocco). In this fallback case only, the single hovered word is sent for grammatical analysis. No other text from the page is sent. No cookies, identifiers, or metadata are included in these requests.

## What data is stored locally

- The Pyodide runtime (Python compiled to WebAssembly) and morphology databases for Gulf, MSA, and Egyptian Arabic are bundled with the extension. These run entirely on your device.
- A dictionary database (Hans Wehr and Wiktionary entries) is stored in your browser's IndexedDB on first install. This data is bundled with the extension and never leaves your device.
- Your dictionary display preferences (which sources to show) are stored in `chrome.storage.local` on your device.
- Recent analysis results are cached in memory and discarded when the background script unloads.

## Third-party services

The only external service contacted is [AlKhalil MorphoSys](http://alkhalil.oujda-nlp-team.net/AlKhalil-MorphoSys.php) (`oujda-nlp-team.net`), used as a fallback when local analysis is unavailable. Sarf has no affiliation with this service. Refer to Université Mohammed Premier's policies for how they handle incoming API requests.

## Contact

For questions about this policy, open an issue at the project's GitHub repository.
