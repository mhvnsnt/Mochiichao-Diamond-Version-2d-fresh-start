# Landing show-dialect-1 onto restored main

Source branch tip: 7e17a544e. Own commits: 210b28528..7e17a544e (3).
Main's history was rebuilt from an orphan restore, so the branch shares no merge base with main; its own commits were applied onto main three-way instead of a plain merge. Main's restored files are kept.

## Decisions
- docs/menu-editability-parity-audit-20261028.md: exists on main in another version; kept main's, branch version added as docs/menu-editability-parity-audit-20261028.from-show-dialect-1.md
- show/production/SHOW-DIALECT-USE.md: added
- show/production/show-dialect-fragment.json: added
- docs/ui-art/menu-skins/README.md: branch edits merged cleanly into main's version
- docs/ui-art/menu-skins/bag.y2k-skins.json: branch edits merged cleanly into main's version
- docs/ui-art/menu-skins/battle.y2k-skins.json: branch edits merged cleanly into main's version
- docs/ui-art/menu-skins/dialogue.y2k-skins.json: branch edits merged cleanly into main's version
- docs/ui-art/menu-skins/main-menu.y2k-skins.json: branch edits merged cleanly into main's version
- docs/ui-art/menu-skins/party.y2k-skins.json: branch edits merged cleanly into main's version
- docs/ui-art/menu-skins/pause.y2k-skins.json: branch edits merged cleanly into main's version
- docs/ui-art/menu-skins/pc.y2k-skins.json: branch edits merged cleanly into main's version
- docs/ui-art/menu-skins/save-slots.y2k-skins.json: branch edits merged cleanly into main's version
- docs/ui-art/menu-skins/settings.y2k-skins.json: branch edits merged cleanly into main's version
- docs/ui-art/menu-skins/shop.y2k-skins.json: branch edits merged cleanly into main's version
- docs/ui-art/menu-skins/skins.json: branch edits merged cleanly into main's version
- show/production/agent-commons/CLAIMS.md: conflicting edits; kept main's version, branch version added as show/production/agent-commons/CLAIMS.from-show-dialect-1.md
- show/production/agent-commons/TAG-TEAM.md: conflicting edits; kept main's version, branch version added as show/production/agent-commons/TAG-TEAM.from-show-dialect-1.md
- src/components/IntroSequence.tsx: branch edits merged cleanly into main's version
- src/lib/lockedV32Menu.ts: branch edits merged cleanly into main's version
- src/lib/menuEditor.ts: branch edits merged cleanly into main's version
- src/lib/menuSkins.ts: branch edits merged cleanly into main's version
