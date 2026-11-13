/**
 * Ink runtime driver — live DialogueBox Ink wiring (step i).
 *
 * Compiled Ink JSON (inkVersion + root, e.g.
 * src/lib/wiring/dialogue/region1-truck-start.json) is played through
 * inkjs (already a dependency). The validator's contract lives in
 * src/lib/wiring/validate-dialogue.ts: knots are the named containers
 * in root, `{"->": name}` diverts must resolve to a knot (or END),
 * `{"VAR=": name}` writes and `{"VAR?": name}` reads must be declared
 * in `global decl`. This driver plays exactly that format — it never
 * edits dialogue content.
 *
 * Two modes:
 * - Knot-scoped (default): plays one knot and stops at its divert
 *   boundary. The next knot plays when the player reaches that beat,
 *   via a fresh session. This is how the truck Mom talk works: the
 *   mom_truck knot is her two lines, then the session ends.
 * - Full-story (followDiverts = true): follows diverts through every
 *   knot to END. Used by tests and by later beats that own a whole
 *   scene (e.g. the Route 1.0 rescue choice).
 *
 * Speaker labels: Ink lines are written "Name: text" (Mom, Mover,
 * Prof. Aeon, You) or bare narration ("You set the clock...").
 * splitSpeaker separates the label so the engine carries the speaker
 * name, exactly like the plain dialog[] path in FullWorldMaps.
 */
import { Story } from "inkjs";
import truckStartJson from "./wiring/dialogue/region1-truck-start.json";

/** Compiled Ink stories registered for live play, by story id. */
export const INK_STORIES: Record<string, unknown> = {
  "region1-truck-start": truckStartJson,
};

export type InkLine = { speaker: string | null; text: string };
export type InkChoice = { index: number; text: string };

const SPEAKER_RE = /^([A-Za-z][A-Za-z .'-]*):\s+(.+)$/;

/** Split "Name: text" into speaker + text; bare lines are narration. */
export function splitSpeaker(raw: string): InkLine {
  const line = (raw ?? "").trim();
  const m = SPEAKER_RE.exec(line);
  if (!m) return { speaker: null, text: line };
  return { speaker: m[1].trim(), text: m[2].trim() };
}

function knotOf(path: string | null | undefined): string | null {
  if (!path) return null;
  const first = path.split(".")[0];
  return first ? first : null;
}

/** Variable names declared in the story's `global decl` block. */
function declaredVarNames(json: unknown): string[] {
  const root = (json as { root?: unknown[] } | null)?.root;
  if (!Array.isArray(root)) return [];
  const names: string[] = [];
  const walk = (v: unknown): void => {
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    if (v && typeof v === "object") {
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (k === "VAR=" && typeof val === "string") names.push(val);
        else walk(val);
      }
    }
  };
  for (const item of root) {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      walk((item as Record<string, unknown>)["global decl"]);
    }
  }
  return [...new Set(names)];
}

export class InkSession {
  private story: Story;
  private readonly startKnot: string | null;
  private readonly followDiverts: boolean;
  private readonly varNames: string[];
  private knotEnded = false;

  constructor(json: unknown, startKnot?: string, followDiverts = false) {
    const parsed = json as { inkVersion?: unknown; root?: unknown } | null;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.inkVersion == null ||
      parsed.root == null
    ) {
      throw new Error(
        "inkStory: not a compiled Ink JSON story (missing inkVersion/root)",
      );
    }
    if (startKnot) {
      const containers = (parsed.root as unknown[]).filter(
        (i): i is Record<string, unknown> =>
          !!i && typeof i === "object" && !Array.isArray(i),
      );
      const known = containers.some((c) =>
        Object.prototype.hasOwnProperty.call(c, startKnot),
      );
      if (!known) {
        throw new Error(`inkStory: knot "${startKnot}" not found in story`);
      }
    }
    // Deep-clone: a session must never share mutable state with the
    // registered JSON or with another session of the same story.
    // JSON.parse returns any, so this also keeps the inkjs call
    // type-stable regardless of the .d.ts shape.
    this.story = new Story(JSON.parse(JSON.stringify(json)));
    this.startKnot = startKnot ?? null;
    this.followDiverts = followDiverts;
    this.varNames = declaredVarNames(json);
    if (startKnot) this.story.ChoosePathString(startKnot);
  }

  private currentKnot(): string | null {
    try {
      const state = this.story.state as unknown as {
        currentPathString?: string | null;
      };
      return knotOf(state?.currentPathString);
    } catch {
      return null;
    }
  }

  get canContinue(): boolean {
    if (this.knotEnded) return false;
    if (!this.story.canContinue) return false;
    if (!this.followDiverts && this.startKnot) {
      const k = this.currentKnot();
      if (k !== null && k !== this.startKnot) {
        this.knotEnded = true;
        return false;
      }
    }
    return true;
  }

  /**
   * Next line, or null when the knot/story is done or a choice point
   * is reached. Empty continuations (logic-only steps) are skipped.
   * In knot-scoped mode a line that belongs to the next knot is
   * discarded, never shown — the divert already moved the pointer,
   * and the next beat owns that knot.
   */
  next(): InkLine | null {
    for (;;) {
      if (!this.canContinue) return null;
      const raw = this.story.Continue();
      const line = (raw ?? "").trim();
      if (line.length === 0) {
        if (!this.story.canContinue && this.story.currentChoices.length === 0) {
          return null;
        }
        continue;
      }
      if (!this.followDiverts && this.startKnot) {
        const k = this.currentKnot();
        if (k !== null && k !== this.startKnot) {
          this.knotEnded = true;
          return null;
        }
      }
      return splitSpeaker(line);
    }
  }

  /** Choices at the current choice point (empty when not at one). */
  get choices(): InkChoice[] {
    if (this.knotEnded) return [];
    return this.story.currentChoices.map((c) => ({
      index: c.index,
      text: (c.text ?? "").trim(),
    }));
  }

  choose(index: number): void {
    this.story.ChooseChoiceIndex(index);
  }

  get done(): boolean {
    return !this.canContinue && this.choices.length === 0;
  }

  getVariable(name: string): unknown {
    const vs = this.story.variablesState as unknown as Record<
      string,
      unknown
    > & {
      GetVariableWithName?: (n: string) => unknown;
      getVariableWithName?: (n: string) => unknown;
    };
    try {
      const v = vs[name];
      if (v !== undefined) return v;
    } catch {
      /* fall through to the named accessor */
    }
    try {
      if (typeof vs.GetVariableWithName === "function") {
        return vs.GetVariableWithName(name);
      }
      if (typeof vs.getVariableWithName === "function") {
        return vs.getVariableWithName(name);
      }
    } catch {
      /* fall through */
    }
    return undefined;
  }

  /** Declared story variables (clock_set, codex_get, sprint_boots). */
  get variables(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const n of this.varNames) out[n] = this.getVariable(n);
    return out;
  }
}

/**
 * Build a session, or null when the story id is unknown, the knot
 * does not exist, or the JSON is not a compiled Ink story. Callers
 * fall back to plain dialog lines on null — never an empty box.
 */
export function createInkSession(
  storyId: string,
  startKnot?: string,
  followDiverts = false,
): InkSession | null {
  const json = INK_STORIES[storyId];
  if (json == null) return null;
  try {
    return new InkSession(json, startKnot, followDiverts);
  } catch {
    return null;
  }
}
