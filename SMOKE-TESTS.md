# Smoke Test Checklist

This document provides a comprehensive smoke testing checklist for the FlashDoc Chrome extension to ensure production readiness.

## ✅ Pre-Installation Tests

### Package Integrity
- [ ] All required files present (manifest.json, service-worker.js, content.js, popup.html, options.html, icons)
- [ ] All icon files exist and are valid PNG images (icon16.png, icon48.png, icon128.png)
- [ ] manifest.json is valid JSON
- [ ] No syntax errors in JavaScript files

**Test Command:**
```bash
npm run test
```
**Expected:** All installation tests pass (31/31)

---

## ✅ Installation Tests

### Chrome Extension Installation
1. [ ] Open Chrome and navigate to `chrome://extensions`
2. [ ] Enable **Developer mode** (toggle in top-right)
3. [ ] Click **Load unpacked**
4. [ ] Select your extension directory (e.g., `/path/to/extension`)
5. [ ] Verify extension loads without errors
6. [ ] Check that extension icon appears in toolbar
7. [ ] Verify no errors in service worker console

**Expected Behavior:**
- Extension loads successfully
- Welcome page (options.html) opens automatically
- Service worker shows "⚡ FlashDoc initialized" in console

---

## ✅ Core Functionality Tests

### 1. Context Menu Tests
1. [ ] Select text on any webpage (at least 10 characters)
2. [ ] Right-click on selected text
3. [ ] Verify "⚡ FlashDoc" parent menu appears
4. [ ] Hover over parent menu
5. [ ] Verify all child menu items appear:
   - ⚡ Auto-detect & Save
   - 📄 Save as .txt
   - 📝 Save as .md
   - 📋 Save as .json
   - 🟨 Save as .js
   - 🔵 Save as .ts
   - 🐍 Save as .py
   - 🌐 Save as .html
   - 🎨 Save as .css
   - 📰 Save as .xml
   - 🗄️ Save as .sql
   - ⚙️ Save as .sh
   - 📦 Save as .yaml
   - 📊 Save as .csv
   - 📕 Save as PDF
   - 🏷️ Label 89×28 mm (PDF)

6. [ ] Click "Auto-detect & Save"
7. [ ] Verify download starts
8. [ ] Check Downloads folder for `FlashDocs/` directory
9. [ ] Verify file was created with correct extension

**Expected Behavior:**
- Context menu appears for selected text
- File downloads to `FlashDocs/<format>/` folder
- Notification appears (if enabled)
- File contains correct content

---

### 2. Keyboard Shortcut Tests
Test on `test-flashdoc.html` or any webpage:

1. [ ] Select text
2. [ ] Press `Ctrl+Shift+S` (Cmd+Shift+S on Mac) - Smart Save
3. [ ] Verify download occurs
4. [ ] Select different text
5. [ ] Press `Ctrl+Shift+T` - Save as TXT
6. [ ] Verify .txt file downloads
7. [ ] Select text
8. [ ] Press `Ctrl+Shift+M` - Save as Markdown
9. [ ] Verify .md file downloads
10. [ ] Select text
11. [ ] Press `Ctrl+Shift+P` - Save as PDF
12. [ ] Verify .pdf file downloads

**Expected Behavior:**
- Keyboard shortcuts trigger downloads
- Correct file format for each shortcut
- No errors in console

---

### 3. Popup Tests
1. [ ] Click extension icon in toolbar
2. [ ] Verify popup opens
3. [ ] Check that popup shows:
   - Total files created count
   - Today's file count
   - Last file name and timestamp
4. [ ] Select text on webpage
5. [ ] Click "Smart Save" button in popup
6. [ ] Verify download occurs
7. [ ] Try other format buttons (TXT, Markdown, PDF, Label)

**Expected Behavior:**
- Popup displays statistics correctly
- Action buttons work
- Stats update after saving files

---

### 4. Options Page Tests
1. [ ] Right-click extension icon → Options (or click ⚙️ in popup)
2. [ ] Verify options page opens
3. [ ] Test changing settings:
   - [ ] Change folder path
   - [ ] Change naming pattern (timestamp/firstline/custom)
   - [ ] Toggle "Organize by type"
   - [ ] Toggle notifications
   - [ ] Change selection threshold
   - [ ] Toggle floating button
4. [ ] Click "Save Settings"
5. [ ] Verify settings are saved (refresh page, check if settings persist)
6. [ ] Click "Reset to Defaults"
7. [ ] Verify settings return to defaults

**Expected Behavior:**
- All settings save correctly
- Settings persist after browser restart
- Reset to defaults works

---

### 5. Format Detection Tests
Use `test-flashdoc.html` to test format detection:

1. [ ] **YAML Detection**: Select YAML example block
2. [ ] Use Auto-detect
3. [ ] Verify saves as .yaml

4. [ ] **Python Detection**: Select Python code example
5. [ ] Use Auto-detect
6. [ ] Verify saves as .py

7. [ ] **JavaScript Detection**: Select JavaScript code
8. [ ] Use Auto-detect
9. [ ] Verify saves as .js

10. [ ] **TypeScript Detection**: Select TypeScript code
11. [ ] Use Auto-detect
12. [ ] Verify saves as .ts

13. [ ] **JSON Detection**: Select JSON example
14. [ ] Use Auto-detect
15. [ ] Verify saves as .json

16. [ ] **Markdown Detection**: Select Markdown text
17. [ ] Use Auto-detect
18. [ ] Verify saves as .md

19. [ ] **HTML Detection**: Select HTML code
20. [ ] Use Auto-detect
21. [ ] Verify saves as .html

22. [ ] **CSV Detection**: Select CSV data
23. [ ] Use Auto-detect
24. [ ] Verify saves as .csv

**Expected Behavior:**
- Auto-detection correctly identifies format
- File saves with appropriate extension
- No errors in console

---

### 6. PDF Generation Tests

**Regular PDF:**
1. [ ] Select multi-line text
2. [ ] Save as PDF
3. [ ] Open PDF file
4. [ ] Verify content is readable and properly formatted

**Label PDF (89×28mm):**
1. [ ] Select 1-4 lines of text
2. [ ] Save as Label
3. [ ] Open PDF file
4. [ ] Verify:
   - Text is centered
   - Font size is appropriate
   - All lines fit within label dimensions
5. [ ] Try with more than 4 lines
6. [ ] Verify text wraps/compresses appropriately

**Expected Behavior:**
- PDFs are valid and openable
- Content is correctly formatted
- Labels fit 89×28mm format
- Text is readable

---

## ✅ Edge Case Tests

### Empty and Invalid Input
1. [ ] Try to save without selecting text
2. [ ] Verify error notification appears
3. [ ] Select only whitespace
4. [ ] Try to save
5. [ ] Verify error notification

**Expected:** Graceful error handling with user notifications

### Special Characters
1. [ ] Select text with unicode characters (emojis, Chinese, Arabic)
2. [ ] Save as TXT
3. [ ] Verify characters are preserved

### Very Long Content
1. [ ] Select very long text (10,000+ characters)
2. [ ] Save as TXT
3. [ ] Verify entire content is saved

### Filename Edge Cases
1. [ ] Set naming pattern to "firstline"
2. [ ] Select text with special characters in first line: `test/file:name*`
3. [ ] Save
4. [ ] Verify filename is sanitized (no special characters)

---

## ✅ Performance Tests

1. [ ] Save 10 files in rapid succession
2. [ ] Verify all downloads complete
3. [ ] Check service worker doesn't crash
4. [ ] Verify no memory leaks (check Task Manager)

---

## ✅ Permissions Tests

1. [ ] Open `chrome://extensions`
2. [ ] Click "Details" on FlashDoc
3. [ ] Verify requested permissions:
   - Context menus
   - Downloads
   - Storage
   - Notifications
   - Scripting
   - Active tab
4. [ ] Verify no unexpected permissions requested

---

## ✅ Browser Compatibility Tests

### Chrome
1. [ ] Test on Chrome version 100+
2. [ ] Verify all features work

### Edge (Chromium)
1. [ ] Load extension in Edge
2. [ ] Test core functionality
3. [ ] Verify compatibility

---

## ✅ Error Handling Tests

### Offline Mode
1. [ ] Disconnect network
2. [ ] Try to save file
3. [ ] Verify appropriate error message

### Storage Full
1. [ ] Fill up Downloads folder (or set quota limit)
2. [ ] Try to save
3. [ ] Verify error is handled gracefully

### Service Worker Sleep
1. [ ] Wait for service worker to sleep (inactive for 30 seconds)
2. [ ] Try to save file
3. [ ] Verify service worker wakes up and completes action

---

## ✅ Data Persistence Tests

1. [ ] Save several files
2. [ ] Check popup stats
3. [ ] Close browser completely
4. [ ] Reopen browser
5. [ ] Open popup
6. [ ] Verify stats persisted

---

## ✅ Security Tests

1. [ ] Verify no external scripts loaded
2. [ ] Check Content Security Policy in manifest
3. [ ] Verify downloads use secure methods (no eval, no inline scripts)
4. [ ] Test that extension doesn't access sensitive data
5. [ ] Verify file paths can't escape designated download folder

---

## ✅ Accessibility Tests

1. [ ] Test keyboard navigation in popup
2. [ ] Test keyboard shortcuts work
3. [ ] Verify screen reader compatibility (if applicable)

---

## ✅ Cleanup Tests

1. [ ] Uninstall extension
2. [ ] Verify extension removes cleanly
3. [ ] Check that no residual files remain (except downloaded files)

---

## 📊 Test Results Summary

| Category | Tests | Passed | Failed | Notes |
|----------|-------|--------|--------|-------|
| Installation | 31 | - | - | Automated |
| Context Menu | - | - | - | |
| Keyboard Shortcuts | - | - | - | |
| Popup | - | - | - | |
| Options | - | - | - | |
| Format Detection | - | - | - | |
| PDF Generation | - | - | - | |
| Edge Cases | - | - | - | |
| Performance | - | - | - | |
| Security | - | - | - | |

---

## 🐛 Known Issues

Document any issues found during testing:

1.
2.
3.

---

## 📝 Testing Notes

- Date tested: ___________
- Tester: ___________
- Chrome version: ___________
- OS: ___________
- Extension version: 2.0.0

---

## ✅ Production Ready Checklist

Before marking as production ready:

- [ ] All automated tests pass
- [ ] All smoke tests pass
- [ ] No critical bugs
- [ ] Performance is acceptable
- [ ] Security review complete
- [ ] Documentation is up-to-date
- [ ] Code is properly formatted
- [ ] No TODO or FIXME comments in production code
- [ ] Version number is correct in manifest.json
- [ ] README is comprehensive
- [ ] License is included

---

**Status:** □ NOT READY  □ READY FOR PRODUCTION

**Sign-off:** ___________
