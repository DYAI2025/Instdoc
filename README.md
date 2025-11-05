# InstaFile — Save Any Selection in Style

<div align="center">
  <img src="icon128.png" width="96" alt="InstaFile Icon" />
  <h3>Clip text. Pick a format. Download instantly.</h3>

  [![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-live-blue?logo=googlechrome)](#installation) 
  [![Formats](https://img.shields.io/badge/Formats-Auto%20%E2%80%A2%20TXT%20%E2%80%A2%20MD%20%E2%80%A2%20YAML%20%E2%80%A2%20PDF-9cf)](#supported-formats--unterstutzte-formate)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](#license--mitmachen--contributing)
</div>

> **🇩🇪 Deutsch?** Springe zum [deutschen Abschnitt](#instafile--textauswahl-wird-zum-dokument).

> **🇬🇧 English first?** Stay here or use the [quick navigation](#table-of-contents--inhalt).

## Table of Contents · Inhalt

| English | Deutsch |
| --- | --- |
| [Highlights](#highlights) | [Highlights (DE)](#highlights-de) |
| [Installation](#installation) | [Installation (DE)](#installation-de) |
| [Quickstart](#quickstart-save-any-selection) | [Schnellstart](#schnellstart-inhalte-speichern) |
| [Supported Formats](#supported-formats--unterstutzte-formate) | [Unterstützte Dateiformate](#unterstutzte-dateiformate) |
| [Naming & Storage](#smart-naming--storage) | [Dateibenennung & Ablage](#dateibenennung--ablage) |
| [Preferences](#customise-your-workflow) | [Einstellungen anpassen](#einstellungen-anpassen) |
| [Popup Insights](#popup-dashboard--insights) | [Popup & Statistiken](#popup--statistiken) |
| [Tips & QA](#pro-tips--qa) | [Tipps & Qualitätssicherung](#tipps-fur-reibungslose-nutzung) |
| [License & Contributing](#license--mitmachen--contributing) | [Lizenz & Mitmachen](#lizenz--mitmachen) |

---

## Highlights

> Turn selected text into perfectly named downloads with one click or keystroke.

- **Context menu & floating action button:** Convert highlighted content into files via right-click or an in-page quick action. 【F:service-worker.js†L66-L125】【F:content.js†L4-L199】
- **Smart format detection:** Automatically recognises YAML, Python, Markdown, HTML, CSV, JSON and more. 【F:service-worker.js†L206-L317】【F:service-worker.js†L540-L620】
- **Clever naming & folders:** Store files under `InstantFiles/<format>/` with timestamps, first-line titles or custom patterns. 【F:service-worker.js†L218-L299】
- **Label-ready PDF workflow:** Instantly layout short snippets as 89×28 mm shipping labels. 【F:service-worker.js†L415-L538】
- **Live stats dashboard:** The popup surfaces the latest file, daily totals and quick actions for Smart Save, Markdown, PDF, labels and more. 【F:popup.js†L38-L272】

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked** and select the project folder.
5. Optional: run a quick smoke test with `google-chrome --disable-extensions-file-access-check --load-extension=$(pwd)`. 【F:AGENTS.md†L11-L15】

## Quickstart: Save Any Selection

1. **Select text:** Highlight at least the minimum number of characters configured in the options (default: 10). 【F:content.js†L44-L97】【F:options.js†L1-L107】
2. **Trigger InstaFile:**
   - Right-click → ⚡ **InstantFile** → choose Auto, TXT, Markdown, YAML, Python or Label. 【F:service-worker.js†L66-L125】
   - Use shortcuts such as `Ctrl+Shift+S` (Smart), `Ctrl+Shift+T` (TXT), `Ctrl+Shift+M` (Markdown) or `Ctrl+Shift+P` (PDF). 【F:manifest.json†L30-L58】
   - Tap the floating button or open the popup for quick actions. 【F:content.js†L83-L199】【F:popup.js†L200-L272】
3. **Download instantly:** Files land in your chosen folder and trigger optional notifications on success. 【F:service-worker.js†L218-L266】

## Supported Formats · Unterstützte Formate

| Detection | Manual Picks | Special Sauce |
| --- | --- | --- |
| YAML, Python, JavaScript, JSON, CSV, Markdown, HTML (default fallback: TXT) | TXT, MD, YAML, PY, PDF, Label (PDF) | Auto-generated 89×28 mm label PDFs for up to four lines of text |

【F:service-worker.js†L66-L329】【F:service-worker.js†L415-L620】

## Smart Naming & Storage

- **Folder structure:** Defaults to `InstantFiles/` with optional per-format sub-folders. 【F:service-worker.js†L218-L233】
- **Naming schemes:** Timestamp (`instant_2024-01-01_12-00.pdf`), first-line titles or custom patterns (`file_{date}`) with `{date}`, `{time}` and `{type}` placeholders. 【F:service-worker.js†L269-L299】
- **Conflict handling:** Downloads use `conflictAction: 'uniquify'` to auto-increment duplicates. 【F:service-worker.js†L228-L233】

## Customise Your Workflow

Open the options page (`chrome://extensions` → extension details → **Options** or click ⚙️ in the popup) to:

- Choose storage folders, naming patterns and per-format organisation.
- Control notifications, sounds and badge counters.
- Toggle the context menu, floating button, auto-hide and position.
- Adjust minimum selection length and smart detection rules.
- Reset everything to defaults at any time. 【F:options.js†L1-L147】

## Popup Dashboard & Insights

- Surface total files created, daily counters and the most recent filename with timestamps. 【F:popup.js†L38-L132】
- Trigger Smart Save, TXT, Markdown, PDF, label exports and contextual data/code analysis for the current selection. 【F:popup.js†L134-L272】
- Jump straight to the destination folder, options page or help resources. 【F:popup.js†L38-L272】

## Pro Tips & QA

- Inspect **service-worker logs** via `chrome://extensions` → *Inspect views* for easier debugging. 【F:TESTING.md†L4-L10】
- The options page pings the worker awake to clear transient errors if it dozes off. 【F:options.js†L149-L170】
- Disable Chrome download restrictions if saves are blocked. 【F:TESTING.md†L28-L32】

Follow the QA checklist before releasing:

1. Reload the extension and watch the service-worker console.
2. Exercise context menus, shortcuts, popup actions and the label flow on `test-instafile.html`.
3. Simulate offline, permission and storage edge cases (network off, blocked downloads, cleared storage).
4. Package with `zip -r out/instafile.zip . -x 'out/*' '.git/*'` and test in a clean profile. 【F:TESTING.md†L1-L36】

---

# InstaFile – Textauswahl wird zum Dokument

InstaFile ist eine Chrome-Erweiterung, mit der du beliebigen Text aus dem Browser ohne Umwege als Datei sichern kannst. Markiere Inhalte, löse die Aktion aus und die Erweiterung erzeugt automatisch Download-Dateien – von Plain-Text über Markdown und YAML bis hin zu PDF-Etiketten. So landen Notizen, Code, Dokumentation oder Versandlabels in Sekundenbruchteilen in deinem Download-Ordner.

## Highlights (DE)

> Verwandle markierten Text mit einem Klick oder Shortcut in perfekt benannte Dateien.

- **Kontextmenü & Floating Button:** Wandle markierte Inhalte per Rechtsklick oder kontextuellem Schwebe-Button direkt in Dateien um. 【F:service-worker.js†L66-L125】【F:content.js†L4-L199】
- **Intelligente Format-Erkennung:** InstaFile erkennt YAML, Python, Markdown, HTML, CSV, JSON und mehr automatisch und wählt das passende Dateiformat. 【F:service-worker.js†L206-L317】【F:service-worker.js†L540-L620】
- **Smarte Dateibenennung & Ordnerstruktur:** Standardmäßig landen Dateien unter `InstantFiles/<Format>/` und werden je nach Einstellung nach Timestamp, erster Zeile oder eigenem Muster benannt. 【F:service-worker.js†L218-L299】
- **Spezialworkflow für Versandlabels:** Ein integrierter PDF-Generator formatiert kurze Textblöcke automatisch als 89×28-mm-Etikett. 【F:service-worker.js†L415-L538】
- **Dashboard & Statistiken im Popup:** Das Popup zeigt die letzte Datei, Tages- und Gesamtzähler sowie Schnellaktionen für Smart Save, Markdown, PDF, Label u. a. 【F:popup.js†L38-L272】

## Installation (DE)

1. Repository klonen oder herunterladen.
2. Chrome öffnen und `chrome://extensions` aufrufen.
3. **Entwicklermodus** aktivieren (Schalter oben rechts).
4. Auf **Entpackte Erweiterung laden** klicken und den Projektordner auswählen.
5. Optional: Über `google-chrome --disable-extensions-file-access-check --load-extension=$(pwd)` einen schnellen Smoke-Test ausführen. 【F:AGENTS.md†L11-L15】

## Schnellstart: Inhalte speichern

1. **Text markieren:** Wähle auf einer Webseite mindestens so viel Text wie im Optionsmenü definiert (Standard: 10 Zeichen). 【F:content.js†L44-L97】【F:options.js†L1-L107】
2. **Aktion auslösen:**
   - Rechtsklick → ⚡ **InstantFile** → gewünschtes Zielformat (Auto, TXT, Markdown, YAML, Python, Label). 【F:service-worker.js†L66-L125】
   - Tastenkombinationen wie `Ctrl+Shift+S` (Smart), `Ctrl+Shift+T` (TXT), `Ctrl+Shift+M` (Markdown) oder `Ctrl+Shift+P` (PDF). 【F:manifest.json†L30-L58】
   - Floating Button anklicken oder das Popup öffnen und eine Schnellaktion wählen. 【F:content.js†L83-L199】【F:popup.js†L200-L272】
3. **Download beobachten:** Dateien werden im angegebenen Ordner gespeichert, optional nach Format gruppiert. Erfolgreiche Downloads lösen eine Benachrichtigung aus (sofern aktiviert). 【F:service-worker.js†L218-L266】

## Unterstützte Dateiformate

- **Automatische Erkennung:** YAML, Python, JavaScript, JSON, CSV, Markdown, HTML; Standardfall ist TXT. 【F:service-worker.js†L540-L620】
- **Manuelle Auswahl:** TXT, MD, YAML, PY, PDF, Label (PDF). 【F:service-worker.js†L66-L125】【F:service-worker.js†L303-L329】
- **Spezialfall Label:** Bis zu vier Zeilen Text werden zentriert, proportional skaliert und als PDF im Format 89×28 mm gespeichert – ideal für Versandaufkleber. 【F:service-worker.js†L415-L538】

## Dateibenennung & Ablage

- **Ordnerstruktur:** Standardmäßig `InstantFiles/`, optional nach Typ gruppiert (`InstantFiles/markdown/…`). 【F:service-worker.js†L218-L233】
- **Benennungsstrategien:** Timestamp (`instant_2024-01-01_12-00.pdf`), erste Zeile oder benutzerdefiniertes Muster (`file_{date}`) mit Platzhaltern `{date}`, `{time}`, `{type}`. 【F:service-worker.js†L269-L299】
- **Namenskonflikte:** Downloads nutzen `conflictAction: 'uniquify'`, doppelte Namen werden automatisch hochgezählt. 【F:service-worker.js†L228-L233】

## Einstellungen anpassen

Öffne die Optionsseite (`chrome://extensions` → Erweiterungsdetails → Optionen oder im Popup auf ⚙️ klicken), um:

- Speicherordner, Dateinamensschema und Strukturierung nach Dateityp zu definieren.
- Benachrichtigungen und Sounds zu steuern.
- Kontextmenü, Floating Button, Auto-Hide und Position festzulegen.
- Schwelle für Mindestzeichen der Auswahl sowie Smart Detection umzuschalten.
- Die Einstellungen jederzeit auf Werkseinstellungen zurückzusetzen. 【F:options.js†L1-L147】

## Popup & Statistiken

- Zeigt Gesamtanzahl erstellter Dateien, Tagescounter und den zuletzt gespeicherten Dateinamen mit Zeitangabe. 【F:popup.js†L38-L132】
- Schnellaktionen für Smart Save, TXT, Markdown, PDF, Label sowie kontextbezogene Code-/Daten-Analysen der aktuellen Auswahl. 【F:popup.js†L134-L272】
- Verlinkungen zum Zielordner, zu den Optionen und zur Hilfe erleichtern den Workflow. 【F:popup.js†L38-L272】

## Tipps für reibungslose Nutzung

- **Service-Worker-Logs** helfen bei Fehlersuche (`chrome://extensions` → *Service Worker prüfen*). 【F:TESTING.md†L4-L10】
- Bei Schlafzustand des Workers sendet die Optionsseite ein Refresh-Signal; kurzzeitige Fehlermeldungen verschwinden nach dem Aufwachen automatisch. 【F:options.js†L149-L170】
- Deaktiviere Downloadsperren in Chrome, falls Speichervorgänge blockiert werden. 【F:TESTING.md†L28-L32】

## Qualitätssicherung & Tests

Folge dem Testleitfaden, um neue Änderungen oder Releases zu prüfen:

1. Erweiterung frisch laden und Service-Worker-Konsole beobachten.
2. Kontextmenü, Tastenkürzel, Popup-Aktionen und den Label-Workflow auf `test-instafile.html` durchspielen.
3. Offline- und Berechtigungsszenarien simulieren (Netzwerk aus, Downloads blockieren, Speicher löschen).
4. Abschließend Erweiterung paketieren (`zip -r out/instafile.zip . -x 'out/*' '.git/*'`) und in einem sauberen Profil testen. 【F:TESTING.md†L1-L36】

## Lizenz & Mitmachen · Contributing

Pull Requests sind willkommen! Halte dich an die Commit- und PR-Richtlinien aus `AGENTS.md`, dokumentiere neue Berechtigungen im Manifest und beschreibe Nutzer:innen-freundlich, was sich geändert hat. 【F:AGENTS.md†L26-L33】

---

### License · Mitmachen · Contributing

Released under the MIT License. Contributions, localisations and workflow ideas are highly encouraged—open an issue or PR to get started. 【F:AGENTS.md†L26-L33】
