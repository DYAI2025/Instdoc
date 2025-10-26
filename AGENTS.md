# Repository Guidelines

## Project Structure & Module Organization
- `manifest.json` defines metadata, permissions, and service worker entrypoints; update it first for new background features.
- `service-worker.js` owns downloads, context menus, keyboard shortcuts, and stats—route new automation and background logic here.
- `content.js` manages selection detection, floating controls, and smart type detection injected into active tabs.
- Popup UI lives in `popup.html`, `popup.css`, and `popup.js`; synced preferences live in `options.html` and `options.js`.
- Legacy experiments reside in `background.js` and `create-icons.html`; treat them as reference only.
- `test-instafile.html` is the manual regression fixture for selection parsing and notification flows.

## Build, Test, and Development Commands
- `google-chrome --disable-extensions-file-access-check --load-extension=$(pwd)` performs a quick smoke test without opening chrome://extensions.
- `zip -r out/instafile.zip . -x 'out/*' '.git/*'` packages the extension for Web Store upload.
- `python3 -m http.server 8080` serves fixtures such as `test-instafile.html` locally for manual checks.

## Coding Style & Naming Conventions
- Use 2-space indentation, trailing semicolons, and `const` or `let` in JavaScript files.
- Favor template literals for string composition; prefer single quotes elsewhere.
- Keep functions camelCase, DOM classes kebab-case, and default download paths under `InstantFiles/`.

## Testing Guidelines
- No automated suite exists; exercise save flows via context menu, keyboard shortcut, and popup actions after each change.
- Validate smart type detection using YAML, Python, JSON, and Markdown snippets from `test-instafile.html`.
- When packaging, install the generated zip in a clean profile to confirm permissions prompts and downloads.

## Commit & Pull Request Guidelines
- Commit subjects use imperative mood (`Add smart type detector`) with optional 72-character wrapped body and `Refs: #123` when applicable.
- Pull requests must describe user-visible changes, list manual test coverage, and attach screenshots or gifs for popup or UI updates.
- Request review before merging and avoid force pushes once review begins; never commit real tokens or downloaded artifacts.

## Security & Configuration Tips
- Document any new permissions inside `manifest.json` and justify them in the PR.
- Audit storage keys to prevent collisions, and keep sensitive data out of source control.
