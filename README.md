# InstaFile — Instant documents from any selection

InstaFile is a Chrome/Edge (Manifest V3) extension that turns highlighted text into perfectly named downloads in the format you need. It auto-detects code, data and prose, lets you override the target format from the context menu, shortcuts or popup, and ships a label-ready PDF generator for shipping stickers.

## Why InstaFile?
- **Instant capture from anywhere:** Right-click, tap the floating button or press a shortcut to turn the current selection into a file without copying or switching tabs.
- **Auto-detects the right type:** YAML, Python, TypeScript/JavaScript, JSON, CSV, Markdown, HTML, CSS, SQL and more are recognised automatically when Smart Save is used. 【F:service-worker.js†L241-L247】【F:service-worker.js†L591-L629】
- **Consistent naming and folders:** Files default to `InstantFiles/<format>/instant_YYYY-MM-DD_hh-mm.ext` and can switch to first-line or custom patterns. Conflicts are uniquified automatically. 【F:service-worker.js†L249-L344】
- **Label workflow built in:** Convert up to four short lines into an 89×28 mm PDF label with automatic centering and scaling. 【F:service-worker.js†L373-L588】
- **Progress you can see:** Notifications, popup counters and last-file details keep you informed. 【F:service-worker.js†L269-L305】【F:popup.js†L38-L132】

## How it works
- **Service worker (`service-worker.js`):** Boots the extension, registers context menus and keyboard commands, applies format detection, builds filenames/paths, generates blobs (including PDF/label layouts) and triggers downloads while updating stats. 【F:service-worker.js†L1-L340】【F:service-worker.js†L344-L640】
- **Content script (`content.js`):** Injects a floating action button, enforces the minimum selection length and relays selected text to the worker. 【F:content.js†L4-L199】
- **Popup (`popup.html` + `popup.js`):** Displays totals and recent saves, exposes Smart/TXT/MD/PDF/Label actions and links to options/help. 【F:popup.js†L38-L272】
- **Options page (`options.html` + `options.js`):** Persists settings, pings the worker to refresh context menus and lets users reset to defaults. 【F:options.js†L1-L170】
- **Manifest (`manifest.json`):** Declares permissions, commands and entrypoints for Chrome Web Store compliance. 【F:manifest.json†L1-L63】

## Permissions & data use
- **Permissions:** `contextMenus`, `downloads`, `storage`, `notifications`, `scripting`, `activeTab`, `tabs`. Host access is `<all_urls>` so the extension can read the current selection on any page when you invoke it. 【F:manifest.json†L7-L24】
- **Data handling:** Selections are processed locally; no network requests are made. Settings live in `chrome.storage.sync` and stats in `chrome.storage.local` to keep them on-device. 【F:service-worker.js†L35-L77】【F:service-worker.js†L78-L119】
- **User trust:** Notifications are optional and filenames are sanitised to avoid unsafe characters. 【F:service-worker.js†L194-L237】【F:service-worker.js†L312-L344】

## Install for development or review
1. Clone or download this repository.
2. Open Chrome and visit `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and choose this folder.
5. Optional: run a quick smoke load without the extensions page: `google-chrome --disable-extensions-file-access-check --load-extension=$(pwd)`. 【F:AGENTS.md†L11-L15】

## Using InstaFile
1. **Select text** (default minimum: 10 characters). If the selection is shorter, the floating button stays hidden and commands are ignored. 【F:content.js†L44-L97】
2. **Trigger a save:**
   - Right-click → ⚡ **InstantFile** → pick Auto, TXT, MD, YAML, Python, Label, etc. 【F:service-worker.js†L4-L69】【F:service-worker.js†L124-L167】
   - Keyboard: `Ctrl/Cmd+Shift+S` (Smart), `Ctrl/Cmd+Shift+T` (TXT), `Ctrl/Cmd+Shift+M` (MD), `Ctrl/Cmd+Shift+P` (PDF). 【F:manifest.json†L27-L52】
   - Floating button in the page or the popup actions for one-tap saves. 【F:content.js†L83-L199】【F:popup.js†L200-L272】
3. **Review the download:** Files save to your configured folder, with optional per-format subfolders and notifications. Stats update in the popup automatically. 【F:service-worker.js†L201-L272】【F:popup.js†L38-L132】

## Customisation
Open the options page (chrome://extensions → extension details → **Options** or ⚙️ in the popup) to:
- Change folder paths, naming pattern and whether to group by format. 【F:options.js†L1-L59】
- Toggle notifications, sounds, badge counters and format usage tracking. 【F:options.js†L60-L133】
- Control the context menu, floating button, auto-hide behaviour and button position. 【F:options.js†L60-L133】
- Adjust minimum selection length, smart detection and recommended formats. 【F:options.js†L1-L107】
- Restore defaults in one click. 【F:options.js†L134-L170】

## Packaging for the Chrome Web Store
1. Bump the version in `manifest.json` if needed. 【F:manifest.json†L3-L6】
2. Run a clean build of assets if you maintain compiled artifacts (not required for the shipped scripts).
3. Create an upload zip excluding dev/output artefacts:
   ```bash
   zip -r out/instafile.zip . -x 'out/*' '.git/*'
   ```
4. Upload the zip in the Chrome Web Store dashboard, provide screenshots of the popup/options, and paste this README’s feature summary into the listing description.

## QA before submission
- Exercise context menus, keyboard shortcuts, popup buttons and the label flow on `test-instafile.html`. 【F:SMOKE-TESTS.md†L1-L35】
- Validate smart detection with YAML, Python, JSON and Markdown snippets and confirm naming patterns. 【F:TESTING.md†L1-L36】
- Ensure notifications behave as configured and that stats reset when the date changes. 【F:service-worker.js†L274-L304】
- Repackage and install in a fresh profile to confirm permissions prompts and downloads work as expected.

## Technical stack
- **Manifest V3 service worker** for background logic and downloads.
- **Vanilla JavaScript + DOM** for popup, options and content UI—no external bundles or remote assets.
- **Chrome APIs**: context menus, downloads, storage, notifications, scripting, tabs/activeTab. 【F:manifest.json†L7-L24】

## Support & licensing
- Issues and feature requests: open a GitHub issue on the repo homepage. 【F:manifest.json†L61-L62】
- License: MIT. Contributions are welcome—follow the commit/PR guidance in `AGENTS.md`. 【F:AGENTS.md†L26-L33】
