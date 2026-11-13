/**
 * Ink / inkjs dialogue validator — script gate for src/lib/wiring/dialogue/*.json.
 *
 * Pokemon-first structure: a FireRed decomp event script is lock,
 * faceplayer, msgbox, flag set, then an exit (release / end) — in that
 * order, with a flag that stops the scene repeating. These JSONs carry
 * the same structure in Ink shape: compiled ink knots (region1-truck-start)
 * and hand-shaped knots/stitches (ink-dialogue-locked-*.json), where a
 * stitch's `exit` / exit choice is the release, and `setFlags` is the
 * flag set. Mochiichao words sit in those slots; no Pokemon dialogue
 * text, town/character/species names, sprites, music, or code is shipped.
 *
 * Checks (hard errors, exit 1) — see validate-dialogue.ts for the full list:
 *   - every exit target resolves (choice target knot+stitch, ink divert)
 *   - every flag read is written somewhere; every declared flag is written
 *   - every stitch/knot is reachable (a `main` stitch, a choice target,
 *     or a known battle/field event stitch)
 *   - no dead ends: a stitch with neither exit:true nor choices is an error
 *   - no empty lines / choices / missing speakers
 * Warnings (do not fail the run): superseded knots retained for history,
 * stitches never targeted by a choice and not a known event stitch, and
 * flags written but never read by a dialogue condition (those flags are
 * consumed by game/progression code outside dialogue — the reader must be
 * recorded, not invented here).
 *
 * Files this gate SKIPS, on purpose, printed as SKIP (never silent):
 *   - src/lib/wiring/dialogue/region1-5-dialogue.json — content-only
 *     source files (beats/entries), not Ink-compiled JSON and not
 *     hand-shaped knots. They are the source material for the Regions
 *     2-5 Ink conversion (a later step); validating them as dialogue
 *     would fail the gate on files that are not dialogue yet.
 *   - non-JSON files in the directory (e.g. region1-truck-start.ink,
 *     the Ink source the compiled JSON is built from).
 *
 * Run: npm run validate:dialogue
 * Exit 0 = every dialogue file passes. This file imports no game code, so
 * it runs standalone against the JSON files on disk.
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { validateDialogueJson } from "./validate-dialogue";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIALOGUE_DIR = path.join(HERE, "dialogue");

const errors: string[] = [];
const warnings: string[] = [];
const skipped: string[] = [];

const files = fs.existsSync(DIALOGUE_DIR)
  ? fs.readdirSync(DIALOGUE_DIR).filter((f) => f.endsWith(".json")).sort()
  : [];
const nonJson = fs.existsSync(DIALOGUE_DIR)
  ? fs
      .readdirSync(DIALOGUE_DIR)
      .filter((f) => !f.endsWith(".json"))
      .sort()
  : [];
for (const f of nonJson) {
  skipped.push(`${f}: not a JSON dialogue file (e.g. .ink source) — skipped`);
}
if (files.length === 0) {
  errors.push(`no dialogue JSON files found in ${DIALOGUE_DIR}`);
}

let checked = 0;
for (const file of files) {
  const full = path.join(DIALOGUE_DIR, file);
  let data: unknown;
  try {
    data = JSON.parse(fs.readFileSync(full, "utf8"));
  } catch (e) {
    errors.push(`${file}: unparsable JSON: ${(e as Error).message}`);
    continue;
  }
  // Content-only source files (beats/entries) are not a dialogue format
  // yet — skip them explicitly instead of failing the gate on files that
  // are not dialogue. Their top-level keys are printed so a typo'd
  // format is visible, not silently skipped.
  if (
    typeof data === "object" &&
    data !== null &&
    !("knots" in data) &&
    !(("inkVersion" in data) && "root" in data)
  ) {
    skipped.push(
      `${file}: content-only source file (top-level keys: ${Object.keys(data as Record<string, unknown>).join(", ")}) — not a dialogue format, skipped`,
    );
    continue;
  }
  const result = validateDialogueJson(data, file);
  checked += 1;
  const s = result.stats;
  console.log(
    `  ${file} [${result.format}] knots=${s.knots} stitches=${s.stitches} lines=${s.lines} choices=${s.choices} exitChoices=${s.exitChoices} flagsDeclared=${s.flagsDeclared} flagsWritten=${s.flagsWritten} flagsRead=${s.flagsRead} errors=${result.errors.length} warnings=${result.warnings.length}`,
  );
  for (const e of result.errors) errors.push(`${e.file} ${e.where}: ${e.message}`);
  for (const w of result.warnings) warnings.push(`${w.file} ${w.where}: ${w.message}`);
}

console.log(`\nDialogue validated: ${checked} file(s) checked, ${skipped.length} skipped`);
for (const s of skipped) console.log(`  SKIP: ${s}`);
console.log(`Warnings (${warnings.length}):`);
for (const w of warnings) console.log(`  WARN: ${w}`);
if (errors.length > 0) {
  console.log(`\nERRORS (${errors.length}):`);
  for (const e of errors) console.log(`  ERROR: ${e}`);
  process.exit(1);
}
console.log("\nvalidate-dialogue PASSED.");
