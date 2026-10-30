# CUT V3-### — folder contract

This folder is the cut's package (PRODUCTION-ORGANISATION.md).
Read `cut.json` first: it names the route, the assets (by
reference — never copy a rig, plate, or palette in here), and the
gate results.

Stage contracts — a downstream stage consumes only what the stage
above publishes:

- `board/` publishes the board panels + timing rows.
- `puppet/` publishes the character pass (PNG sequence) + viseme record.
- `cleanup/` publishes the cleaned, palette-true level set.
- `composite/` publishes the cut master render + `lighting-record.json`.
  Composite is the assembly stage: lighting, contact shadows, and
  the grade land here and nowhere else.
- `renders/` holds stage renders for review; only the composite
  output is publishable.
- `audio/` holds the cut's stems as attached at build time.

Naming: every stage file carries the cut id (`V3-###_puppet.tnz`,
`V3-###_composite.ntp`) so any file found anywhere names its home.
