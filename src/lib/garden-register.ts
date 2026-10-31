// S14 slice 6 — DQB2 W6 Garden register, pure library form (no host yet).
//
// Wiring-plan step: the Garden register is the control plane — every
// resident/kept life listed with its home-habitat assignment (X4's
// nameplate analogue) and zone; preferences (X3 bands) are shown through
// creatureGardenForm.ts presentation functions, which already own how a
// kept life's record is displayed. What this module does, and what it
// does not:
//
// - DOES: hold the register as pure data — one entry per resident id,
//   with a home assignment that is the ONLY hard spatial fact about
//   that resident in this module: a zone id plus an optional habitat
//   recipe id. Assign, unassign, remove, and query by zone or habitat;
//   and read whether an assigned home is recognised, against the W3
//   derived habitats cache shape (zoneId -> SolvedHabitat | null).
// - DOES (exit test): unassigned residents behave exactly as today —
//   they are listed, they carry no home, homeRecognised returns null
//   for them (no home to recognise), and no function here invents a
//   home, a zone, or a habitat for them.
// - DOES NOT: author any resident, zone, habitat, recipe, or
//   preference-band vocabulary. Resident ids, zone ids, recipe ids and
//   preference entries are all caller-supplied opaque strings; test
//   fixtures are synthetic. In particular, owner slot S3 (which kept
//   lives may hold preferences) is NOT settled here: preferences are
//   an optional caller-supplied list on the entry, never a default,
//   and this module never decides who gets one.
// - DOES NOT: touch any live path yet. This module does NOT edit
//   garden-wiring.ts (the plan's register record there is the host
//   slice's job) and does NOT touch GardenView.tsx (the plan's
//   component state is the host slice's job). Staging locks in the
//   test file assert garden-wiring.ts, GardenView.tsx and
//   phase4-garden.ts do not import this module. The creatureGardenForm
//   presentation read of preferences is likewise host work, not here.
// - DOES NOT: author Garden Level aggregation (Pokopia M5), thanks-
//   emission (X7), or any recipe/class/needs data (owner slots S1/S3).
//
// Pure: inputs are only read, never mutated. All outputs are fresh
// objects; a no-op (re-registering a listed resident, removing an
// absent resident, unassigning an unassigned resident) returns the
// input register unchanged (same reference), so a host can tell a
// real change from a no-op by reference.

import type { SolvedHabitat } from "./garden-habitats";

/** One register entry: a resident plus its (optional) home assignment. */
export interface GardenRegisterEntry {
  /** Caller-supplied resident id (opaque; no resident is named here). */
  residentId: string;
  /** Home zone id, or null when the resident has no home assigned. */
  homeZoneId: string | null;
  /** Home habitat recipe id, or null when no habitat is assigned. */
  homeRecipeId: string | null;
  /** Caller-supplied preference entries (opaque strings; see header). */
  preferences: readonly string[];
}

/** The register: resident id -> entry. */
export type GardenRegister = Record<string, GardenRegisterEntry>;

function fail(message: string): never {
  throw new Error(`garden-register: ${message}`);
}

function nonEmptyString(value: unknown, what: string): string {
  if (typeof value !== "string" || value.length === 0) fail(`${what} must be a non-empty string`);
  return value as string;
}

function validateRegister(register: GardenRegister): GardenRegister {
  if (register === null || typeof register !== "object" || Array.isArray(register)) {
    fail("register must be an object");
  }
  return register;
}

function copyEntry(entry: GardenRegisterEntry): GardenRegisterEntry {
  return {
    residentId: entry.residentId,
    homeZoneId: entry.homeZoneId,
    homeRecipeId: entry.homeRecipeId,
    preferences: [...entry.preferences],
  };
}

function validatePreferences(value: unknown, residentId: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) fail(`preferences for resident "${residentId}" must be an array`);
  const out: string[] = [];
  for (const p of value) out.push(nonEmptyString(p, `preference for resident "${residentId}"`));
  return [...new Set(out)];
}

/** The empty register. */
export function emptyRegister(): GardenRegister {
  return {};
}

/**
 * List a resident in the register, unassigned. Re-registering a listed
 * resident returns the register unchanged (same reference); it never
 * resets that resident's home or preferences.
 */
export function registerResident(
  register: GardenRegister,
  residentId: string,
  preferences?: readonly string[],
): GardenRegister {
  validateRegister(register);
  const id = nonEmptyString(residentId, "residentId");
  if (register[id] !== undefined) return register;
  return {
    ...register,
    [id]: { residentId: id, homeZoneId: null, homeRecipeId: null, preferences: validatePreferences(preferences, id) },
  };
}

/**
 * Assign a resident's home: a zone, plus an optional habitat recipe in
 * that zone (null = zone-assigned, habitat unassigned). The resident
 * must already be listed; assigning an unlisted resident throws
 * loudly rather than inventing a listing. Assigning the exact home
 * already held returns the register unchanged.
 */
export function assignHome(
  register: GardenRegister,
  residentId: string,
  homeZoneId: string,
  homeRecipeId: string | null,
): GardenRegister {
  validateRegister(register);
  const id = nonEmptyString(residentId, "residentId");
  const zone = nonEmptyString(homeZoneId, "homeZoneId");
  const recipe =
    homeRecipeId === null ? null : nonEmptyString(homeRecipeId, "homeRecipeId");
  const entry = register[id];
  if (entry === undefined) fail(`cannot assign a home to unlisted resident "${id}"`);
  if (entry.homeZoneId === zone && entry.homeRecipeId === recipe) return register;
  return { ...register, [id]: { ...copyEntry(entry), homeZoneId: zone, homeRecipeId: recipe } };
}

/**
 * Clear a resident's home (zone and habitat both to null). The resident
 * stays listed. Unassigning an already-unassigned resident returns the
 * register unchanged. Unassigning an unlisted resident throws loudly.
 */
export function unassignHome(register: GardenRegister, residentId: string): GardenRegister {
  validateRegister(register);
  const id = nonEmptyString(residentId, "residentId");
  const entry = register[id];
  if (entry === undefined) fail(`cannot unassign an unlisted resident "${id}"`);
  if (entry.homeZoneId === null && entry.homeRecipeId === null) return register;
  return { ...register, [id]: { ...copyEntry(entry), homeZoneId: null, homeRecipeId: null } };
}

/**
 * Remove a resident from the register entirely. Removing an absent
 * resident returns the register unchanged (same reference).
 */
export function removeResident(register: GardenRegister, residentId: string): GardenRegister {
  validateRegister(register);
  const id = nonEmptyString(residentId, "residentId");
  if (register[id] === undefined) return register;
  const next = { ...register };
  delete next[id];
  return next;
}

/** Set a resident's caller-supplied preferences (replacing any prior list). */
export function setPreferences(
  register: GardenRegister,
  residentId: string,
  preferences: readonly string[],
): GardenRegister {
  validateRegister(register);
  const id = nonEmptyString(residentId, "residentId");
  const entry = register[id];
  if (entry === undefined) fail(`cannot set preferences for unlisted resident "${id}"`);
  const prefs = validatePreferences(preferences, id);
  if (
    entry.preferences.length === prefs.length &&
    entry.preferences.every((p, i) => p === prefs[i])
  ) {
    return register;
  }
  return { ...register, [id]: { ...copyEntry(entry), preferences: prefs } };
}

/** A copy of one resident's entry, or null when the resident is unlisted. */
export function homeOf(register: GardenRegister, residentId: string): GardenRegisterEntry | null {
  validateRegister(register);
  const id = nonEmptyString(residentId, "residentId");
  const entry = register[id];
  return entry === undefined ? null : copyEntry(entry);
}

/** All entries, in register order, as copies. */
export function allResidents(register: GardenRegister): GardenRegisterEntry[] {
  validateRegister(register);
  return Object.values(register).map(copyEntry);
}

/** Residents with no home assigned — listed, behaving exactly as today. */
export function unassignedResidents(register: GardenRegister): GardenRegisterEntry[] {
  return allResidents(register).filter(
    (e) => e.homeZoneId === null && e.homeRecipeId === null,
  );
}

/** Residents whose home zone is the given zone, in register order. */
export function residentsInZone(register: GardenRegister, zoneId: string): GardenRegisterEntry[] {
  const zone = nonEmptyString(zoneId, "zoneId");
  return allResidents(register).filter((e) => e.homeZoneId === zone);
}

/** Residents whose home habitat recipe is the given recipe, in register order. */
export function residentsInHabitat(
  register: GardenRegister,
  recipeId: string,
): GardenRegisterEntry[] {
  const recipe = nonEmptyString(recipeId, "recipeId");
  return allResidents(register).filter((e) => e.homeRecipeId === recipe);
}

/**
 * Whether a resident's assigned home is recognised, read against the
 * W3 derived habitats cache (zoneId -> SolvedHabitat | null):
 * - null: the resident is unlisted, or listed but unassigned (no home
 *   to recognise — not a failure, and not false);
 * - true: the home zone's solved habitat exists and its recipe id
 *   equals the assigned recipe id (or the assignment is zone-only and
 *   the zone has any recognised habitat);
 * - false: the home zone has no recognised habitat, or its solved
 *   recipe differs from the assigned one.
 * A zone-only assignment (recipe null) is recognised by any solved
 * habitat in its zone; it never claims a specific recipe.
 */
export function homeRecognised(
  register: GardenRegister,
  residentId: string,
  zoneHabitats: Readonly<Record<string, SolvedHabitat | null>>,
): boolean | null {
  validateRegister(register);
  const id = nonEmptyString(residentId, "residentId");
  const entry = register[id];
  if (entry === undefined) return null;
  if (entry.homeZoneId === null) return null;
  if (zoneHabitats === null || typeof zoneHabitats !== "object" || Array.isArray(zoneHabitats)) {
    fail("zoneHabitats must be an object");
  }
  const solved = zoneHabitats[entry.homeZoneId] ?? null;
  if (solved === null) return false;
  if (entry.homeRecipeId === null) return true;
  return solved.recipeId === entry.homeRecipeId;
}

/** Counts for a register: listed, assigned, unassigned. */
export function registerSummary(register: GardenRegister): {
  listed: number;
  assigned: number;
  unassigned: number;
} {
  const all = allResidents(register);
  const assigned = all.filter((e) => e.homeZoneId !== null).length;
  return { listed: all.length, assigned, unassigned: all.length - assigned };
}
