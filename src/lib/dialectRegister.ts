// Dialect register — types only (teardown-persona5, PR-P1).
//
// The v2 register data shapes from the Persona dialect lane's
// WIRING-PACKAGE (~/workspace/persona-dialect-game/WIRING-PACKAGE.md
// §§2–4), landed as types alongside the v1 fragment
// (docs/ui-art/persona-dialect/persona-dialect-fragment.json, the law
// document). This file carries NO resolver and NO rendering: the
// resolver (the dialect lane's step 3, evolving src/lib/personaDialogue.ts)
// is QUEUED behind this types landing by that lane's own order, and the
// validator lands separately (PR-P2). Exactly one resolver will exist.
//
// Owner slots stay open in the data: the accent colour and the glyph set
// are null until Jamar rules them (accentToken / glyphFamily resolve to
// null while those slots are open).

export type DialectClass = "none" | "C" | "B" | "A" | "jax";

export type DialectDevice =
  | "dialogue-frame"
  | "title-card"
  | "popup"
  | "rank-burst"
  | "cut-in"
  | "transition-wipe"
  | "battle-callout";

export interface RegisterRecord {
  class: DialectClass;
  /** Story-position band key, e.g. "P1" | "B2" | "B3". */
  band: string;
  /** Required for class A; required for B claiming Syndicate adjacency. A key into the fiction record, never free text. */
  fictionKey?: string;
  devices: DialectDevice[];
  heroMove?: "none" | "cut-in" | "splash" | "collage-headline";
  slant?: "primary" | "opposed";
  /** "none" is mandatory for class C; "signed" is lawful only post-reveal on class A. */
  attribution: "none" | "display" | "signed";
  /** Authored beat this record belongs to. */
  beatId?: string;
}

export interface PresentationEvent {
  id: string;
  kind: "objective" | "discovery" | "bond" | "honor" | "rank" | "unlock" | "notice";
  registerClass: DialectClass;
  headline: string;
  body?: string;
  /** Null until the glyph set ships (owner slot). */
  glyphId?: string | null;
  priority: number;
  durationMs: number;
  /** Required; same key within a window collapses. An event without one fails validation. */
  dedupeKey: string;
  /** The owning system, e.g. "bond" | "honor" | "world" | "shop". The system owns the fact; the dialect owns the presentation. */
  sourceSystem: string;
  beatId?: string;
  /** Band labels + subject id only — never a stored rank/standing number. */
  threshold?: { from: string; to: string; subjectId: string };
}

export interface ResolvedRegister {
  effectiveClass: DialectClass;
  devices: DialectDevice[];
  heroMove: "none" | "cut-in" | "splash" | "collage-headline";
  slant: "primary" | "opposed";
  /** Reveal-resolved; never the hidden name pre-reveal. */
  displayName: string | null;
  portraitMode: "face" | "silhouette" | "none";
  /** Null while the accent-colour owner slot is open. */
  accentToken: string | null;
  /** Null while the glyph-set owner slot is open. */
  glyphFamily: string | null;
}
