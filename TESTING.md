# Testleitfaden für Manifest-V3-Erweiterung

## Vorbereitung
- Installiere die Erweiterung im Dev-Modus über `chrome://extensions` oder via `google-chrome --disable-extensions-file-access-check --load-extension=$(pwd)`.
- Öffne die Service-Worker-Konsole (`chrome://extensions`, Schaltfläche *Service Worker prüfen*) für Live-Protokolle.
- Leere Downloads und lokale Speicherbereiche, um Seiteneffekte zu vermeiden.

## Smoke-Tests nach Chrome-Standards
- **Registrierung:** Kontrolliere in `chrome://extensions`, dass der Service Worker aktiv ist und keine Warnungen zu Manifest V3 erscheinen.
- **Berechtigungen:** Aus dem Popup `chrome.permissions.getAll` prüfen (Konsole) und sicherstellen, dass nur deklarierte Berechtigungen (`downloads`, `storage`, `contextMenus`, `scripting`) aktiv sind.
- **Ereignislebensdauer:** Überwache `service-worker.js`-Logs; der Worker soll nach Ereignisabschluss schlafen und bei Aktionen (Kontextmenü/Shortcut) deterministisch aufwachen.

## Funktionspfade validieren
- **Kontextmenü-Speichern:** Rechtsklick → InstantFiles-Eintrag, Inhalt speichern, Download-Ordner `InstantFiles/<Typ>` prüfen.
- **Tastenkürzel:** Hinterlegte Tastenkombi auslösen (`chrome://extensions/shortcuts`), sicherstellen, dass Downloads ohne UI-Fehler starten.
- **Popup-Aktion:** Popup öffnen, Speichervorgang auslösen, Erfolgs-/Fehlerstatus verifizieren.
- **Content-Erkennung:** Auf `test-instafile.html` alle Beispielblöcke (YAML, JSON, Markdown, Python) markieren und korrektes Autotyp-Label prüfen.
- **Adresslabel 89x28:** Auswahl mit max. vier Zeilen markieren, über Popup oder Kontextmenü als Label speichern und PDF-Größe sowie Zeilenumbrüche prüfen.

## Regressions- und Fehlerpfade
- Netz offline schalten (`chrome://settings/cronetInternals` → *Disable Network*) und erneut speichern: Erwartet klare Fehlermeldung.
- Downloads deaktivieren (`chrome://settings/content/automaticDownloads`) und sicherstellen, dass die Erweiterung den Block kommuniziert.
- Speicher löschen (`chrome.storage.sync.clear`) und Standardkonfiguration erneut anwenden lassen.

## Abschlusschecks
- Service-Worker-Konsole auf Exceptions prüfen; keine `Unchecked runtime.lastError`-Meldungen.
- Manifest validieren: `npx chrome-manifest-validator manifest.json` (experimentell) oder Upload-Precheck im Chrome Web Store Dashboard.
- Abschließend `zip -r out/instafile.zip . -x 'out/*' '.git/*'` erstellen und in sauberem Profil testen.
