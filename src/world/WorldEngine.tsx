import React, { useState, useEffect, useCallback, useMemo } from "react";
import { TYPE_COLORS, calcDamage, makeBattleMon, GAME_DATA as IMPORTED_GAME_DATA } from "./GameData";
import { FULL_WORLD } from "./FullWorldMaps";
import { useGameStore } from "../store/gameStore";
import PixiWorldCanvas from "../components/game/PixiWorldCanvas";
import type { NpcWalkState } from "../components/game/PixiWorldCanvas";
import CreaturePortrait from "../components/game/CreaturePortrait";
import { PauseMenu, WorldHud } from "../components/game/GameShell";
import { DAY_TINT, DAY_AMBIENT, WEATHER_CONFIG } from "./WorldConstants";
import { deriveWorldState, checkRollover, newGameAnchor } from "../lib/worldClock";
import SaveMenu from "../components/SaveMenu";
import { saveGame, getSaves } from "../lib/saveSystem";
import { SPECIES_DB } from '../lib/species';
import { MOVES_DB } from '../lib/moves';
import { createMochii } from '../lib/engine';
import DialogueBox from "../components/game/DialogueBox";
import { isConfirmKey } from "../lib/buttonMode";
import { slotForNpc } from "../lib/humanSheets";
import { personaPresentationForNpc } from "../lib/personaDialogue";
import { applyMusic, playHealJingle, playVictoryJingle } from "../lib/musicPlacement";
import { playCry } from "../lib/cries";
import { resolveTrainerRow, rowToMapMembers } from "../lib/trainer-teams-resolver";
import { planForOutcome, commitRecipientExp, commitNextLevel, expProgressInLevel, type PayoffPlan } from "../lib/battlePayoff";
import { useBattlePayoffSequence, PayoffStatWindow } from "../components/game/BattlePayoffSequence";
import { resolveWorldMove, buildWorldAttackPresentation } from "../lib/worldMoveBridge";
import BattleSceneBackdrop from "../components/game/BattleSceneBackdrop";
import { resolveBattleScene, phaseFromLegacyPhase } from "../lib/battleBackground";
import { getStyleProfile, battleEnemyTopPct, battlePlayerBottomPct } from "../lib/styleProfiles";
import type { MoveAnimationProfile } from "../lib/moveAnimation";
import { isDoorOpen, sealedDoorText } from "../lib/doorGate";
// Creature Mode + Dual Encounters (PMD-mode package, owner orders
// 2026-10-29 ~20:12–20:17 CDT): mode swap, the companion Ranger, visible
// roamers and the engagement layer. All rules live in lib/creatureMode.ts
// (the decided battle-style rule included); bindings + area mix are data
// in data/core/encounter-modes.json. The tall-grass path below is NOT
// touched by this package — grass encounters stay exactly as they were.
import {
  swapTarget,
  nextCompanionCommand,
  effectiveCompanionCommand,
  companionFreeStep,
  encounterMixFor,
  createRoamer,
  stepRoamer,
  rangedAction,
  contactResolution,
  overworldMoveset,
  type ControlMode,
  type CompanionCommand,
  type Roamer,
} from "../lib/creatureMode";
// Ranger Companion Defence + Health (ranger-defense package, owner
// ruling 2026-10-29 ~21:21 CDT): the Ranger companion can DEFEND the
// player-creature (step in, take the hit's real damage on his own
// store-held health pool, go DOWN, need healing), DISTRACT roamers
// onto himself, and the swap locks while he is down. All rules live
// in lib/rangerDefense.ts; numbers are data (encounter-modes.json →
// rangerDefense). The Ranger still NEVER deals damage personally.
import {
  rollDefend,
  rangerDamageFromHit,
  rangerDamageFromClassicHit,
  distractRoamer,
  swapLockForRanger,
  rangerDown,
  isHostileHuman,
  humanStrikeDamage,
  HUMAN_STRIKES,
  RANGER_DEFENSE,
  type RangerHealth,
} from "../lib/rangerDefense";
import { REGULAR_ATTACK as RANGER_REGULAR_ATTACK, battlerFromMon as rangerBattlerFromMon } from "../lib/creatureMode";
import encounterModesConfig from "../data/core/encounter-modes.json";
// Stub-kill (2026-10-29): S-2 living-world director hook, S-3 field
// techniques, S-6 encounter binding, S-7 drops, S-8 honor greetings.
// Each system lives in its own module with its provenance written on
// it; this engine only calls them.
import { eligibleEvents, resolveOutcome, arcAvailability, currentArcStage, completeArcStage, routineFor, phaseForHour, WITNESSED_EVENTS, STRANGER_ARCS } from "../lib/livingWorld";
import type { DirectorContext, WitnessedEvent } from "../lib/livingWorld";
import { tableFor, rollEncounterStep } from "../lib/encounters";
import { evaluateTileGate, performedText } from "../lib/fieldTechniques";
import { rollWildHeldItem, resolveBattleEndDrop, DROP_ITEM_NAMES } from "../lib/drops";
import { greetingFor, isGreeter } from "../lib/greetings";
import { RELIC_NPCS, APPRAISAL_TERMINAL_NPC_ID, appraisalTerminalLines, appraiseCarried, recordFor, canGrantUnique, encounterRateFactor, keepsakeBand } from "../lib/itemMeaning";
import { deriveMorale, recordDeed } from "../lib/honor";
import { playCue } from "../lib/soundCues";
// Sequence build (2026-10-28): the engine now CONSUMES the movement
// config (docs/MOCHII-MOVEMENT-SYSTEM.md; the file landed with PR #66
// on its branch and is carried onto main by the sequence build). The
// follower below reads its trail model + lead selection from here —
// no movement constants are re-invented in engine code.
import movementConfig from "../data/core/movement.json";

const TILE_SIZE = 40; // match PDF size because it renders better in viewports

// ── v4 game-flow helpers (implementation choices, NOT Mars canon) ──
// Starter table order, as the lab balls appear left to right.
export const STARTER_TABLE = ['001', '004', '007', '010', '038'];
const TYPE_DISPLAY: Record<string, string> = {
  WATER: 'Water', STEEL: 'Chrome', GROUND: 'Earth', FIRE: 'Flame', GRASS: 'Grass',
};
/**
 * Hex starter choice (audit-plan CHANGE, Pokemon-derived rule):
 * Hex picks the starter whose primary type is super-effective
 * against the player's starter — the rival counter-pick rule from
 * the decomp (FireRed/HeartGold rival takes the starter strong
 * against the player's), NOT table order. Starter primary types
 * come from species.ts itself (no new mapping invented):
 *   001 Mochii WATER, 004 Razorgater WATER/STEEL,
 *   007 Tyrage GROUND, 010 Kittember FIRE, 038 Sproutle GRASS.
 * Counter table (primary-type counter, classic trio + Water>Ground):
 *   WATER (001, 004) -> GRASS 038 (Grass beats Water)
 *   GROUND (007) -> WATER 001 (Water beats Ground)
 *   FIRE (010) -> WATER 001 (Water beats Fire)
 *   GRASS (038) -> FIRE 010 (Fire beats Grass)
 * TIE-BREAK, TEMPORARY PLACEHOLDER, NOT Mars canon: where two
 * starters share the counter type (both Water starters counter
 * Ground and Fire), the FIRST Water starter in table order (001)
 * is used. Mars must give the tie-break; do not call this canon.
 * nextStarterForHex is kept below ONLY as that labelled
 * placeholder helper — it is NOT the counter-pick rule, and it
 * must not be used for Hex's team (it would pick a non-counter
 * for Tyrage -> Kittember and Sproutle -> Mochii, i.e. a starter
 * the player's type beats). Level 5 stays (rival starter at
 * level 5 in the first lab battle). The team member is built
 * from SPECIES_DB via createMochii at level 5 and converted to
 * the WorldEngine trainer-battle flat format (atk/def/spd,
 * display move names, hp/maxHp) — no stats, types or moves are
 * invented; they are the species' own data at level 5.
 */
export const HEX_COUNTER_PICK: Record<string, string> = {
  '001': '038', '004': '038', '007': '001', '010': '001', '038': '010',
};
export function nextStarterForHex(playerSpeciesId: string): string {
  // TEMPORARY PLACEHOLDER ONLY (see counter-pick comment above):
  // table-order successor, kept for reference, NOT used for Hex.
  const i = STARTER_TABLE.indexOf(playerSpeciesId);
  return STARTER_TABLE[(i + 1) % STARTER_TABLE.length];
}
export function counterPickForHex(playerSpeciesId: string): string {
  return HEX_COUNTER_PICK[playerSpeciesId] || nextStarterForHex(playerSpeciesId);
}
export function hexTeamMember(playerSpeciesId: string): any | null {
  const hexId = counterPickForHex(playerSpeciesId);
  const sp: any = SPECIES_DB[hexId];
  const m = createMochii(hexId, 5);
  if (!sp || !m) return null;
  return {
    id: m.id, speciesId: hexId, name: sp.name,
    hp: m.hp, maxHp: m.maxHp,
    atk: m.stats.atk, def: m.stats.def, spd: m.stats.spe,
    moves: m.moves.map((id: string) => MOVES_DB[id]?.name || id),
    type: TYPE_DISPLAY[sp.types[0]] || sp.types[0],
    level: 5,
  };
}
/**
 * v5.2 trainer-stat fix: map trainer teams were hand-written on the
 * old GameData scale (flat atk/def ~35-65, HP ~30-50), while a player
 * party built by createMochii uses Pokemon-style level-scaled stats
 * (Lv.5 Mochii: atk 10, def 10, HP 20). Put through the same
 * calcDamage, a hand-written Tyrage (atk 40 vs player def 10) dealt
 * 15 while the player dealt 1 — that is a scale mismatch, not a
 * damage-formula bug (the formula is unchanged). Where a map team's
 * species id AND name both match SPECIES_DB, rebuild that member
 * with createMochii at the map level, so trainer, wild and player
 * creatures all use the same stat system and the same existing
 * species base stats — no new stats invented. Members whose id/name
 * do NOT match SPECIES_DB are left on their map stats unchanged and
 * flagged in the PR body as pre-existing map-data mismatches, not
 * silently renamed. (The old example here -- Bug Catcher Rick's 016
 * Squirmite "with no SPECIES_DB entry yet" -- is stale: 016 exists
 * in species.ts since the #275 promotion, so Rick's team rebuilds.)
 */
export function trainerBattleMon(m: any): any {
  const id = m.speciesId || m.id;
  const sp: any = (SPECIES_DB as any)[id];
  if (!sp || sp.name !== m.name) return m;
  const c = createMochii(id, m.level || 5);
  if (!c) return m;
  return {
    id: m.id, speciesId: id, name: sp.name,
    hp: c.hp, maxHp: c.maxHp, currentHp: c.hp,
    atk: c.stats.atk, def: c.stats.def, spd: c.stats.spe,
    moves: c.moves.map((mid: string) => (MOVES_DB as any)[mid]?.name || mid),
    type: m.type, level: c.level,
  };
}
/**
 * Battle move bridge (v4, extended 2026-10-30 for AUDIT gap G-B):
 * WorldEngine's GAME_DATA.moves is keyed by display name ("Tackle"),
 * while a party built by createMochii carries moveIds ("TACKLE").
 * Without this bridge every player move lookup missed and the move
 * did nothing. Resolution now delegates to the WorldEngine
 * move-profile bridge (src/lib/worldMoveBridge.ts), which preserves
 * this function's damage values exactly (GameData first, then
 * MOVES_DB by id, then MOVES_DB by display name — the v5.3 fix for
 * caught creatures whose buttons carry display names) and ALSO
 * returns the move's animation profile: the registry profile for
 * MOVES_DB moves (the same one BattleView/Pixi consumes), or an
 * explicitly registered native profile for GameData-island names
 * with no MOVES_DB id ("Punch", "Jab", "Chrome Claw", …). Unknown
 * names still resolve to null — there is no generic fallback.
 */
export function resolveBattleMove(moveKey: string): { power: number; type: string; display: string; moveId: string; animProfile: MoveAnimationProfile | null } | null {
  const r = resolveWorldMove(moveKey);
  if (!r) return null;
  return { power: r.power, type: r.type, display: r.display, moveId: r.moveId, animProfile: r.profile };
}
/** Flat atk/def for calcDamage: MochiiInstance carries stats.*, not flat atk/def. */
export function battleStats(mon: any): any {
  return { ...mon, atk: mon.atk ?? mon.stats?.atk ?? 50, def: mon.def ?? mon.stats?.def ?? 50 };
}
/**
 * v5 battle-name fix: MochiiInstance carries `nickname`, NOT `name`
 * (createMochii sets nickname = species name). Battle code that read
 * bs.player.name therefore logged "undefined used Tackle!" /
 * "undefined took 4 damage!" in the v4 playtest, even though the
 * battle billboards already fell back to nickname. Resolve the
 * display name the same way everywhere: name, then nickname, then
 * the species name from SPECIES_DB. No stats, types or moves change.
 */
export function battleMonName(mon: any): string {
  if (!mon) return "Mochiichao";
  return mon.name || mon.nickname || SPECIES_DB[mon.speciesId || mon.id]?.name || "Mochiichao";
}

/**
 * Gap-fill S1 (CLOCK-FROM-POKEMON §3.4): the engine is the ONE
 * driver of the world clock. The old hook kept its own simulated
 * hour in useState (10, +1 per 15 s) and derived the phase from
 * WorldConstants.getDayPhase — a second phase producer that no
 * other system read. This hook reads the store's `worldClock`
 * anchor and derives the state from src/lib/worldClock.ts on
 * each tick, so canvas, HUD and every later consumer share one
 * phase. Return shape stays { gameHour, phase, tint, ambient }
 * compatible (phase is now the producer's gamePhase, which uses
 * the same dawn/day/dusk/night vocabulary the canvas tint table
 * already keys on), plus `state` for consumers moving over one
 * by one. Rollover: this hook is the single fan-out site — when
 * a read's dayIndex passes the anchor's lastSeenDayIndex it
 * persists the advanced marker; the daily HANDLERS themselves
 * land with their own steps, and this hook owns no daily logic.
 * Rate is preserved exactly: 4 game-minutes per real second
 * (1 game hour per 15 real seconds, the old hook's rate).
 */
export function useDayNight(tickMs = 1000) {
  const worldClock = useGameStore(s => s.worldClock);
  const setWorldClock = useGameStore(s => s.setWorldClock);
  const [tick, setTick] = useState(0);
  // Anchor an unanchored game (fresh game, or an old save with no
  // anchor field) at day 0, 10:00 — the old hook's start hour.
  useEffect(() => {
    if (!worldClock) setWorldClock(newGameAnchor(Date.now()));
  }, [worldClock, setWorldClock]);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), tickMs);
    return () => clearInterval(interval);
  }, [tickMs]);
  // Before the anchor effect lands, derive transiently from a
  // fresh day-0 10:00 anchor so the first paint is already 10:00.
  const anchor = worldClock ?? newGameAnchor(Date.now());
  const state = deriveWorldState(anchor, Date.now());
  // Rollover fan-out site (once per tick, effect — never in render).
  useEffect(() => {
    if (!worldClock) return;
    const current = deriveWorldState(worldClock, Date.now());
    const { daysPassed, nextAnchor } = checkRollover(worldClock, current);
    if (daysPassed > 0) setWorldClock(nextAnchor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
  const phase = state.gamePhase;
  return { gameHour: state.hour, phase, tint: DAY_TINT[phase], ambient: DAY_AMBIENT[phase], state };
}

export default function WorldEngine({ setView, setBattleEnemy }: { setView?: any, setBattleEnemy?: any }) {
  const gameState = useGameStore(s => s); // We need the whole state to save
  const { saveSlot, currentMap } = gameState;
  const party = useGameStore(s => s.party);
  const hasSprintBoots = useGameStore(s => s.hasSprintBoots);
  const initializeStarter = useGameStore(s => s.initializeStarter);
  const badges = useGameStore(s => s.badges);
  const wallet = useGameStore(s => s.wallet);
  const dex = useGameStore(s => s.dex);
  const completedEvents = useGameStore(s => s.completedEvents);
  const defeatedTrainers = useGameStore(s => s.defeatedTrainers);
  const gainWallet = useGameStore(s => s.gainWallet);
  const addBadge = useGameStore(s => s.addBadge);
  const updateDex = useGameStore(s => s.updateDex);
  const completeEvent = useGameStore(s => s.completeEvent);
  const defeatTrainer = useGameStore(s => s.defeatTrainer);
  const healParty = useGameStore(s => s.healParty);
  const useItem = useGameStore(s => s.useItem);
  const inventory = useGameStore(s => s.inventory);
  const techniqueFlags = useGameStore(s => s.techniqueFlags);

  const playerPos = useGameStore(s => s.playerPos);
  const playerGender = useGameStore(s => s.playerGender);
  const rivalName = useGameStore(s => s.rivalName) || 'Hex';
  const setMapState = useGameStore(s => s.setMapState);
  // BUTTON MODE (buttonMode.ts): 'l' copies A when L_EQUALS_A.
  // LR shoulders have no list to flip on the field, so they do
  // nothing here (NEED, labelled in buttonMode.ts); the pause
  // menu itself has no keyboard selection to remap (NEED).
  const buttonMode = useGameStore(s => s.settings.buttonMode);
  // Visual generation switcher: the inline arena's billboard
  // anchors resolve through the registry (Gen 5 = the master
  // top 10% / bottom 20% the Tailwind classes used to hardcode).
  const visualStyle = useGameStore(s => s.settings.visualStyle);
  const styleProfile = getStyleProfile(visualStyle);

  const [screen, setScreen] = useState("overworld"); 

  // Wiring Batch 2 (2026-10-26): world / battle music follows the live
  // screen. battle -> battle track, overworld -> world track. Other
  // screens (dialogue, menus, save) leave the current track alone, so
  // music keeps playing under pause/menus. With no world/battle file
  // on main yet, both entries are null-src silence (see music.ts) —
  // the calls land now so the tracks start the day files land.
  // Soundtrack lane (2026-10-29): placement resolves per map + battle
  // kind (musicPlacement.ts) — battles interrupt the field track with
  // the wild/trainer battle track and the field track returns after;
  // SCORE-STATE ABSENCE (Dark Forest rule) resolves to authored
  // silence. Menus/dialogue resolve "unchanged" and leave music alone.
  const [playerDir, setPlayerDir] = useState("down");
  const [playerName, setPlayerName] = useState("Netrunner");
  
  const [battleState, setBattleState] = useState<any>(null);
  // Soundtrack lane: placement effect (declared here, below
  // battleState, for the same TDZ reason as Fix 2 below).
  useEffect(() => {
    applyMusic({
      screen,
      mapId: currentMap,
      battleKind: screen === "battle" ? (battleState?.isDojo ? "dojo" : battleState?.type === "trainer" ? "trainer" : "wild") : null,
    });
  }, [screen, currentMap, battleState?.type, battleState?.isDojo]);
  // Fix 2 submenu state lives next to battleState: the battle key
  // handler (B button) references it long before doBattleAction.
  const [battleMenu, setBattleMenu] = useState<"main" | "bag" | "mend" | "party">("main");
  // v5.1: pending end-of-battle cleanup, run ONLY when the player
  // advances past the win/lose banner. Before v5.1 the "over" phase
  // auto-advanced on a 2000-2500ms timer, so a playtest that did not
  // screenshot inside that window never saw any banner — in all
  // three v5 playtest battles. The banner now blocks until the
  // player presses Continue (or Enter/Space), so it cannot be
  // missed by timing alone. No damage/catch/battle-flow change.
  const pendingBattleEndRef = React.useRef<(() => void) | null>(null);
  // Post-battle payoff (lib/battlePayoff.ts): when a foe mon faints,
  // the battle pauses in the "payoff" phase and BattlePayoffSequence
  // plays the source ritual (EXP text -> gauge -> per-level fanfare +
  // stat window -> trainer money line), player-paced. The flow that
  // used to run instantly at the faint (send out next mon / victory
  // banner) is stored in pendingPayoffRef and runs when the sequence
  // finishes — the same pending-closure pattern as the banner above.
  // Commits write the store party (the battle copies in battleState
  // are refreshed from the store when a trainer battle continues).
  const [payoffUi, setPayoffUi] = useState<{ plan: PayoffPlan; moneyText: string | null; moneyAmount: number } | null>(null);
  const pendingPayoffRef = React.useRef<(() => void) | null>(null);
  const payoffCommitExp = (idx: number, amount: number) => {
    setPlayerTeam((t: any[]) => {
      const next = [...t];
      const cur = next[idx];
      if (!cur) return t;
      const c = { ...cur, stats: { ...(cur.stats || {}) } };
      commitRecipientExp(c, amount);
      next[idx] = c;
      return next;
    });
  };
  const payoffCommitLevel = (idx: number) => {
    setPlayerTeam((t: any[]) => {
      const next = [...t];
      const cur = next[idx];
      if (!cur) return t;
      const c = { ...cur, stats: { ...(cur.stats || {}) } };
      if (!commitNextLevel(c)) return t;
      next[idx] = c;
      return next;
    });
  };
  const finishPayoff = () => {
    setPayoffUi(null);
    const fn = pendingPayoffRef.current;
    pendingPayoffRef.current = null;
    if (fn) fn();
  };
  // Payoff presentation (PRESENTATION-SPEC.md — a port, not a
  // design): the beat machine runs as a hook; this host renders its
  // display state inside its own battle scene — text in the bottom
  // panel's message tray, gauge sweep in the player databox's EXP
  // gauge, summary window over the arena. The money commit reads
  // payoffUi at fire time via a ref so the hook's callbacks stay
  // stable across renders.
  const payoffUiRef = React.useRef(payoffUi);
  payoffUiRef.current = payoffUi;
  const payoffDisplay = useBattlePayoffSequence(payoffUi?.plan ?? null, {
    moneyText: payoffUi?.moneyText ?? null,
    onCommitExp: payoffCommitExp,
    onCommitLevel: payoffCommitLevel,
    onCommitMoney: () => { const ui = payoffUiRef.current; if (ui && ui.moneyAmount > 0) setCredits((c: number) => c + ui.moneyAmount); },
    onDone: finishPayoff,
  });
  // Audit-plan blackout rule: last heal point visited (a healer
  // NPC's map), recorded when finishDialog heals. No such tracking
  // existed before this PR, so blackout used to return to the
  // current map's start and heal 30% — both removed below.
  const lastHealRef = React.useRef<{ map: string; pos: { x: number; y: number } } | null>(null);
  // Stub-kill S-2: living-world director hook state. The beat is the
  // engine's step count (the director's cooldowns read beats; a step
  // is the smallest honest beat this engine has). lwBattleRef marks
  // a trainer battle that belongs to a witnessed event, so
  // finishBattleEnd can learn its result before the generic
  // pendingBattleEnd cleanup runs.
  const lwBeatRef = React.useRef(0);
  const lwBattleRef = React.useRef<{ eventId: string; winOutcome: string; loseOutcome: string } | null>(null);
  const [lwChoice, setLwChoice] = useState<{ eventId: string; choices: { id: string; label: string; battle?: boolean }[] } | null>(null);
  // Stub-kill S-3: runtime tile changes from performed techniques
  // (smashed rocks, cut trees, pushed boulders), keyed
  // "mapId:x,y" -> tile id. Presentation + collision both read the
  // effective tile, never the authored one alone.
  const [tileOverrides, setTileOverrides] = useState<Record<string, number>>({});
  const finishBattleEnd = () => {
    // Stub-kill S-2: a witnessed event's battle resolves FIRST —
    // the outcome (and its witnessed deed) is written from the
    // battle's actual result, then the generic cleanup runs.
    const lw = lwBattleRef.current;
    if (lw) {
      lwBattleRef.current = null;
      const bs: any = battleState;
      const won = bs?.trainerTeam
        ? bs.trainerTeam.every((m: any) => (m.currentHp ?? m.hp) <= 0)
        : (bs?.player?.currentHp ?? bs?.player?.hp ?? 0) > 0;
      const st = useGameStore.getState();
      const res = resolveOutcome(
        { deedLedger: st.deedLedger, appendDeed: st.appendDeed },
        lwCtx("battle-end"),
        lw.eventId,
        won ? lw.winOutcome : lw.loseOutcome,
      );
      st.setLivingWorld(res.state);
      setDialog({ lines: [res.outcome.label] });
      setScreen("dialog");
      pendingBattleEndRef.current = null;
      return;
    }
    const fn = pendingBattleEndRef.current;
    pendingBattleEndRef.current = null;
    if (fn) fn();
  };
  const [dialog, setDialog] = useState<any>(null);
  // v4: DialogueBox owns typing/page state internally. WorldEngine
  // only keeps this ref so the on-screen A button can advance the
  // box (keyboard Enter/Space is handled inside DialogueBox).
  const dialogAdvanceRef = React.useRef<(() => void) | null>(null);

  // ── Stub-kill S-2: living-world director seam ──────────────────
  // The director (src/lib/livingWorld.ts) is pure; this seam is its
  // only engine contact: context in, outcomes out, state persisted
  // to the store field beside the deed ledger it writes into.
  const lwCtx = (beat: string, pos?: { x: number; y: number }): DirectorContext => {
    const st = useGameStore.getState();
    return {
      mapId: currentMap,
      phase: phaseForHour(gameHour),
      beat: lwBeatRef.current,
      playerPos: pos ?? playerPos,
      ledger: st.deedLedger,
      state: st.livingWorld,
    };
  };
  const lwSink = () => {
    const st = useGameStore.getState();
    return { deedLedger: st.deedLedger, appendDeed: st.appendDeed };
  };
  // Player-facing choice labels: outcome labels in the data are
  // past-tense RESULT text, unusable as verbs, so the hook authors
  // the choice wording here. The battle entry exists when the event
  // carries a win/lose outcome pair.
  const LW_CHOICE_LABELS: Record<string, string> = {
    abet: "Block the Fisher's path",
    ignore: "Keep walking",
    "side-with-cheat": "Side with the cheat",
    reunite: "Catch it and bring it back",
    "scare-off": "Scare it off",
    take: "Take the Pupbble",
  };
  // Battle content for the intervene choice. The duel's team is the
  // living-world lane's own authored battle (it shipped as the stock
  // scene tile in that lane's maps and is carried here verbatim).
  // The two runners carry NO authored battle anywhere in the lane's
  // data — their teams are hook glue, labelled as such in the
  // stub-kill KILL-LEDGER, built from creatures the surrounding data
  // already names at area-appropriate levels.
  const LW_EVENT_BATTLES: Record<string, { npcName: string; team: any[]; reward: number }> = {
    bh_duel_in_the_plaza: {
      npcName: "Street Ranger",
      team: [{ id: "004", name: "Razorgater", hp: 60, maxHp: 60, atk: 70, def: 66, spd: 50, moves: ["Chrome Claw", "Tackle"], type: "Chrome", level: 7 }],
      reward: 150,
    },
    bh_snatch_at_bay_steps: {
      npcName: "Grey-Hood Runner",
      team: [{ id: "010", name: "Kittember", hp: 40, maxHp: 40, atk: 44, def: 30, spd: 58, moves: ["Claw", "Tackle"], type: "Fire", level: 5 }],
      reward: 0,
    },
    st_cube_snatch_at_the_plex: {
      npcName: "Grab-and-Run Thief",
      team: [{ id: "019", name: "Zephling", hp: 46, maxHp: 46, atk: 48, def: 34, spd: 70, moves: ["Wind Blast", "Tackle"], type: "Flying", level: 8 }],
      reward: 0,
    },
  };
  const lwBattlePair = (ev: WitnessedEvent) => {
    const lose = ev.outcomes.find((o) => o.id === "join-lose");
    if (!lose) return null;
    const win = ev.outcomes.find((o) => o.id === "join-win" || o.id === "expose-win" || o.id === "recover");
    return win ? { win: win.id, lose: lose.id } : null;
  };
  const presentLwEvent = (ev: WitnessedEvent) => {
    setDialog({ lines: ev.scene, lwEventId: ev.id });
    setScreen("dialog");
  };
  const resolveLwChoice = (choiceId: string) => {
    if (!lwChoice) return;
    const ev = WITNESSED_EVENTS.find((e) => e.id === lwChoice.eventId);
    setLwChoice(null);
    if (!ev) { setScreen("overworld"); return; }
    if (choiceId === "__intervene") {
      const pair = lwBattlePair(ev);
      const battle = LW_EVENT_BATTLES[ev.id];
      if (!pair || !battle) { setScreen("overworld"); return; }
      lwBattleRef.current = { eventId: ev.id, winOutcome: pair.win, loseOutcome: pair.lose };
      const started = triggerTrainerBattle({ id: `lw_${ev.id}`, name: battle.npcName, battle: { team: battle.team, reward: battle.reward, badge: null } });
      if (!started) {
        lwBattleRef.current = null;
        setScreen("overworld");
      }
      return;
    }
    const st = useGameStore.getState();
    const res = resolveOutcome(lwSink(), lwCtx("choice"), ev.id, choiceId);
    st.setLivingWorld(res.state);
    setDialog({ lines: [res.outcome.label] });
    setScreen("dialog");
  };
  // Stranger-arc triggers the engine can establish: talking to (or
  // returning to) the stage's NPC, and standing on the stage's tile.
  // The fisher arc's battle-win stage names an event
  // (arc_fishers_camp) that exists in no data — the arc's own
  // interlock covers it: resolving the bay-steps snatch on the good
  // side marks the arc already-resolved, and no camp battle is
  // invented here (see KILL-LEDGER).
  const lwArcTalk = (npcId: string): string[] | null => {
    const ctx = lwCtx("talk");
    for (const arc of STRANGER_ARCS) {
      if (arcAvailability(ctx, arc.id) === "done") continue;
      const stage = currentArcStage(ctx, arc.id);
      const trig: any = (stage as any)?.trigger;
      if (stage && trig && (trig.type === "talk" || trig.type === "return") && trig.npcId === npcId) {
        const res = completeArcStage(lwSink(), ctx, arc.id);
        useGameStore.getState().setLivingWorld(res.state);
        return (stage as any).lines ?? null;
      }
    }
    return null;
  };
  const lwArcTile = (mapId: string, x: number, y: number) => {
    const ctx = lwCtx("tile", { x, y });
    for (const arc of STRANGER_ARCS) {
      const stage = currentArcStage(ctx, arc.id);
      const trig: any = (stage as any)?.trigger;
      if (stage && trig?.type === "tile" && trig.mapId === mapId && trig.x === x && trig.y === y) {
        if (trig.phases && !trig.phases.includes(ctx.phase)) continue;
        const res = completeArcStage(lwSink(), ctx, arc.id);
        useGameStore.getState().setLivingWorld(res.state);
        const lines = (stage as any).lines;
        if (lines) { setDialog({ lines }); setScreen("dialog"); }
        return true;
      }
    }
    return false;
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const [pauseOpen, setPauseOpen] = useState(false);
  const [menuTab, setMenuTab] = useState("team");
  const [notification, setNotification] = useState<any>(null);
  const [introStep, setIntroStep] = useState(0);
  const [nameInput, setNameInput] = useState("Netrunner");
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [animWalk, setAnimWalk] = useState(0);
  // Sequence build: free-running animation tick (300 ms) that drives
  // creature idle/walk-frame cycling in PixiWorldCanvas. Before this,
  // nothing re-rendered the world between player steps, so creature
  // NPCs could only ever show one frozen sheet cell (the owner's
  // named defect, 2026-10-28). 300 ms matches the Black-2
  // step/stand rhythm cadence closely enough for an idle cycle.
  const [animTick, setAnimTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setAnimTick(t => (t + 1) % 100000), 300);
    return () => clearInterval(iv);
  }, []);
  // Sprint (sequence build): B held = run, once the Sprint Boots are
  // owned (store flag, granted by Mom's dialogue). Tracked as state
  // so the held-direction interval below re-arms at the run rate.
  const [sprintHeld, setSprintHeld] = useState(false);
  useEffect(() => {
    const dn = (e: KeyboardEvent) => { if (e.key === 'b' || e.key === 'B' || e.key === 'Shift') setSprintHeld(true); };
    const up = (e: KeyboardEvent) => { if (e.key === 'b' || e.key === 'B' || e.key === 'Shift') setSprintHeld(false); };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);
  // Keyboard hold release (sequence build): the overworld keydown
  // handler now sets heldDir on arrow/WASD presses (mirroring the
  // touch D-pad); releasing any movement key clears it, like the
  // D-pad's pointer-up.
  useEffect(() => {
    const up = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) setHeldDir(null);
    };
    window.addEventListener('keyup', up);
    return () => window.removeEventListener('keyup', up);
  }, []);
  const [heldDir, setHeldDir] = useState<{dx:number, dy:number} | null>(null);

  // ── NPC MOVEMENT, PRODUCER SIDE (PR #130 seam consumer) ──
  // FireRed template (PR #130 research): each map object event
  // carries movement_type + x_radius/y_radius around its spawn
  // tile, and the engine runs face -> move one tile -> random
  // medium delay -> pick a direction -> collision check -> walk.
  // Mochiichao map fields: `movement: "wander"` + `wanderRadius`
  // (one radius, used for both axes) on NPC entries in
  // FullWorldMaps.ts. Standing is the default: battle NPCs,
  // starter balls, display creatures, and staged story NPCs
  // carry no movement field and never get a state.
  // The tick below is WorldEngine's own clock (650ms) — it does
  // NOT piggyback on animWalk, which advances only on player
  // steps. Frame alternation still follows the seam's rule
  // (odd step = step frame, even = idle, layout from the slot).
  type NpcRuntime = {
    homeX: number; homeY: number;
    x: number; y: number;
    dir: NpcWalkState["dir"];
    step: number; moving: boolean; delay: number;
  };
  const npcRuntimeRef = React.useRef<Record<string, NpcRuntime>>({});
  const [npcStates, setNpcStates] = useState<Record<string, NpcWalkState>>({});
  // Refs so the tick callback stays stable while the player
  // walks (otherwise the interval would restart on every step
  // and wandering NPCs would rarely move).
  const npcStatesRef = React.useRef<Record<string, NpcWalkState>>({});
  const playerPosRef = React.useRef(playerPos);
  const currentMapRef = React.useRef(currentMap);
  const defeatedRef = React.useRef(defeatedTrainers);
  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { defeatedRef.current = defeatedTrainers; }, [defeatedTrainers]);
  const npcFacingToDir = (facing: any): NpcWalkState["dir"] =>
    facing === "up" ? "back" : facing === "left" ? "left" : facing === "right" ? "right" : "front";
  // Reset wanderers to home on map/slot change (fresh world entry).
  useEffect(() => {
    currentMapRef.current = currentMap;
    const map: any = FULL_WORLD[currentMap] || FULL_WORLD["sector0"];
    const rt: Record<string, NpcRuntime> = {};
    const states: Record<string, NpcWalkState> = {};
    (map.npcs || []).forEach((n: any) => {
      if (n.movement !== "wander") return;
      const dir = npcFacingToDir(n.facing);
      rt[n.id] = { homeX: n.x, homeY: n.y, x: n.x, y: n.y, dir, step: 0, moving: false, delay: 1 + Math.floor(Math.random() * 3) };
      states[n.id] = { x: n.x, y: n.y, dir, moving: false, step: 0 };
    });
    npcRuntimeRef.current = rt;
    npcStatesRef.current = states;
    setNpcStates(states);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMap, saveSlot]);
  // Live position lookup: a wanderer's live tile wins over its
  // map (home) tile, so player collision, interaction, and the
  // interact prompt all agree with what the canvas renders.
  const npcAt = (x: number, y: number): any | undefined => {
    const map: any = FULL_WORLD[currentMapRef.current] || FULL_WORLD["sector0"];
    return (map.npcs || []).find((n: any) => {
      const s = npcStatesRef.current[n.id];
      return (s ? s.x : n.x) === x && (s ? s.y : n.y) === y;
    });
  };
  const npcTick = useCallback(() => {
    const map: any = FULL_WORLD[currentMapRef.current] || FULL_WORLD["sector0"];
    const rt = npcRuntimeRef.current;
    const wanderers: any[] = (map.npcs || []).filter((n: any) => n.movement === "wander" && !defeatedRef.current.includes(n.id));
    // Occupancy: static NPCs at map tiles, wanderers at live tiles.
    const occupied = new Set<string>();
    (map.npcs || []).forEach((n: any) => {
      if (defeatedRef.current.includes(n.id)) return;
      if (n.movement === "wander") return;
      occupied.add(`${n.x},${n.y}`);
    });
    wanderers.forEach((n: any) => {
      const r = rt[n.id];
      if (r) occupied.add(`${r.x},${r.y}`);
    });
    const DIRS = [
      { dx: 0, dy: 1, dir: "front" as const },
      { dx: 0, dy: -1, dir: "back" as const },
      { dx: -1, dy: 0, dir: "left" as const },
      { dx: 1, dy: 0, dir: "right" as const },
    ];
    const next: Record<string, NpcWalkState> = {};
    wanderers.forEach((n: any) => {
      const r = rt[n.id];
      if (!r) return;
      r.moving = false;
      if (r.delay > 0) {
        r.delay -= 1;
      } else {
        const d = DIRS[Math.floor(Math.random() * DIRS.length)];
        const tx = r.x + d.dx;
        const ty = r.y + d.dy;
        const radius = n.wanderRadius ?? 1;
        const tile = map.tiles?.[ty]?.[tx];
        const blocked =
          tx < 0 || ty < 0 || tx >= map.width || ty >= map.height ||
          tile === 1 || tile === 4 || tile === 2 ||
          (map.exits || []).some((e: any) => e.x === tx && e.y === ty) ||
          (map.doors || []).some((e: any) => e.x === tx && e.y === ty) ||
          occupied.has(`${tx},${ty}`) ||
          (tx === playerPosRef.current.x && ty === playerPosRef.current.y);
        if (blocked) {
          // WanderAround collision: re-face instead of walking.
          r.dir = d.dir;
          r.delay = 1 + Math.floor(Math.random() * 3);
        } else {
          occupied.delete(`${r.x},${r.y}`);
          occupied.add(`${tx},${ty}`);
          r.x = tx; r.y = ty; r.dir = d.dir; r.moving = true; r.step += 1;
          r.delay = 2 + Math.floor(Math.random() * 3);
        }
      }
      next[n.id] = { x: r.x, y: r.y, dir: r.dir, moving: r.moving, step: r.step };
    });
    npcStatesRef.current = next;
    setNpcStates(next);
  }, []);
  useEffect(() => {
    // NPCs freeze during battle, dialogue, menus, and map
    // transitions — notably, a wanderer never walks away while
    // the player is talking to it.
    if (screen !== "overworld" || pauseOpen || menuOpen || isTransitioning) return;
    const iv = setInterval(npcTick, 650);
    return () => clearInterval(iv);
  }, [screen, pauseOpen, menuOpen, isTransitioning, npcTick]);

  // Shims for backwards compatibility
  const playerTeam: any = party;
  const credits: any = wallet;
  const setPlayerTeam: any = (updater: any) => {
    useGameStore.setState(s => ({ party: typeof updater === 'function' ? updater(s.party) : updater }));
  };
  const setDex: any = (updater: any) => {
     useGameStore.setState(s => ({ dex: typeof updater === 'function' ? updater(s.dex) : updater }));
  };
  const setCompletedEvents: any = (updater: any) => {
     useGameStore.setState(s => ({ completedEvents: typeof updater === 'function' ? updater(s.completedEvents) : updater }));
  };
  const setDefeatedTrainers: any = (updater: any) => {
     useGameStore.setState(s => ({ defeatedTrainers: typeof updater === 'function' ? updater(s.defeatedTrainers) : updater }));
  };
  const setBadges: any = (updater: any) => {
     useGameStore.setState(s => ({ badges: typeof updater === 'function' ? updater(s.badges) : updater }));
  };
  const setCredits: any = (updater: any) => {
     useGameStore.setState(s => ({ wallet: typeof updater === 'function' ? updater(s.wallet) : updater }));
  };
  const GAME_DATA: any = {
    starters: [
      { id: "001", type: "Water", desc: "A soft, wave-patterned creature. It bounces instead of walking.", color: "#4fc3f7", name: "Mochii", hp: 45, atk: 49, def: 49, spd: 45 },
      { id: "004", type: "Chrome", desc: "Its razor-edged chrome plating deflects most data attacks.", color: "#b0bec5", name: "Razorgater", hp: 50, atk: 65, def: 64, spd: 43 },
      { id: "007", type: "Earth", desc: "A ground-shaking brute whose footsteps leave glowing cracks.", color: "#a5d6a7", name: "Tyrage", hp: 55, atk: 69, def: 45, spd: 34 }
    ],
    mochiichao: [],
    moves: IMPORTED_GAME_DATA.moves
  };

  const hasStarter = party.length > 0;
  const mapData = FULL_WORLD[currentMap] || FULL_WORLD['sector0'];
  // Stub-kill S-3: the canvas renders the EFFECTIVE map (authored
  // tiles + technique overrides for the current map).
  const displayMapData = useMemo(() => {
    const prefix = `${currentMap}:`;
    const keys = Object.keys(tileOverrides).filter((k) => k.startsWith(prefix));
    if (keys.length === 0) return mapData;
    const tiles = mapData.tiles.map((row: number[]) => [...row]);
    for (const k of keys) {
      const [x, y] = k.slice(prefix.length).split(",").map(Number);
      if (tiles[y]) tiles[y][x] = tileOverrides[k];
    }
    return { ...mapData, tiles };
  }, [mapData, tileOverrides, currentMap]);
  const effectiveTile = useCallback((x: number, y: number): number => {
    const o = tileOverrides[`${currentMap}:${x},${y}`];
    return o !== undefined ? o : mapData.tiles[y]?.[x];
  }, [tileOverrides, currentMap, mapData]);
  const { gameHour, phase, tint, ambient } = useDayNight(1000);
  // Sound-full-coverage: phase-aware placement — when the clock
  // crosses into night, the resolver swaps the field classes to
  // their night arrangements (Gen 4/5 ship night variants for
  // town/route); every other phase keeps the day track. Declared
  // here, below useDayNight, for the same TDZ reason as Fix 2.
  useEffect(() => {
    applyMusic({
      screen,
      mapId: currentMap,
      battleKind: screen === "battle" ? (battleState?.isDojo ? "dojo" : battleState?.type === "trainer" ? "trainer" : "wild") : null,
      phase,
    });
  }, [phase]);
  const weatherCfg = WEATHER_CONFIG[(mapData as any).weather ?? "clear"];

  // Playtest 2026-10-26 (attempt 6): autosaves are HELD for a START
  // OVER slot until the player saves manually — otherwise the first
  // world entry / map change already overwrote the old save the
  // dialogs promised to keep. No save, no "Game Autosaved" notice.
  const autosaveHeldForSlot = useGameStore(s => s.autosaveHeldForSlot);
  const setAutosaveHeldForSlot = useGameStore(s => s.setAutosaveHeldForSlot);
  // Tracks the last (slot, map) the map-change autosave has seen,
  // so it fires only on a real map change — never on mount, slot
  // change, or hold clear (see the map-change effect below).
  const prevMapRef = React.useRef<{ slot: number; map: string } | null>(null);
  useEffect(() => {
    // Autosave roughly every 60s
    const iv = setInterval(() => {
      if (autosaveHeldForSlot === saveSlot) return;
      // Only notify on a real write: saveGame returns null when
      // the central gate refuses an auto-write to a held slot
      // (e.g. a persisted hold restored after a reload). Notifying
      // on a refused write made a held slot look saved when it
      // was not, and hid the gate doing its job.
      const written = saveGame(saveSlot, 'auto', `AUTOSAVE - ${FULL_WORLD[currentMap]?.name || currentMap}`, useGameStore.getState());
      if (written) notify("Game Autosaved", "#88ccff");
    }, 60000);
    return () => clearInterval(iv);
  }, [saveSlot, currentMap, autosaveHeldForSlot]);

  useEffect(() => {
    // Autosave on a REAL map change only (held for a START OVER
    // slot — see above, plus the central gate in saveSystem).
    // Playtest 2026-10-26 (attempt 7): this effect used to fire on
    // mount and on every dependency change, so entering the world
    // after a LOAD immediately autosaved the loaded state back
    // with a fresh timestamp — the slot summary's content looked
    // held while its timestamp advanced, and a load-then-enter
    // autosave after a manual save would overwrite the manual
    // save's summary with the old loaded content, matching the
    // revert the playtest saw. Mount,
    // slot changes, and hold clears therefore write nothing here;
    // only an actual currentMap change does. The 60s interval
    // above still autosaves during play.
    const prev = prevMapRef.current;
    if (!prev || prev.slot !== saveSlot) {
      prevMapRef.current = { slot: saveSlot, map: currentMap };
      return;
    }
    if (prev.map === currentMap) return;
    prevMapRef.current = { slot: saveSlot, map: currentMap };
    if (autosaveHeldForSlot === saveSlot) return;
    saveGame(saveSlot, 'auto', `AUTOSAVE - Map Change`, useGameStore.getState());
  }, [saveSlot, currentMap, autosaveHeldForSlot]);

  // v4 Mom-first dialogue: on the first world entry in Sector 0 with
  // no partner yet, Mom speaks first (one DialogueBox, portrait),
  // pointing the player at the lab. It fires once (completedEvents
  // 'v4_mom_intro'), never for a loaded save that already has a
  // partner, and never again after the lab starter is chosen.
  const momIntroFired = React.useRef(false);
  useEffect(() => {
    if (momIntroFired.current) return;
    if (screen !== "overworld" || currentMap !== 'sector0' || hasStarter) return;
    if (completedEvents.includes('v4_mom_intro')) return;
    momIntroFired.current = true;
    setDialog({
      lines: [
        "Welcome home! Prof. Aeon is waiting at the lab, just north of here.",
        "Go see him before you head out — the tall grass is no place without a partner.",
        "Your journey starts in Sector 0. I will be right here when you need me.",
      ],
      isEvent: true,
      eventId: 'v4_mom_intro',
      npc: { id: "mom", name: "Mom" },
    });
    setScreen("dialog");
  }, [screen, currentMap, hasStarter, completedEvents]);

  const notify = (msg: string, color = "#ffd700") => {
    setNotification({ msg, color });
    setTimeout(() => setNotification(null), 2500);
  };

  const triggerWildBattle = useCallback((wildMonId: string, levelOverride?: number): boolean => {
    const aliveIdx = playerTeam.findIndex((m: any) => (m.currentHp ?? m.hp) > 0);
    if (aliveIdx === -1) {
      notify("You have no Mochiichao able to battle!", "#f44336");
      return false;
    }

    const playerMon = playerTeam[aliveIdx];
    const sp = SPECIES_DB[wildMonId] || Object.values(SPECIES_DB)[0];
    // Stub-kill S-6: a table-rolled encounter brings its own level
    // (the slot's rolled band). Callers without a table keep the
    // old lead-relative derivation.
    const lvl = levelOverride ?? Math.max(1, playerMon.level + Math.floor(Math.random() * 3) - 1);
    // v5.2 wild-stat fix: the old code scaled RAW base stats
    // (Lv.4 Mochii: atk 60, def 60, HP 55) while a player party uses
    // createMochii level-scaled stats (Lv.5 Mochii: atk 10, def 10,
    // HP 20) — so a wild Lv.4 dealt 19 in one hit while the player
    // dealt 1-2. Wild creatures now use createMochii at the same
    // level, i.e. the same stat system and existing species base
    // stats as the player (no new stats invented). Species NOT in
    // SPECIES_DB keep the old scaling unchanged (flagged in the PR
    // body); note the pre-existing fallback above already maps a
    // missing species id to the first SPECIES_DB entry's name.
    // v5.3: NO wild enemy may use raw base stats anymore. The v5.2
    // fallback (raw base * 1.08) was the only remaining old-scale
    // wild path in the tree — it fired for any species NOT in
    // SPECIES_DB (e.g. Zephling "016") and for any id mismatch —
    // and it reproduces the v5.2 playtest's 1-vs-18 pattern exactly
    // (old-scale atk ~60 vs level-scaled def ~10). Species in
    // SPECIES_DB (including Mochii "001") already used createMochii
    // in v5.2 and that path is unchanged; the specific v5.2 wild
    // Mochii fight could NOT be reproduced from the current tree
    // (its path already uses createMochii), so this change removes
    // the last old-scale wild route and the parent playtest must
    // re-verify wild Mochii damage in the 3-6 range — it is not
    // claimed fixed by code inspection alone. A species missing
    // from SPECIES_DB now falls back to the first entry's
    // level-scaled stats (the same fallback already used for its
    // name/type above), never to raw base stats.
    const wildBuilt = createMochii(wildMonId, lvl) || createMochii(Object.keys(SPECIES_DB)[0], lvl);
    // Stub-kill S-7: encounter generation rolls the species' drop
    // rows to fill the wild individual's held slot (src/lib/drops.ts;
    // honor's favoured half biases the roll). With today's zero-row
    // species table this is honestly always null — the system is
    // live, the content is owed.
    const heldItem = rollWildHeldItem(wildMonId, deriveMorale(useGameStore.getState().deedLedger).band.id, Math.random);
    const wildMon = {
        id: `wild_${Date.now()}`,
        speciesId: wildMonId,
        heldItem,
        name: sp.name,
        level: lvl,
        hp: wildBuilt!.hp,
        maxHp: wildBuilt!.maxHp,
        currentHp: wildBuilt!.hp,
        atk: wildBuilt!.stats.atk,
        def: wildBuilt!.stats.def,
        spd: wildBuilt!.stats.spe,
        moves: wildBuilt!.moves.map((mid: string) => (MOVES_DB as any)[mid]?.name || mid),
        type: sp.types[0],
    };

    pendingBattleEndRef.current = null;
    classicDefendsRef.current = 0; // ranger-defense: per-battle defend budget resets
    setBattleState({
      type: "wild",
      wild: wildMon,
      // v5: give the battle player a real `name` (nickname -> species
      // name); without it the log read "undefined used Tackle!".
      // v5.1 HP sync: battle copy carries BOTH hp and currentHp at
      // the same value — the store's source of truth is hp, the
      // battle's is currentHp, and letting them drift was the v5
      // playtest discrepancy (Team 20/20, next battle 6/20).
      player: { ...playerMon, name: battleMonName(playerMon), currentHp: playerMon.currentHp ?? playerMon.hp, hp: playerMon.currentHp ?? playerMon.hp },
      playerTeamIdx: aliveIdx,
      log: [`A wild ${wildMon.name} appeared!`],
      phase: "menu",
      canCatch: true,
      reward: 0
    });
    // Soundtrack lane: battle entry cries, both sides (the source
    // grammar: the wild cry sounds on appearance, yours on send-out).
    void playCry(wildMonId);
    if (playerMon.speciesId) void playCry(playerMon.speciesId);
    playCue('encounter.sting');
    setScreen("battle");
    return true;
  }, [playerTeam]);

  const triggerTrainerBattle = useCallback((npc: any): boolean => {
    const aliveIdx = playerTeam.findIndex((m: any) => (m.currentHp ?? m.hp) > 0);
    if (aliveIdx === -1) {
      notify("You have no Mochiichao able to battle!", "#f44336");
      return false;
    }
    if (!npc.battle || npc.battle.team.length === 0) return false;

    const playerMon = playerTeam[aliveIdx];
    // v4: Hex battles use the rival name from the store and the
    // counter-pick starter (hexTeamMember), not the fixed
    // Razorgater team in the map data, which contradicted the
    // player's own pick when the player chose Razorgater.
    const isHexBattle = npc.id === 'hex_battle_event' || npc.id === 'rival_hex' || npc.name === 'Hex';
    // PR C (2026-10-27): the trainer table (265 rows) is the battle's
    // team source when the NPC has a row. The row's members carry the
    // species name, so trainerBattleMon rebuilds them with real
    // createMochii stats/moves; a row whose species is missing (none
    // today) falls back to the inline map team. Hex has no row and
    // keeps the counter-pick branch above. Only two battles change
    // vs the inline teams: Master Lin 039->040 and Miner Cleff +035
    // Lv15 (see trainer-teams-resolver.ts header).
    const trainerRow = isHexBattle ? null : resolveTrainerRow(npc.name, npc.battle.team, npc.battle.reward);
    const rowMembers = trainerRow ? rowToMapMembers(trainerRow) : null;
    const battleTeam = (isHexBattle && playerMon?.speciesId)
      ? [hexTeamMember(playerMon.speciesId)].filter(Boolean)
      : (rowMembers ?? npc.battle.team).map((m: any) => trainerBattleMon(m));
    const trainerName = isHexBattle ? rivalName : npc.name;
    pendingBattleEndRef.current = null;
    classicDefendsRef.current = 0; // ranger-defense: per-battle defend budget resets
    setBattleState({
      type: "trainer",
      // ranger-defense: the villain flag rides the battle state —
      // a hostileHuman NPC may strike creatures directly (weak
      // human-scale hits) on his own turns. Ordinary NPCs: false.
      hostileHuman: isHostileHuman(npc),
      npcId: npc.id,
      trainerName,
      trainerTeam: battleTeam.map((m: any) => ({ ...m, currentHp: m.currentHp ?? m.hp, speciesId: m.speciesId || m.id })),
      trainerTeamIdx: 0,
      // v5: same name fix as the wild battle — MochiiInstance has
      // `nickname`, not `name`, so the log must not read .name raw.
      // v5.1 HP sync: see wild battle above (hp and currentHp agree).
      player: { ...playerMon, name: battleMonName(playerMon), currentHp: playerMon.currentHp ?? playerMon.hp, hp: playerMon.currentHp ?? playerMon.hp },
      playerTeamIdx: aliveIdx,
      log: [`${trainerName} wants to battle!`, `${trainerName} sent out ${battleTeam[0].name}!`],
      phase: "menu",
      canCatch: false,
      reward: rowMembers && trainerRow ? trainerRow.reward : (npc.battle.reward || 100),
      isDojo: !!npc.isDojoBoss,
      badge: npc.battle.badge
    });
    // Soundtrack lane: battle entry cries, both sides — the trainer's
    // lead creature on send-out, the player's on theirs.
    const leadFoe: any = battleTeam[0];
    if (leadFoe) void playCry(leadFoe.speciesId || leadFoe.id);
    if (playerMon.speciesId) void playCry(playerMon.speciesId);
    playCue('encounter.sting');
    setScreen("battle");
    return true;
  }, [playerTeam, rivalName]);

  const move = useCallback((dx: number, dy: number) => {
    if (screen !== "overworld" || isTransitioning) return;
    const nx = playerPos.x + dx;
    const ny = playerPos.y + dy;
    const dir = dx === 1 ? "right" : dx === -1 ? "left" : dy === 1 ? "down" : "up";
    setPlayerDir(dir);

    if (!mapData) return;
    if (nx < 0 || nx >= mapData.width || ny < 0 || ny >= mapData.height) { playCue('world.bump'); return; }

    const tile = effectiveTile(nx, ny);
    lwBeatRef.current += 1; // Stub-kill S-2: one step, one beat.
    const noclip = useGameStore.getState().noclip;
    // v5: exits and doors are checked BEFORE the solid-tile return.
    // Before v5 the solid check ran first, so any exit or door whose
    // tile was wall/building (sector0's route_1 exit row was all
    // wall) could never fire — the player simply stopped at the
    // wall, exactly the v4 playtest symptom. Exits/doors are map
    // data, not a way through ordinary walls: only the exact exit
    // and door tiles bypass the solid check.
    const exitFirst = (mapData as any).exits?.find((e: any) => e.x === nx && e.y === ny);
    if (exitFirst && !noclip) {
      playCue('world.exit');
      setIsTransitioning(true);
      setTimeout(() => {
        setMapState(exitFirst.to, exitFirst.enterAt);
        setIsTransitioning(false);
      }, 400);
      return;
    }
    const doorFirst = (mapData as any).doors?.find((d: any) => d.x === nx && d.y === ny);
    if (doorFirst && !noclip) {
      // Sequence 3 door gate: a conditioned door that is not open
      // blocks like a wall here — the player simply stays put.
      // The sealed message lives on the interact path, where the
      // player is facing the door and can read it.
      if (!isDoorOpen(doorFirst.condition, badges)) { playCue('world.bump'); return; }
      playCue('world.door');
      setMapState(currentMap, { x: nx, y: ny }); // Step on door
      setIsTransitioning(true);
      setTimeout(() => {
        setMapState(doorFirst.to, doorFirst.enterAt);
        setIsTransitioning(false);
      }, 400);
      return;
    }
    if (!noclip) {
      // Stub-kill S-3: technique gates read the HM_REQUIRED table
      // through src/lib/fieldTechniques.ts. A refused gate speaks
      // its reason and blocks; a performed tile verb changes the
      // tile and blocks this press (the effect plays, the next
      // press steps); a traverse verb (Wave / Cascade) lets the
      // step happen.
      const gate = evaluateTileGate(tile, techniqueFlags, party);
      if (gate) {
        if (gate.open === false) {
          setDialog({ lines: [gate.text] });
          setScreen("dialog");
          return;
        }
        if (gate.tech.name === "Boulder Break" || gate.tech.name === "Slice") {
          setTileOverrides((o) => ({ ...o, [`${currentMap}:${nx},${ny}`]: 3 }));
          setDialog({ lines: [performedText(gate.tech, gate.performer)] });
          setScreen("dialog");
          return;
        }
        if (gate.tech.name === "Mighty Push") {
          const bx = nx + dx, by = ny + dy;
          const beyond = effectiveTile(bx, by);
          const beyondOpen = beyond !== undefined && ![1, 2, 4, 15, 16, 17, 23, 26].includes(beyond) && !npcAt(bx, by);
          if (!beyondOpen) {
            setDialog({ lines: ["The boulder won't budge — there's no room beyond it."] });
            setScreen("dialog");
            return;
          }
          setTileOverrides((o) => ({ ...o, [`${currentMap}:${nx},${ny}`]: 3, [`${currentMap}:${bx},${by}`]: 26 }));
          setDialog({ lines: [performedText(gate.tech, gate.performer)] });
          setScreen("dialog");
          return;
        }
        // Wave / Cascade: the step proceeds onto the gated tile.
      } else if (tile === 1 || tile === 4 || tile === 2) {
        playCue('world.bump'); return; // solid (ungated)
      }
      // Basic NPC collision (solid) — live wanderer tiles win
      // over home tiles, so the player can neither walk through
      // a moved NPC nor be blocked by its empty home tile.
      const npcHere = npcAt(nx, ny);
      if (npcHere) { playCue('world.bump'); return; } // can't walk through them
    }

    // Check exits (noclip path; the normal path already handled
    // exits/doors above, before the solid check)
    const exit = (mapData as any).exits?.find((e: any) => e.x === nx && e.y === ny);
    if (exit) {
      playCue('world.exit');
      setIsTransitioning(true);
      setTimeout(() => {
        setMapState(exit.to, exit.enterAt);
        setIsTransitioning(false);
      }, 400);
      return;
    }

    // Check doors in move (auto-enter, noclip path)
    const door = (mapData as any).doors?.find((d: any) => d.x === nx && d.y === ny);
    if (door) {
      playCue('world.door');
      setMapState(currentMap, { x: nx, y: ny }); // Step on door
      setIsTransitioning(true);
      setTimeout(() => {
        setMapState(door.to, door.enterAt);
        setIsTransitioning(false);
      }, 400);
      return;
    }

    setMapState(currentMap, { x: nx, y: ny });
    playCue('world.step');
    setAnimWalk(w => (w + 1) % 4);

    // Check events
    let eventTriggered = false;
    mapData.events?.forEach(ev => {
      if (ev.x === nx && ev.y === ny && !completedEvents.includes(ev.id)) {
        let conditionMet = false;
        if (!ev.condition) conditionMet = true;
        if (ev.condition === "hasStarter" && hasStarter) conditionMet = true;
        if (ev.condition === "noStarter" && !hasStarter) conditionMet = true;

        if (conditionMet) {
          eventTriggered = true;
          const isBlocking = ev.id.startsWith("block_");
          // v4: Hex first battle — dynamic team + rival name (see
          // hexTeamMember). The map's fixed Razorgater team is only
          // a fallback when the player has no speciesId yet.
          const isHexEvent = ev.id === "hex_battle_event";
          const hexMember = isHexEvent && playerTeam[0]?.speciesId ? hexTeamMember(playerTeam[0].speciesId) : null;
          const evBattle = isHexEvent && hexMember
            ? { ...ev.battle, team: [hexMember] }
            : ev.battle;
          const evLines = (ev.dialog || []).map((l: string) => l.replace(/^Hex:/, `${rivalName}:`));
          setDialog({
            lines: evLines,
            isEvent: !isBlocking,
            eventId: ev.id,
            afterBattle: !!evBattle,
            npc: evBattle ? { ...ev.npc, battle: evBattle, id: ev.id, name: isHexEvent ? rivalName : (ev.npc?.name || "Trainer") } : undefined
          });
          setScreen("dialog");
        }
      }
    });

    if (eventTriggered && mapData.events?.find((e: any) => e.x === nx && e.y === ny)?.id.startsWith("block_")) {
      setMapState(currentMap, { x: playerPos.x, y: playerPos.y }); // Step back
    }

    // Stub-kill S-2: the living-world director evaluates after
    // every step (its seam spec: beside the map events loop). The
    // first eligible witnessed event presents its scene; stranger
    // arcs advance on their tiles. Forbidden place classes (the
    // Dark Forest) evaluate to zero events inside the director
    // itself — the refusal is the director's law, not an engine
    // special case.
    if (!eventTriggered) {
      const ev = eligibleEvents(lwCtx("step", { x: nx, y: ny }))[0];
      if (ev) {
        presentLwEvent(ev);
        eventTriggered = true;
      } else {
        lwArcTile(currentMap, nx, ny);
      }
    }

    // Stub-kill S-6: encounters roll through the core tables
    // (src/lib/encounters.ts) — the zone's own rate, weighted
    // slots, table levels. Before this, the engine read only the
    // inline zone[0], ignored its rate, picked uniformly, and
    // derived the wild's level from the player's lead.
    // NO ENCOUNTERS cheat (cheat-expansion; recorded in cheatLog when
    // toggled): while the flag is on, grass steps never roll at all —
    // the read sits at the S-6 roll site, as the expansion's landing
    // record prescribes for this tree.
    if (tile === 6 && hasStarter && !eventTriggered && !useGameStore.getState().noEncounters) {
      const baseTable = tableFor(currentMap, "grass") ?? tableFor(currentMap, "cave");
      // Item meaning S-IM1: an identified, carried relic can bend
      // this roll (the Echo Shard's one mechanical effect) — the
      // factor reads the real inventory at the step, and the table
      // itself is never edited.
      const st = useGameStore.getState();
      const factor = encounterRateFactor(st.inventory, st.identifiedItems);
      const table = baseTable && factor !== 1 && baseTable.rate != null
        ? { ...baseTable, rate: baseTable.rate * factor }
        : baseTable;
      if (table) {
        const pick = rollEncounterStep(table, Math.random);
        if (pick) {
          setIsTransitioning(true);
          setTimeout(() => {
            triggerWildBattle(pick.speciesId, pick.level);
            setIsTransitioning(false);
          }, 800);
        }
      }
    }
  }, [screen, isTransitioning, playerPos, mapData, hasStarter, defeatedTrainers, completedEvents, triggerWildBattle, badges, techniqueFlags, party, effectiveTile, currentMap, gameHour]);

  // FOLLOWER (sequence build, 2026-10-28) — consumes movement.json:
  // follower.trail.model is "command_buffer_replay": the player's
  // stepped positions are buffered and the lead creature replays
  // them one step behind. follower.trail.onWarp is
  // "clear_buffer_and_replace_behind_ranger": on a map change the
  // buffer clears, and the follower re-forms behind the player after
  // the first step on the new map. Lead selection is the config's
  // "first_alive_non_egg_else_first_non_egg" — party records carry
  // no egg state today, so: first living member, else the first
  // member. Before this, no follower existed in the engine at all.
  const trailRef = React.useRef<{ x: number, y: number }[]>([]);
  const trailMapRef = React.useRef(currentMap);
  useEffect(() => {
    if (trailMapRef.current !== currentMap) {
      trailMapRef.current = currentMap;
      trailRef.current = [];
    }
    const buf = trailRef.current;
    const head = buf[0];
    if (!head || head.x !== playerPos.x || head.y !== playerPos.y) {
      buf.unshift({ x: playerPos.x, y: playerPos.y });
      if (buf.length > 8) buf.pop();
    }
  }, [playerPos, currentMap]);
  const followerLead = party.find((m: any) => (m.currentHp ?? m.hp) > 0) || party[0];
  // Buffer depth from the config: the follower appears once the
  // buffer holds follower.trail.minBufferedSteps positions and
  // stands at the last of them (one step behind at the default 2).
  const minBuffered = Math.max(2, (movementConfig as any)?.follower?.trail?.minBufferedSteps ?? 2);
  const followerTile = trailRef.current.length >= minBuffered ? trailRef.current[minBuffered - 1] : undefined;
  const follower = (followerLead && followerTile && screen === "overworld")
    ? {
        speciesId: followerLead.speciesId,
        x: followerTile.x,
        y: followerTile.y,
        dir: followerTile.x < playerPos.x ? "right" : followerTile.x > playerPos.x ? "left" : followerTile.y < playerPos.y ? "down" : "up",
        moving: true,
      }
    : null;

  // ── Creature Mode + roamers (PMD-mode package) ──────────────────
  // Control mode: "ranger" (default, the game as it was) or "creature"
  // (you ARE the lead Mochiichao; the Ranger becomes your companion).
  const [controlMode, setControlMode] = useState<ControlMode>("ranger");
  const [companionCommand, setCompanionCommand] = useState<CompanionCommand>("follow");
  const [roamers, setRoamers] = useState<Roamer[]>([]);
  const [companionPos, setCompanionPos] = useState<{ x: number; y: number } | null>(null);
  const roamersRef = React.useRef<Roamer[]>([]);
  const companionHoldRef = React.useRef<{ x: number; y: number } | null>(null);
  // ── Ranger defence state (ranger-defense package) ──────────────
  // The pool itself lives in the STORE (persists, heals, damages
  // only through store actions). Here: the moment-grammar plate
  // (PMD partner plate — appears ONLY when he is hurt, defending,
  // distracted-upon, or down; never a permanent HUD bar, restraint
  // law), the classic-battle defend budget, and the step-in pose
  // timer (his sprite stands on your tile for the beat he takes).
  const [rangerPlate, setRangerPlate] = useState<{ hp: number; maxHp: number; down: boolean } | null>(null);
  const rangerPlateTimerRef = React.useRef<any>(null);
  const classicDefendsRef = React.useRef(0);
  const defendPoseUntilRef = React.useRef(0);
  const rangerHealthNow = (): RangerHealth => {
    const s: any = useGameStore.getState();
    return { hp: s.rangerHp ?? 0, maxHp: s.rangerMaxHp ?? 0 };
  };
  const companionPosRef = React.useRef<{ x: number; y: number } | null>(null);
  useEffect(() => { companionPosRef.current = companionPos; }, [companionPos]);
  const showRangerPlate = () => {
    const h = rangerHealthNow();
    if (h.maxHp <= 0) return;
    setRangerPlate({ hp: h.hp, maxHp: h.maxHp, down: rangerDown(h) });
    if (rangerPlateTimerRef.current) clearTimeout(rangerPlateTimerRef.current);
    rangerPlateTimerRef.current = setTimeout(() => setRangerPlate(null), 3200);
  };
  const swapLead = swapTarget(party as any[]);
  const effCompanionCommand = effectiveCompanionCommand(companionCommand, completedEvents as any, currentMap);
  const cmBindings: any = (encounterModesConfig as any).bindings || {};

  // Roamer spawn: on map entry, maps whose encounter mix includes
  // roamers get visible creatures drawn from the map's OWN encounter
  // pool (same population as the grass), standing on its grass tiles.
  useEffect(() => {
    roamersRef.current = [];
    setRoamers([]);
    if (!hasStarter) return;
    const pool = mapData.encounters?.[0]?.pool;
    const mix = encounterMixFor(currentMap, !!(pool && pool.length > 0), !!(mapData as any).interior);
    if (mix === "grass" || !pool || pool.length === 0) return;
    const grassTiles: { x: number; y: number }[] = [];
    (mapData.tiles || []).forEach((row: any[], y: number) =>
      row.forEach((t: any, x: number) => { if (t === 6) grassTiles.push({ x, y }); }),
    );
    if (grassTiles.length === 0) return;
    // Spawn near the player's entry point: visible life where you
    // arrive is the Arceus legibility lesson — a population scattered
    // across a whole map reads as an empty world.
    const here = (useGameStore.getState() as any).playerPos || { x: 0, y: 0 };
    const near = [...grassTiles].sort((a, b) =>
      (Math.abs(a.x - here.x) + Math.abs(a.y - here.y)) - (Math.abs(b.x - here.x) + Math.abs(b.y - here.y)));
    const temperaments = ["docile", "timid", "curious", "bold", "aggressive"] as const;
    const spawned: Roamer[] = [];
    const max = Math.min((encounterModesConfig as any).roamers?.maxPerMap ?? 3, pool.length);
    for (let i = 0; i < max; i++) {
      const entry: any = pool[i % pool.length];
      const spot = near[Math.min(i * 3, near.length - 1)] || near[0];
      const r = createRoamer(entry.id, entry.level || 3, spot, {
        temperament: temperaments[i % temperaments.length],
        hp: entry.hp || undefined,
      });
      (r as any).poolEntry = entry;
      spawned.push(r);
    }
    roamersRef.current = spawned;
    setRoamers(spawned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMap]);

  // Roamer heartbeat + contact. Roamers step on their own timer
  // (PMD's step-synchrony); contact resolves by the DECIDED rule in
  // lib/creatureMode.ts (battleStyleFor): ranger contact and any
  // stakes fight = the classic duel via the existing triggerWildBattle;
  // a creature-mode wild scrap resolves as a real-time exchange here.
  useEffect(() => {
    if (screen !== "overworld" || isTransitioning) return;
    const tickMs = (encounterModesConfig as any).roamers?.tickMs ?? 700;
    const iv = setInterval(() => {
      // Ranger pool: founded on the first tick the dyad exists
      // (store-derived from the lead's level band; heals/damage
      // after that flow through the store only).
      if (hasStarter) {
        const leadNow: any = swapTarget(useGameStore.getState().party as any[]);
        if (leadNow) useGameStore.getState().ensureRangerHealth(leadNow.level ?? 5);
      }
      // Companion Ranger position (creature mode), by command:
      // follow = the movement.json trail tile; wait = hold the last
      // tile; free = Bethesda sandboxing around the player (anchor).
      if (controlMode === "creature") {
        const pp0 = playerPosRef.current;
        setCompanionPos((prev) => {
          // DOWN: he does not walk. He holds the tile he fell on
          // until he is healed (the Fallout down shape).
          if (rangerDown(rangerHealthNow())) {
            return companionHoldRef.current || prev || pp0;
          }
          // The defend pose: for the beat he takes a hit, he stands
          // ON your tile — between you and the wild (see contact
          // resolution below).
          if (Date.now() < defendPoseUntilRef.current) {
            return pp0;
          }
          if (effCompanionCommand === "wait") {
            return companionHoldRef.current || prev || pp0;
          }
          if (effCompanionCommand === "free") {
            const base = prev || pp0;
            return companionFreeStep(base, pp0, Math.random).pos;
          }
          const tile = trailRef.current[Math.max(2, (movementConfig as any)?.follower?.trail?.minBufferedSteps ?? 2) - 1];
          const next = tile || prev || pp0;
          companionHoldRef.current = next;
          return next;
        });
      }
      if (roamersRef.current.length === 0) return;
      const pp = playerPosRef.current;
      let contact: Roamer | null = null;
      const next = roamersRef.current.map((r) => {
        // DISTRACTED (ranger-defense): while the Ranger holds its
        // attention, the roamer's world is HIM — it steps toward the
        // companion, spends a beat, and cannot make contact with the
        // player-creature. Attention is a counter on the record, set
        // by doDistract via lib/rangerDefense.distractRoamer.
        const beats = (r as any).distractedBeats ?? 0;
        if (beats > 0 && r.state !== "down") {
          const anchor = companionPosRef.current || pp;
          const dx = Math.sign(anchor.x - r.pos.x);
          const dy = Math.sign(anchor.y - r.pos.y);
          const stepPos = Math.abs(anchor.x - r.pos.x) >= Math.abs(anchor.y - r.pos.y) && dx !== 0
            ? { x: r.pos.x + dx, y: r.pos.y }
            : dy !== 0 ? { x: r.pos.x, y: r.pos.y + dy } : { x: r.pos.x + dx, y: r.pos.y };
          const t = mapData.tiles?.[stepPos.y]?.[stepPos.x];
          const ok = t !== undefined && t !== 1 && t !== 4 && t !== 2;
          const distracted = { ...r, pos: ok ? stepPos : r.pos, state: "approach" as const, distractedBeats: beats - 1 };
          (distracted as any).poolEntry = (r as any).poolEntry;
          return distracted;
        }
        const stepped = stepRoamer(r, pp, Math.random);
        (stepped as any).poolEntry = (r as any).poolEntry;
        // Keep roamers on walkable ground: never step onto a wall tile.
        const t = mapData.tiles?.[stepped.pos.y]?.[stepped.pos.x];
        const ok = t !== undefined && t !== 1 && t !== 4 && t !== 2;
        const kept = ok ? stepped : { ...stepped, pos: r.pos };
        if (kept.state !== "down" && kept.pos.x === pp.x && kept.pos.y === pp.y) contact = kept;
        return kept;
      });
      roamersRef.current = next;
      setRoamers(next);
      if (contact) {
        const place = (mapData as any).interior ? "cave" : "open";
        const res = contactResolution(controlMode, place as any, contact);
        if (res.style === "classic") {
          roamersRef.current = next.filter((r) => r.id !== (contact as Roamer).id);
          setRoamers(roamersRef.current);
          triggerWildBattle((contact as Roamer).speciesId);
        } else {
          // PMD skirmish exchange: your creature and the wild trade
          // one real-time blow each (battle-math via creatureMode).
          const lead: any = swapTarget(useGameStore.getState().party as any[]);
          const out = rangedAction(lead, contact as Roamer, "strike", overworldMoveset(lead, MOVES_DB as any)[0], { mode: "creature" }, Math.random);
          const updated = next.map((r) =>
            r.id === (contact as Roamer).id
              ? { ...r, hp: out.targetHp, state: out.targetHp <= 0 ? ("down" as const) : r.state }
              : r,
          );
          roamersRef.current = updated;
          setRoamers(updated);
          notify(out.note, out.targetHp <= 0 ? "#ffd700" : "#ff9966");
          // The wild's return blow — and the DEFEND beat
          // (ranger-defense): if the wild is still standing, its
          // blow comes back at your creature, and the Ranger may
          // step in and take it on his own health. One defend per
          // beat (this tick IS the beat — the budget is 1 here).
          // Party-creature HP in skirmishes stays notification-level
          // (the base package's fence — the classic battle is the HP
          // ledger); the Ranger's pool is REAL store state, so his
          // damage below is not notification-level, it persists.
          if (out.targetHp > 0) {
            const health = rangerHealthNow();
            const wildBattler = rangerBattlerFromMon({
              level: (contact as Roamer).level,
              hp: (contact as Roamer).hp,
              maxHp: (contact as Roamer).maxHp,
              stats: { atk: 10, def: 10, spa: 10, spd: 10, spe: 10 },
            });
            const defended = rollDefend(
              { command: effCompanionCommand, bondBand: 0, health, defendsSpent: 0, defendsBudget: 1 },
              Math.random,
            );
            if (defended) {
              const hit = rangerDamageFromHit(wildBattler, RANGER_REGULAR_ATTACK as any, health.maxHp, Math.random);
              const res = useGameStore.getState().damageRanger(hit.damage);
              defendPoseUntilRef.current = Date.now() + tickMs;
              showRangerPlate();
              if (res.downedNow) {
                notify(`${playerName} threw himself in front of ${lead?.nickname || lead?.name || "your partner"} — and went DOWN under the ${RANGER_REGULAR_ATTACK.name}! He needs healing.`, "#ff5252");
              } else {
                notify(`${playerName} stepped in and took the hit for ${lead?.nickname || lead?.name || "your partner"}! (-${res.dealt} HP)`, "#ffd700");
              }
            } else {
              // No defend: the blow lands on your creature —
              // bookkeeping stays notification-level per the base
              // package's fence (the classic battle is the party HP
              // ledger; only the Ranger's pool is real state here).
              notify(`The wild ${(contact as Roamer).speciesId} strikes back at ${lead?.nickname || lead?.name || "your partner"}!`, "#ff9966");
            }
          }
        }
      }
    }, tickMs);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, isTransitioning, currentMap, controlMode, companionCommand]);

  // The swap itself. OWNER SLOT: the binding is data
  // (encounter-modes.json bindings.swapControl, default KeyT) — the
  // owner's pick changes the data, never this code.
  const doModeSwap = useCallback(() => {
    if (!hasStarter || !swapLead) { notify("You need a partner first.", "#f44336"); return; }
    // Ranger-defense lock: while the Ranger is DOWN, control cannot
    // pass — he can't take the lead and he can't walk with you. The
    // reason is spoken in-fiction on the notification line (never a
    // silent no-op). Healing is the only key that opens this lock.
    const lock = swapLockForRanger(rangerHealthNow());
    if (lock.locked) { notify(lock.reason!, "#ff5252"); showRangerPlate(); return; }
    setControlMode((m) => {
      const nextMode: ControlMode = m === "ranger" ? "creature" : "ranger";
      notify(
        nextMode === "creature"
          ? `You are ${(swapLead as any).nickname || swapLead.name || "your partner"} now. The Ranger walks with you.`
          : "You are the Ranger again.",
        "#7CFC9A",
      );
      return nextMode;
    });
  }, [hasStarter, swapLead]);

  // Ranged engagement on the nearest living roamer in range.
  const doEngage = useCallback(() => {
    const range = (encounterModesConfig as any).engagement?.rangeTiles ?? 3;
    const pp = playerPosRef.current;
    const near = roamersRef.current
      .filter((r) => r.state !== "down")
      .map((r) => ({ r, d: Math.abs(r.pos.x - pp.x) + Math.abs(r.pos.y - pp.y) }))
      .filter((x) => x.d <= range)
      .sort((a, b) => a.d - b.d)[0];
    if (!near) { notify("Nothing in range.", "#aaaaaa"); return; }
    const lead: any = swapTarget(useGameStore.getState().party as any[]);
    if (controlMode === "ranger") {
      // Approach play only — a catch attempt. The Ranger never deals
      // damage personally (canon, enforced in creatureMode.ts too).
      const out = rangedAction(lead, near.r, "catchAttempt", null, { mode: "ranger" }, Math.random);
      if (out.result === "caught") {
        roamersRef.current = roamersRef.current.filter((r) => r.id !== near.r.id);
        setRoamers(roamersRef.current);
        notify(`Caught the wild ${(near.r as any).poolEntry?.name || near.r.speciesId} from range!`, "#ffd700");
      } else {
        notify(out.note, "#ff9966");
      }
    } else {
      const mv = overworldMoveset(lead, MOVES_DB as any)[0];
      const out = rangedAction(lead, near.r, "strike", mv, { mode: "creature", habitatFit: "near" }, Math.random);
      const updated = roamersRef.current.map((r) =>
        r.id === near.r.id ? { ...r, hp: out.targetHp, state: out.targetHp <= 0 ? ("down" as const) : r.state } : r,
      );
      roamersRef.current = updated;
      setRoamers(updated);
      notify(out.note, out.targetHp <= 0 ? "#ffd700" : "#ff9966");
    }
  }, [controlMode]);

  // DISTRACT (ranger-defense): creature mode only — the Ranger is
  // the companion here, and this is HIS verb: harm-free attention
  // work. The nearest roamer in range turns onto him for a few
  // beats (aggro + contact threat move to him via distractedBeats,
  // honoured in the heartbeat); if it snaps, HE pays for the noise.
  const doDistract = useCallback(() => {
    if (controlMode !== "creature") { notify("Only your companion Ranger can run interference — swap first.", "#aaaaaa"); return; }
    const health = rangerHealthNow();
    if (rangerDown(health)) { notify("He's down — he can't draw anything. Heal him first.", "#ff5252"); showRangerPlate(); return; }
    const range = RANGER_DEFENSE.distractRangeTiles;
    const pp = playerPosRef.current;
    const near = roamersRef.current
      .filter((r) => r.state !== "down")
      .map((r) => ({ r, d: Math.abs(r.pos.x - pp.x) + Math.abs(r.pos.y - pp.y) }))
      .filter((x) => x.d <= range)
      .sort((a, b) => a.d - b.d)[0];
    if (!near) { notify("Nothing near enough to distract.", "#aaaaaa"); return; }
    const out = distractRoamer(near.r, health, Math.random);
    if (out.beats > 0) {
      const updated = roamersRef.current.map((r) =>
        r.id === near.r.id ? ({ ...r, distractedBeats: out.beats } as Roamer) : r,
      );
      roamersRef.current = updated;
      setRoamers(updated);
    }
    if (out.exposureHit) {
      const res = useGameStore.getState().damageRanger(out.exposureDamage);
      showRangerPlate();
      notify(res.downedNow ? `${out.note} — and he's DOWN! He needs healing.` : out.note, "#ff9966");
    } else {
      notify(out.note, "#88ccff");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlMode]);

  // Poll for held direction movement. Sprint (sequence build): with
  // the Sprint Boots owned and B/Shift held, the interval runs at
  // the 70 ms rate — the same fast rate fastForward already proved;
  // walking stays 140 ms. Mom's dialogue promises exactly this
  // ("Hold B and you can run"); before, nothing read the key.
  useEffect(() => {
    if (!heldDir || screen !== "overworld" || isTransitioning) return;
    const interval = setInterval(() => {
      move(heldDir.dx, heldDir.dy);
    }, (useGameStore.getState().fastForward || (sprintHeld && hasSprintBoots)) ? 70 : 140);
    return () => clearInterval(interval);
  }, [heldDir, move, screen, isTransitioning, sprintHeld, hasSprintBoots]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (screen === "overworld") {
        // Sequence build: keyboard holds route through heldDir,
        // exactly like the touch D-pad (pointer down = one step +
        // heldDir; the interval above then repeats at the movement
        // config's cadence, sprint included). Before this, keyboard
        // movement relied on OS key auto-repeat alone, so the
        // Sprint Boots' B modifier could never change a keyboard
        // player's speed — the run mechanic only existed for touch.
        // Auto-repeat keydowns are ignored: the interval carries
        // the hold at the config's cadence, one step per tick.
        if (e.key.startsWith("Arrow") || ["w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
          e.preventDefault();
          if (!e.repeat) {
            if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") { move(0, -1); setHeldDir({ dx: 0, dy: -1 }); }
            if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") { move(0, 1); setHeldDir({ dx: 0, dy: 1 }); }
            if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { move(-1, 0); setHeldDir({ dx: -1, dy: 0 }); }
            if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { move(1, 0); setHeldDir({ dx: 1, dy: 0 }); }
          }
        }
        if (isConfirmKey(e, buttonMode)) {
          e.preventDefault();
          interact();
        }
        if (e.key === "Escape" || e.key === "x") {
          e.preventDefault();
          setPauseOpen(true);
        }
        if (e.key === "F5") {
          e.preventDefault();
          setAutosaveHeldForSlot(null);
          saveGame(saveSlot, 'manual', `QUICKSAVE - ${FULL_WORLD[currentMap]?.name || currentMap}`, useGameStore.getState());
          playCue('ui.save');
          notify("Game Quicksaved", "#88ccff");
        }
        if (e.key === "F9") {
          e.preventDefault();
          const autoSaves = getSaves(saveSlot).filter(s => s.type === 'auto');
          if (autoSaves.length > 0) {
            useGameStore.getState().loadState(autoSaves[0].data);
            notify("Loaded Autosave", "#88ccff");
          }
        }
        // PMD-mode keys (bindings are DATA — encounter-modes.json;
        // swapControl is the owner's slot, default KeyT).
        if (e.code === (cmBindings.swapControl?.code || "KeyT")) {
          e.preventDefault();
          doModeSwap();
        }
        if (e.code === (cmBindings.engage?.code || "KeyF")) {
          e.preventDefault();
          doEngage();
        }
        if (e.code === (cmBindings.companionCommand?.code || "KeyG")) {
          e.preventDefault();
          setCompanionCommand((c) => {
            const n = nextCompanionCommand(c);
            notify(`Companion: ${n.toUpperCase()}`, "#88ccff");
            return n;
          });
        }
        if (e.code === (cmBindings.distract?.code || "KeyH")) {
          e.preventDefault();
          doDistract();
        }
      } else if (screen === "battle" && battleState?.phase === "menu" && battleMenu !== "main") {
        // Fix 2: B button (Escape / X) backs out of an in-battle
        // submenu to the main command panel, turn untouched.
        if (e.key === "Escape" || e.key === "x" || e.key === "X") {
          e.preventDefault();
          playCue('ui.cancel');
          setBattleMenu(battleMenu === "mend" ? "bag" : "main");
        }
      } else if (screen === "battle" && battleState?.phase === "over") {
        // v5.1: the banner blocks until advanced. Enter/Space (and
        // the on-screen Continue button) advance it; without this
        // branch battle keys did nothing at all, so a keyboard-only
        // player could never leave the banner.
        if (isConfirmKey(e, buttonMode)) {
          e.preventDefault();
          finishBattleEnd();
        }
      } else if (screen === "dialog") {
        // v4: Enter/Space advance is handled inside DialogueBox
        // (typing-complete-first, then next page). Handling it here
        // as well would advance twice per press.
      } else if (screen === "save_menu") {
        if (e.key === "Escape") {
          setScreen("overworld");
        }
      } else if (screen === "menu") {
        if (e.key === "Escape" || e.key === "x" || e.key === " ") { setScreen("overworld"); }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [screen, move, dialog, playerPos, playerDir, battleState, buttonMode, battleMenu, doModeSwap, doEngage, doDistract]);

  const interact = () => {
    let dx = 0, dy = 0;
    if (playerDir === "up") dy = -1;
    if (playerDir === "down") dy = 1;
    if (playerDir === "left") dx = -1;
    if (playerDir === "right") dx = 1;
    
    const nx = playerPos.x + dx;
    const ny = playerPos.y + dy;

    let npcHere = npcAt(nx, ny);
    if (npcHere) {
      // Item meaning S-IM1: placed relic objects, the lab's
      // appraisal terminal, and the Harbor Bell's return. Dialogue
      // is computed from live state (claimed? carrying? still
      // unidentified?) and the effects resolve in finishDialog —
      // the same pattern as Mom's Sprint Boots grant below.
      const relicObj = RELIC_NPCS[npcHere.id];
      if (relicObj) {
        const evId = recordFor(relicObj.itemId)?.meaning?.placement?.eventId;
        const claimed = !!evId && completedEvents.includes(evId);
        setDialog({ lines: claimed ? relicObj.emptyLines : relicObj.findLines, npc: npcHere });
        setScreen("dialog");
        return;
      }
      if (npcHere.id === APPRAISAL_TERMINAL_NPC_ID) {
        const st = useGameStore.getState();
        setDialog({ lines: appraisalTerminalLines(st.inventory, st.identifiedItems), npc: npcHere });
        setScreen("dialog");
        return;
      }
      if (npcHere.id === "bh_net_mender"
        && (useGameStore.getState().inventory["harbor_bell"] ?? 0) > 0
        && !completedEvents.includes("relic_bell_returned")) {
        setDialog({ lines: [
          "Mending nets is just knots, all the way down. Like most honest—",
          "Wait. That knot on the rim — I'd know my own knots in the dark. That's my bell, Ranger. She went off the dock in the big storm.",
          "You dug her out of the sand? …Thank you. She belongs back at the harbor mouth, where she can be heard.",
          "(You returned the Harbor Bell.)",
        ], npc: npcHere });
        setScreen("dialog");
        return;
      }
      if (npcHere.eventId && npcHere.eventId.startsWith("pick_starter_") && hasStarter) {
        setDialog({ lines: ["You already have a partner!"], npc: npcHere });
        setScreen("dialog");
        return;
      }
      
      // dynamic setup for rival hex: counter-pick starter
      // (hexTeamMember), never mirroring the player, and the rival
      // name from the store. The old code read playerTeam[0].type
      // (a field MochiiInstance does not have) and looked the id up
      // in GameData starters (ids 1/2/3), so it always fell back to
      // a fixed Razorgater and its dialogue claimed "Razorgater,
      // obviously" even when the player had Razorgater.
      if (npcHere.id === "rival_hex" && hasStarter && playerTeam[0]?.speciesId) {
         npcHere = JSON.parse(JSON.stringify(npcHere)); // shallow clone to mutate safely
         const hexMember = hexTeamMember(playerTeam[0].speciesId);
         npcHere.name = rivalName;
         npcHere.dialog = [
           `You again? I already picked my starter. ${hexMember?.name || "Razorgater"}, obviously.`,
           "Don't think I'll go easy on you just because we grew up here.",
           "Next time we meet, we BATTLE. Count on it."
         ];
         if (hexMember) npcHere.battle.team = [hexMember];
      }

      let lines = npcHere.dialog || ["...", ""];
      // Playtest 2026-10-26 (attempt 6, pre-starter Hex soft-lock):
      // a trainer battle with no living party member used to append
      // "...Let's battle!" and, on completion, only fire a notify —
      // finishDialog never cleared the dialogue or restored the
      // overworld, so every further press re-fired the notice and
      // movement stayed blocked. Never enter the battle flow
      // without a party: show a plain, dismissible prompt instead.
      const hasLivingParty = playerTeam.some((m: any) => (m.currentHp ?? m.hp) > 0);
      if (npcHere.battle && !defeatedTrainers.includes(npcHere.id) && !hasLivingParty) {
        setDialog({ lines: [...lines, "You need a partner before you can battle. Go see Prof. Aeon at the lab, just north of here."], npc: npcHere });
      } else if (npcHere.battle && !defeatedTrainers.includes(npcHere.id)) {
        setDialog({ lines: [...lines, "...Let's battle!"], npc: npcHere, afterBattle: true });
      } else {
        if (npcHere.battle && npcHere.postBattleDialog && defeatedTrainers.includes(npcHere.id)) {
          lines = npcHere.postBattleDialog;
        }
        // Stub-kill S-2: stranger arcs advance on talk/return
        // triggers; a stage's own lines, when authored, are the
        // conversation. Ambient routines then apply: the routine's
        // lines for this phase replace the stock talk (the standing
        // variant comes free from the director when the derived
        // band is good-side — felt, never numbered).
        const arcLines = lwArcTalk(npcHere.id);
        if (arcLines) {
          lines = arcLines;
        } else {
          const routine = routineFor(npcHere.id, lwCtx("talk"));
          if (routine?.lines) lines = routine.lines;
        }
        // Stub-kill S-8: the honor greeting opener — the derived
        // band, read through honor's greetingTierForBand, colours
        // how this person opens. Human NPCs only: creature NPCs
        // (cry-line dialog) are excluded by isGreeter, and nothing
        // about the band is ever named on screen.
        if (isGreeter(npcHere)) {
          const st = useGameStore.getState();
          const g = greetingFor(npcHere, deriveMorale(st.deedLedger).band.id);
          lines = [g.line, ...lines];
        }
        setDialog({ lines, npc: npcHere, eventId: npcHere.eventId, isChoice: npcHere.isChoice });
      }
      setScreen("dialog");
      return;
    }

    // Check Doors (Sequence 3 gate: a sealed door answers, not opens)
    const door = mapData.doors?.find(d => d.x === nx && d.y === ny);
    if (door) {
      if (!isDoorOpen(door.condition, badges)) {
        playCue('ui.error');
        setDialog({ lines: [sealedDoorText(door.label, door.condition)] });
        setScreen("dialog");
        return;
      }
      playCue('world.door');
      setIsTransitioning(true);
      setTimeout(() => {
        setMapState(door.to, door.enterAt);
        setIsTransitioning(false);
      }, 400);
      return;
    }

    // Check Signs
    const sign = mapData.signs?.find(s => s.x === nx && s.y === ny);
    if (sign) {
      setDialog({ lines: [sign.text] });
      setScreen("dialog");
    }
  };

  // v4: DialogueBox owns typing + paging. This is only called when
  // the box reports the last page completed (or a choice is made via
  // handleChoice). Choice dialogues never reach here — DialogueBox
  // shows YES/NO instead of advancing.
  const finishDialog = () => {
    if (!dialog) return;
    // Stub-kill S-2: a witnessed event's scene, once read, offers
    // its choices — direct outcomes as buttons, plus the intervene
    // entry when the event carries a battle pair. The screen stays
    // "dialog" while the choice panel is up so movement stays
    // blocked; resolveLwChoice owns what happens next.
    if (dialog.lwEventId) {
      const ev = WITNESSED_EVENTS.find((e) => e.id === dialog.lwEventId);
      setDialog(null);
      if (!ev) { setScreen("overworld"); return; }
      const pair = lwBattlePair(ev);
      const choices: { id: string; label: string; battle?: boolean }[] = [];
      if (pair) choices.push({ id: "__intervene", label: "Step in and fight!", battle: true });
      for (const o of ev.outcomes) {
        if (pair && (o.id === pair.win || o.id === pair.lose)) continue;
        choices.push({ id: o.id, label: LW_CHOICE_LABELS[o.id] ?? o.id });
      }
      setLwChoice({ eventId: ev.id, choices });
      return;
    }
    // Sprint Boots grant (sequence build): Mom's dialogue hands the
    // player the boots ("Sprint Boots. Hold B and you can run" — in
    // both her sector0 and house copies, and in the canon ink's
    // mom_boots knot). Completing a Mom CONVERSATION grants the flag
    // the run mechanic reads; the toast says what changed, once —
    // later talks are her heal visits. Event dialogues are excluded:
    // the v4_mom_intro auto-dialogue also carries npc id "mom" but
    // its lines never mention the boots, so it must not grant them.
    if ((dialog.npc?.id === 'mom' || dialog.npc?.id === 'mom_house') && !dialog.isEvent && !useGameStore.getState().hasSprintBoots) {
      useGameStore.getState().setHasSprintBoots(true);
      playCue('item.get');
      // Item meaning S-IM1: the gift is also a keepsake FACT —
      // the boots' depth derives from this log at read, never
      // from a stored number (src/lib/itemMeaning.ts keepsakeBand).
      useGameStore.getState().appendKeepsakeFact({ itemId: 'sprint_boots', kind: 'received' });
      notify("Received the Sprint Boots! Hold B to run.", "#ffd700");
    }
    // Item meaning S-IM1: a placed unique enters the bag once,
    // through this one channel; the find is written as a completed
    // event so the world object goes quiet afterwards. One-of-one
    // is enforced at the grant (canGrantUnique), not by the map.
    const relicDef = dialog.npc?.id ? RELIC_NPCS[dialog.npc.id] : undefined;
    if (relicDef && !dialog.isEvent) {
      const st = useGameStore.getState();
      const evId = recordFor(relicDef.itemId)?.meaning?.placement?.eventId;
      if (evId && !st.completedEvents.includes(evId) && canGrantUnique(st.inventory, relicDef.itemId)) {
        st.addItem(relicDef.itemId);
        st.completeEvent(evId);
      }
    }
    // Item meaning S-IM1: the appraisal service — finishing a talk
    // with the lab terminal names everything carried that needed
    // naming. Facts only: the ids join identifiedItems; what each
    // item IS stays in its record.
    if (dialog.npc?.id === APPRAISAL_TERMINAL_NPC_ID && !dialog.isEvent) {
      const st = useGameStore.getState();
      for (const id of appraiseCarried(st.inventory, st.identifiedItems)) {
        st.identifyItem(id);
        notify(`Identified: ${recordFor(id)?.displayName ?? id}!`, "#ffd700");
      }
    }
    // Item meaning S-IM1: the bell comes home. The return removes
    // the unique from the bag and writes a WITNESSED deed into the
    // real ledger (deed row: return-lost-item) — prices and
    // greetings downstream read it like any other deed.
    if (dialog.npc?.id === 'bh_net_mender' && !dialog.isEvent) {
      const st = useGameStore.getState();
      if ((st.inventory['harbor_bell'] ?? 0) > 0 && !st.completedEvents.includes('relic_bell_returned')) {
        st.useItem('harbor_bell');
        st.completeEvent('relic_bell_returned');
        recordDeed(st, {
          deed: 'return-lost-item',
          subject: { individualId: 'bh_net_mender', itemId: 'harbor_bell' },
          areaId: 'sector0',
          beat: lwBeatRef.current,
          witnessedBy: ['bh_net_mender'],
        });
        notify("Returned the Harbor Bell to the Net Mender.", "#ffd700");
      }
    }
    if (dialog.isEvent && dialog.eventId) {
      setCompletedEvents(ce => [...ce, dialog.eventId]);
    }
    if (dialog.afterBattle && dialog.npc) {
      // Belt-and-braces for the pre-starter soft-lock: if no battle
      // started (no living party), the dialogue MUST close and the
      // overworld MUST return — never leave the player on a dead
      // dialogue screen with movement blocked.
      const started = triggerTrainerBattle(dialog.npc);
      if (!started) {
        setScreen("overworld");
        setDialog(null);
      }
    } else if (dialog.npc?.isShop) {
      if (setView) setView("SHOP");
      setDialog(null);
    } else if (dialog.npc?.isHeal) {
      // Ranger-defense: the heal beat includes the Ranger — one
      // line, on the game's existing notification surface, no new
      // screen (healParty restores his pool with the party's).
      const rangerBefore = rangerHealthNow();
      playCue('plex.heal');
      healParty();
      // Soundtrack lane: the heal sting is this lane's claimed jingle
      // (the source games sting the heal over the Center theme).
      playHealJingle();
      if (rangerBefore.maxHp > 0 && rangerBefore.hp < rangerBefore.maxHp) {
        notify(
          rangerDown(rangerBefore)
            ? `${playerName} is back on his feet — patched up, thanks to you.`
            : `${playerName} is patched up too.`,
          "#7CFC9A",
        );
      }
      // Record this healer's map as the blackout return point
      // (its playerStart is the map entrance, next to the healer).
      lastHealRef.current = { map: currentMap, pos: mapData.playerStart };
      setScreen("overworld");
      setDialog(null);
    } else {
      setScreen("overworld");
      setDialog(null);
    }
  };

  const handleChoice = (yes: boolean) => {
    if (yes && dialog?.eventId) {
      if (dialog.eventId === "pick_starter_001") initializeStarter("001");
      if (dialog.eventId === "pick_starter_004") initializeStarter("004");
      if (dialog.eventId === "pick_starter_007") initializeStarter("007");
      if (dialog.eventId === "pick_starter_010") initializeStarter("010");
      if (dialog.eventId === "pick_starter_038") initializeStarter("038");
      
      // v4: the gift dialogue is a real dialogue (screen dialog,
      // Aeon portrait via the npc slot), shown at this beat and
      // closed by finishDialog — the old code set the dialog but
      // never switched to the dialog screen, then timed out to
      // overworld after 500ms, so the gift lines were never seen.
      // Inventory note: the wallet starts with 10 Luigi Cubes and
      // initializeStarter adds 5, so the player now holds 15 — the
      // "gifted you 5" wording is the +5 gift, not a total of 5.
      playCue('item.get');
      setDialog({ lines: ["You chose your partner! A white flash envelopes you...", "Prof. Aeon: A fine choice!", "I've also gifted you 5 Luigi Cubes. You can use them to catch wild Mochiichao in the tall grass!", "Good luck on your journey!"], isEvent: false, npc: { id: "prof_aeon", name: "Prof. Aeon" } });
      setScreen("dialog");
    } else {
      setScreen("overworld");
      setDialog(null);
    }
  };

  // v5: the goal statement, shared by the win and loss paths. In v4
  // it was victory-only (win branch below), so a player who lost
  // the first Hex battle — the v4 playtest's final battle, which
  // closed with no banner and no goal — never heard the goal at
  // all. Win OR lose the flow continues and the route gate is
  // unaffected, so the goal is stated once either way. Mochiichao
  // words only; no Pokemon dialogue, names or towns are copied in.
  const hexGoalDialog = () => ({
    lines: [
      "Prof. Aeon: Well done! That was your first battle, and your partner did you proud.",
      "Here is your MochiDex — it records every Mochiichao you meet and catch.",
      "Now, your goal: visit the dojos across the Mainframe Region, beat Champion Mythar, and stop the Hackers and the Syndicate.",
      "Route 1.0 is open. Your first town is Silicon Town — head north when you are ready.",
    ],
    isEvent: true,
    eventId: 'v4_hex_goal',
    npc: { id: "prof_aeon", name: "Prof. Aeon" },
  });

  const doEnemyTurn = (bs: any) => {
    // Four-fixes lane (Fix 2): read the party FRESH from the store.
    // playerTeam is a render-time alias of the same array, but a
    // battle action taken this turn (a Mend Patch heal, below) writes
    // the store first; building the post-turn team from the stale
    // render array would silently undo that heal when this function
    // writes the team back.
    const freshTeam: any[] = (useGameStore.getState().party as any) || playerTeam;
    const enemy = bs.type === "wild" ? bs.wild : bs.trainerTeam[bs.trainerTeamIdx];
    // v5.2: an empty moves array is truthy, so the old fallback
    // never fired and chosenMove came out undefined (power-40 move
    // with no display name). Empty now falls back to Tackle too.
    const moves = enemy.moves && enemy.moves.length > 0 ? enemy.moves : ["Tackle"];
    const chosenMove = moves[Math.floor(Math.random() * moves.length)];
    // v4 bridge: enemy moves may be moveIds (wild/species teams) or
    // display names (map teams); resolve both, same formula.
    // G-B (2026-10-30): the old `|| { power: 40, … }` silent fallback
    // is GONE — a move that cannot resolve deals no damage and says
    // so in the log (the v5.3 player-side rule, now both sides). The
    // bridge coverage test proves every reachable name resolves, so
    // this branch is a guard, not an expected path.
    const resolvedEnemyMove = resolveBattleMove(chosenMove);
    if (!resolvedEnemyMove) {
      setBattleState({ ...bs, log: [...bs.log, `${battleMonName(enemy)} used ${chosenMove}!`, `But it could not be resolved — no damage dealt.`], phase: "menu" });
      return;
    }
    const moveData = { power: resolvedEnemyMove.power, type: resolvedEnemyMove.type };
    const chosenMoveDisplay = resolvedEnemyMove.display;

    startBattleAnim("enemy", resolvedEnemyMove);

    // ── Villain humans (ranger-defense, owner exception) ─────────
    // A hostileHuman-flagged opponent sometimes doesn't order an
    // attack at all — he lunges in HIMSELF (punch / tackle). The
    // damage is human-scale through the real math (lib/
    // rangerDefense.humanStrikeDamage): feeble against a creature,
    // exactly the owner's "too weak" ruling — the evil is in the
    // trying. Unflagged battles never take this branch.
    let humanStrikeLog: string | null = null;
    let humanStrikeDmg: number | null = null;
    if ((bs as any).hostileHuman && Math.random() < 0.35) {
      const strikeId = Math.random() < 0.5 ? "HUMAN_PUNCH" : "HUMAN_TACKLE";
      humanStrikeDmg = humanStrikeDamage(enemy.level ?? 5, bs.player, strikeId as any, Math.random);
      humanStrikeLog = `${bs.trainerName} lunged in himself — ${HUMAN_STRIKES[strikeId].name}!`;
    }
    const attackLine = humanStrikeLog ?? `${battleMonName(enemy)} used ${chosenMoveDisplay}!`;


    const dmg = humanStrikeDmg ?? calcDamage(moveData, battleStats(enemy), battleStats(bs.player));

    // ── DEFEND — the classic-battle intercept (ranger-defense) ────
    // Only in creature mode is the Ranger standing beside you as a
    // companion who can step in (in Ranger mode there is no second
    // body — you ARE the Ranger). The hit's damage was computed by
    // this battle's own math above; the intercept redirects it to
    // his store-held pool (per-hit cap, lib/rangerDefense — this
    // path's formula carries no type term, so the no-chart rule for
    // a human body holds). The moment is MARKED in the battle log,
    // the only surface a classic battle speaks on. Budget: data
    // (maxDefendsPerBattle) — he is a person, not a wall.
    if (controlMode === "creature" && dmg > 0) {
      const health = rangerHealthNow();
      const defended = rollDefend(
        { command: effCompanionCommand, bondBand: 0, health, defendsSpent: classicDefendsRef.current, defendsBudget: RANGER_DEFENSE.maxDefendsPerBattle },
        Math.random,
      );
      if (defended) {
        classicDefendsRef.current += 1;
        const hit = rangerDamageFromClassicHit(dmg, health.maxHp);
        const res = useGameStore.getState().damageRanger(hit.damage);
        showRangerPlate();
        const defendLog = [
          ...bs.log,
          attackLine,
          `${playerName} threw himself in front of ${battleMonName(bs.player)}!`,
          `${playerName} took ${res.dealt} damage!`,
          ...(res.downedNow ? [`${playerName} is DOWN! He took the hit — now he needs healing.`] : []),
        ];
        setBattleState({ ...bs, log: defendLog, phase: "menu" });
        const updatedTeam = [...freshTeam];
        updatedTeam[bs.playerTeamIdx] = { ...updatedTeam[bs.playerTeamIdx], currentHp: bs.player.currentHp, hp: bs.player.currentHp };
        setPlayerTeam(updatedTeam);
        return;
      }
    }

    const newHp = Math.max(0, bs.player.currentHp - dmg);
    const newLog = [...bs.log, attackLine];
    // Sound-full-coverage: hit voice on a damaging hit (the inline
    // engine computes no type multiplier, so the plain SE_EFFECTIVE
    // class fires here; effectiveness voices live in BattleView,
    // whose resolver carries the multiplier).
    if (dmg > 0) { playCue('battle.hit'); newLog.push(`${battleMonName(bs.player)} took ${dmg} damage!`); }

    // v5.1 HP sync: battle copy keeps hp and currentHp together.
    const updatedPlayer = { ...bs.player, currentHp: newHp, hp: newHp };

    if (newHp <= 0) {
      playCue('battle.faint');
      newLog.push(`${battleMonName(bs.player)} fainted!`);
      // v5.1 HP: a mon with hp 0 and no currentHp is fainted, not
      // alive — the old check (currentHp ?? maxHp) would have
      // treated it as alive at full HP.
      const nextAlive = freshTeam.findIndex((m, i) => i > bs.playerTeamIdx && ((m.currentHp ?? m.hp) ?? m.maxHp) > 0);
      if (nextAlive === -1) {
        newLog.push("You have no more Mochiichao! You blacked out...");
        setBattleState({ ...bs, player: updatedPlayer, log: newLog, phase: "over" });
        // v5.1: banner blocks until Continue — no 2500ms timer.
        // The cleanup below is identical to the old timer body,
        // except the blackout heal now writes BOTH hp and
        // currentHp (old code wrote currentHp only, so Team
        // showed full HP while the next battle entered damaged).
        pendingBattleEndRef.current = () => {
          setBattleState(null);
          // Audit-plan blackout rule (decomp-derived, NOT the old
          // 30% heal): lose HALF the wallet, rounded down, floor
          // 0 — no cap value was verified in the decomp data
          // audited, so no cap is invented here. Return to the
          // last heal point visited (home Sector 0 if none yet:
          // Mom heals there). Do NOT heal the party on blackout:
          // fainted/damaged members stay that way until a healer
          // NPC or an item heals them. SOLO-PLAYABILITY WARNING,
          // stated plainly: a player who blacks out with an all-
          // fainted party must walk to a healer before battling
          // again; that is the decomp rule, not a softlock fix.
          // (Mars gave no blackout-heal concession percentage, so
          // the 30% heal is removed, not kept as a concession.)
          useGameStore.setState(s => ({ wallet: Math.max(0, Math.floor(s.wallet / 2)) }));
          const ret = lastHealRef.current || { map: 'sector0', pos: { x: 15, y: 18 } };
          setMapState(ret.map, ret.pos);
          notify("You blacked out and were sent back...", "#ff5252");
          // v5: goal after a loss too (see hexGoalDialog above).
          // This dialogue states the goal once, then finishDialog
          // returns to the overworld. It never re-gifts cubes.
          if (bs.npcId === 'hex_battle_event' && !completedEvents.includes('v4_hex_goal')) {
            setDialog(hexGoalDialog());
            setScreen("dialog");
          } else {
            setScreen("overworld");
          }
        };
      } else {
        playCue('battle.switch');
        newLog.push(`Go, ${battleMonName(freshTeam[nextAlive])}!`);
        const switchHp = (freshTeam[nextAlive].currentHp ?? freshTeam[nextAlive].hp) ?? freshTeam[nextAlive].maxHp;
        setBattleState({ ...bs, player: { ...freshTeam[nextAlive], name: battleMonName(freshTeam[nextAlive]), currentHp: switchHp, hp: switchHp }, playerTeamIdx: nextAlive, log: newLog, phase: "menu" });
      }
    } else {
      setBattleState({ ...bs, player: updatedPlayer, log: newLog, phase: "menu" });
      const updatedTeam = [...freshTeam];
      // v5.1 HP sync: write BOTH fields, or Team (hp) and the
      // next battle (currentHp) disagree — the v5 discrepancy.
      updatedTeam[bs.playerTeamIdx] = { ...updatedTeam[bs.playerTeamIdx], currentHp: newHp, hp: newHp };
      setPlayerTeam(updatedTeam);
    }
  };

  // Move-animation wiring (2026-10-30, gap G-B): the battle animation
  // state carries the resolved per-move PROFILE (worldMoveBridge), not
  // just a side — the billboard battle's presentation (duration,
  // delivery, cadence, FX) is built from that profile in the render,
  // the same inputs BattleView passes to the Pixi canvas.
  const [battleAnim, setBattleAnim] = useState<{ side: "player" | "enemy"; profile: MoveAnimationProfile; moveId: string; display: string; power: number; nonce: number } | null>(null);
  const startBattleAnim = (side: "player" | "enemy", resolved: { animProfile: MoveAnimationProfile | null; moveId: string; display: string; power: number }): number => {
    if (!resolved.animProfile) return 500;
    const a = { side, profile: resolved.animProfile, moveId: resolved.moveId, display: resolved.display, power: resolved.power, nonce: Date.now() + Math.floor(Math.random() * 1000) };
    setBattleAnim(a);
    const dur = resolved.animProfile.timelineMs.total;
    setTimeout(() => setBattleAnim(cur => (cur && cur.nonce === a.nonce ? null : cur)), dur);
    return dur;
  };

  // Four-fixes lane (Fix 2): in-battle submenus. The battle command
  // panel gains BAG and PARTY submenus next to the move grid; every
  // submenu carries a working BACK path (the on-screen BACK button,
  // or Escape / X — the game's B button) that returns to the main
  // command panel WITHOUT consuming the turn, the way Pokemon's B
  // button backs out of the bag / party screens. Choosing an item
  // target or a switch target is the action and consumes the turn.
  // (State is declared next to battleState, above.)
  useEffect(() => {
    if (!battleState || battleState.phase !== "menu") setBattleMenu("main");
  }, [battleState]);

  const doBattleAction = (action: any) => {
    if (!battleState || battleState.phase !== "menu") return;
    // Sound (2026-10-29): every battle command is a decision — one
    // confirm voice at the single dispatcher choke point.
    playCue('ui.confirm');
    const bs = { ...battleState };

    if (action.type === "run") {
      if (bs.type === "trainer") {
        playCue('ui.error');
        setBattleState({ ...bs, log: [...bs.log, "You can't run from a trainer battle!"] });
        return;
      }
      playCue('battle.flee');
      notify("Got away safely!");
      setScreen("overworld");
      setBattleState(null);
      return;
    }

    if (action.type === "catch") {
      if (!bs.canCatch) return;
      // v5.2: a thrown Luigi Cube is consumed whether it breaks or
      // succeeds — before v5.2 the catch code never touched the
      // inventory, so the Bag still showed x15 after a throw. If
      // the player has no cubes left, no throw happens at all.
      if (!useItem('luigi_cube')) {
        playCue('ui.error');
        setBattleState({ ...bs, log: [...bs.log, "You have no Luigi Cubes left!"] });
        return;
      }
      playCue('capture.throw');
      const hpRatio = bs.wild.currentHp / bs.wild.maxHp;
      const catchRate = 0.7 - hpRatio * 0.5;
      // PERFECT CATCH cheat (cheat-expansion; recorded in cheatLog
      // when toggled): while on, every throw succeeds; the cube is
      // still consumed by the useItem call above, as normal.
      const success = useGameStore.getState().guaranteedCatch || Math.random() < catchRate;
      if (success) {
        // v5.3: a caught mon must be a real MochiiInstance, not the
        // flat wild-battle shape. The flat shape has no stats.* and
        // no pp, so RosterView (current.stats.atk, current.pp[j])
        // threw on a caught Sproutle and the Team panel went black
        // in the v5.2 playtest. Rebuild via createMochii at the wild
        // level (same species data, no stats invented) and keep
        // the wild's remaining HP, so a damaged catch stays damaged.
        // Caught moves therefore become moveIds again, which also
        // fixes the PWR- display-name resolution for caught mons.
        const built = createMochii(bs.wild.speciesId, bs.wild.level || 5);
        const caught = built
          ? { ...built, hp: bs.wild.currentHp, currentHp: bs.wild.currentHp }
          : { ...bs.wild, currentHp: bs.wild.currentHp, hp: bs.wild.currentHp };
        setPlayerTeam(t => t.length < 6 ? [...t, caught] : t);
        // GAP-FILL S0 (G-8 dex-key fix): the dex is keyed by speciesId
        // (DexView.statusOf + gameStore.addMochii both read speciesId).
        // caught.id is a generated instance id (createMochii's
        // generateId), which no reader can resolve back to a species,
        // so keying by it orphaned the entry. caught.speciesId is
        // present on both the rebuilt instance and the wild fallback.
        setDex(d => ({ ...d, [caught.speciesId]: "caught" }));
        // The lock click, then the success jingle a beat later.
        playCue('capture.click');
        setTimeout(() => playCue('capture.success'), 150);
        notify(`${caught.name} was caught!`, "#4fc3f7");
        setScreen("overworld");
        setBattleState(null);
      } else {
        // v5.1 naming: "Merkaba" appeared ONLY here (button + log)
        // and nowhere else as a canon item — Shop, Bag, Team and
        // the gift dialogue all say Luigi Cube. Renamed to the
        // in-game item name for consistency; if Mars wants Merkaba
        // as a separate item, that is a new decision, not a rename.
        // The shake the log narrates, then the break-out buzz.
        playCue('capture.wobble');
        setTimeout(() => playCue('capture.fail'), 450);
        setBattleState({ ...bs, log: [...bs.log, "The Luigi Cube shook... and broke!"], phase: "enemy_turn" });
        setTimeout(() => doEnemyTurn({ ...bs, log: [...bs.log, "The Luigi Cube shook... and broke!"] }), 1200);
      }
      return;
    }

    if (action.type === "switch") {
      // Fix 2 (PARTY submenu): a voluntary switch consumes the turn —
      // the enemy acts after the new member comes in. Backing out of
      // the submenu (battleMenu state, render side) never reaches
      // here and never consumes anything.
      const idx = action.index;
      const target: any = playerTeam[idx];
      if (idx === bs.playerTeamIdx || !target) return;
      const hp = (target.currentHp ?? target.hp) ?? target.maxHp;
      if (hp <= 0) return;
      const newLog = [...bs.log, `${battleMonName(bs.player)}, come back!`, `Go, ${battleMonName(target)}!`];
      const next = { ...bs, player: { ...target, name: battleMonName(target), currentHp: hp, hp }, playerTeamIdx: idx, log: newLog, phase: "enemy_turn" };
      setBattleState(next);
      setTimeout(() => doEnemyTurn(next), 1200);
      return;
    }

    if (action.type === "item") {
      // Fix 2 (BAG submenu): Mend Patch is the one battle-usable item
      // with a wired effect in this build (same 50 HP, same target
      // rules as BagView: damaged, non-fainted members only; fainted
      // are NOT revived). Using it consumes the turn.
      if (action.itemId !== "mend_patch") return;
      const target: any = playerTeam[action.index];
      if (!target) return;
      const cur = (target.currentHp ?? target.hp) ?? target.maxHp;
      if (cur <= 0 || cur >= target.maxHp) return;
      if (!useItem("mend_patch")) {
        setBattleState({ ...bs, log: [...bs.log, "You have no Mend Patches left!"] });
        return;
      }
      const healed = Math.min(target.maxHp, cur + 50);
      const updatedTeam = [...playerTeam];
      updatedTeam[action.index] = { ...target, hp: healed, currentHp: healed };
      setPlayerTeam(updatedTeam);
      const newLog = [...bs.log, `Used a Mend Patch on ${battleMonName(target)}!`, `${battleMonName(target)} restored to ${healed}/${target.maxHp} HP.`];
      const next = { ...bs, player: action.index === bs.playerTeamIdx ? { ...bs.player, hp: healed, currentHp: healed } : bs.player, log: newLog, phase: "enemy_turn" };
      setBattleState(next);
      setTimeout(() => doEnemyTurn(next), 1200);
      return;
    }

    if (action.type === "move") {
      // v4 bridge (see resolveBattleMove): without this, a starter
      // party's moveIds never matched GAME_DATA.moves and the move
      // silently did nothing. Display name is the MOVES_DB name.
      // v5.3: a click must NEVER be silent again. If a move still
      // cannot be resolved, log it visibly and stay in the menu
      // so the player can pick another move — the v5.2 playtest
      // failure mode (click, nothing, no log) must not recur.
      const resolved = resolveBattleMove(action.move);
      if (!resolved) {
        setBattleState({ ...bs, log: [...bs.log, `${battleMonName(bs.player)} used ${action.move}!`, `But it could not be resolved — no damage dealt.`] });
        return;
      }
      const moveData = { power: resolved.power, type: resolved.type };

      const animMs = startBattleAnim("player", resolved);

      const enemyMon = bs.type === "wild" ? bs.wild : bs.trainerTeam[bs.trainerTeamIdx];
      const dmg = calcDamage(moveData, battleStats(bs.player), battleStats(enemyMon));
      const newLog = [...bs.log, `${battleMonName(bs.player)} used ${resolved.display}!`];

      const newHp = Math.max(0, enemyMon.currentHp - dmg);
      if (dmg > 0) { playCue('battle.hit'); newLog.push(`Dealt ${dmg} damage!`); }

      if (newHp <= 0) {
        playCue('battle.faint');
        newLog.push(`${enemyMon.name} fainted!`);
        if (bs.type === "wild") {
          // Stub-kill S-7: battle-end drop read — a defeated wild
          // transfers its carried item through the defeat channel,
          // once, into the real inventory. Kept individuals keep
          // theirs; fled battles transfer nothing (resolveBattleEndDrop).
          const dropItem = resolveBattleEndDrop(bs.wild.heldItem ?? null, "defeat", bs.wild.speciesId);
          if (dropItem) {
            useGameStore.getState().addItem(dropItem);
            newLog.push(`The wild ${enemyMon.name} dropped a ${DROP_ITEM_NAMES[dropItem] ?? dropItem}!`);
          }
          // Item meaning S-IM1: a won battle walked in Mom's boots
          // is a keepsake fact; when the derived band rises, the
          // rise SPEAKS in the log — the visible cue #180's
          // declaration law requires of any keepsake effect.
          {
            const kst = useGameStore.getState();
            if (kst.hasSprintBoots) {
              const before = keepsakeBand(kst.keepsakeLog, "sprint_boots").band;
              kst.appendKeepsakeFact({ itemId: "sprint_boots", kind: "battle-won-with" });
              const after = keepsakeBand(useGameStore.getState().keepsakeLog, "sprint_boots");
              if (after.band !== before) newLog.push(`The Sprint Boots feel different now. ${after.word}`);
            }
          }
          // GAP-FILL S0 (G-8 dex-key fix): same keying as the catch
          // write above — the wild battle mon carries speciesId
          // (bs.wild.speciesId), while enemyMon.id is its instance id.
          setDex(d => ({ ...d, [enemyMon.speciesId]: d[enemyMon.speciesId] === "caught" ? "caught" : "seen" }));
          // Payoff (lib/battlePayoff.ts): the source EXP sequence
          // replaces the old stub, which rolled a random XP number
          // into a `xp` field on the member that NOTHING reads (the
          // store tracks `experience`; gainExp was never called, so
          // overworld battles never levelled anyone). The finishing
          // member is the participant of record — this host runs
          // single-active battles and the game has no held items,
          // so there is no share split to model. The VICTORY banner
          // still gates the exit afterwards, unchanged (v5.1). A
          // member that cannot take a payoff (legacy flat battle
          // shape) keeps the old instant path to the banner.
          const plan = planForOutcome('foeFainted', playerTeam, { speciesId: bs.wild.speciesId, level: bs.wild.level || 5 }, { participants: [bs.playerTeamIdx], activeIndex: bs.playerTeamIdx, trainerBattle: false, endsBattle: true, expMultiplier: useGameStore.getState().expMultiplier });
          // Sound composition (2026-10-29): the wild-win jingle
          // (MUS_VICTORY_WILD slot) fires as the payoff sequence
          // opens — one seat covers the sequence path and the
          // no-recipients fallback below.
          playVictoryJingle('wild');
          if (plan.recipients.length > 0) {
            setBattleState({ ...bs, wild: { ...bs.wild, currentHp: 0 }, log: newLog, phase: "payoff" });
            pendingPayoffRef.current = () => {
              setBattleState((prev: any) => prev ? { ...prev, phase: "over" } : prev);
              // v5.1: banner blocks until Continue — no 2000ms timer.
              pendingBattleEndRef.current = () => { setScreen("overworld"); setBattleState(null); };
            };
            setPayoffUi({ plan, moneyText: null, moneyAmount: 0 });
          } else {
            setBattleState({ ...bs, wild: { ...bs.wild, currentHp: 0 }, log: newLog, phase: "over" });
            // v5.1: banner blocks until Continue — no 2000ms timer.
            pendingBattleEndRef.current = () => { setScreen("overworld"); setBattleState(null); };
          }
        } else {
          const newTeam = [...bs.trainerTeam];
          newTeam[bs.trainerTeamIdx] = { ...enemyMon, currentHp: 0 };
          const nextAlive = newTeam.findIndex((m, i) => i > bs.trainerTeamIdx && m.currentHp > 0);
          const isFinalWin = nextAlive === -1;
          // Payoff (lib/battlePayoff.ts): the source runs the EXP
          // sequence PER FAINTED FOE, mid-battle too (Task_GetExp),
          // so the beats play now and the send-out / victory flow
          // below resumes when the sequence finishes. Before this,
          // trainer faints granted no XP at all, and the final win
          // credited bs.reward SILENTLY — no text anywhere. The
          // money is now the sequence's closing beat on the final
          // win ("You got {reward} Credits for winning!"); when no
          // member can take a payoff (legacy flat shape), the old
          // instant path runs unchanged, silent credit included.
          const plan = planForOutcome('foeFainted', playerTeam, { speciesId: enemyMon.speciesId || enemyMon.id, level: enemyMon.level || 5 }, { participants: [bs.playerTeamIdx], activeIndex: bs.playerTeamIdx, trainerBattle: true, endsBattle: isFinalWin, expMultiplier: useGameStore.getState().expMultiplier });
          const continueAfterPayoff = (moneyShown: boolean) => {
          if (isFinalWin) {
            // Sound composition (2026-10-29): trainer-win jingle
            // (MUS_VICTORY_TRAINER slot; dojo wins share it) at the
            // victory flow — both the sequence path and the direct
            // fallback call arrive here exactly once.
            playVictoryJingle('trainer');
            newLog.push(`${bs.trainerName} was defeated!`);
            if (bs.isDojo) { setBadges(b => [...b, bs.badge]); playCue('ritual.badge'); newLog.push(`You received the ${bs.badge}!`); }
            if (!moneyShown) setCredits(c => c + bs.reward);
            setDefeatedTrainers(dt => [...dt, bs.npcId]);
            setBattleState({ ...bs, trainerTeam: newTeam, log: newLog, phase: "over" });
            // v5.1: banner blocks until Continue — no 2500ms timer.
            // The cleanup below is identical to the old timer body.
            pendingBattleEndRef.current = () => {
              setBattleState(null);
              // v4 step 7: after the Hex first battle (win), Aeon
              // states the goal in dialogue, in order — dojos,
              // Champion Mythar, Hackers/Syndicate — not in a menu
              // header. The MochiDex + 5 Luigi Cubes were already
              // given at the starter beat (see handleChoice); this
              // dialogue names the goal, it does not re-gift.
              // Win OR lose the flow continues: a loss blacks out
              // and reaches the goal via its own branch (v5), so
              // this win branch and the loss branch share the same
              // goal dialogue; the route gate is unaffected either way.
              if (bs.npcId === 'hex_battle_event' && !completedEvents.includes('v4_hex_goal')) {
                // v5: same goal dialogue as the loss path (hexGoalDialog).
                setDialog(hexGoalDialog());
                setScreen("dialog");
              } else {
                setScreen("overworld");
              }
            };
          } else {
            playCue('battle.switch');
            newLog.push(`${bs.trainerName} sends out ${newTeam[nextAlive].name}!`);
            // Refresh the player's battle copy from the store: the
            // payoff may have levelled the member, and the rest of
            // this battle fights with the new stats/HP (in this host
            // the store member's hp tracks battle hp — doEnemyTurn
            // writes both back every turn).
            const fresh: any = (useGameStore.getState().party as any)[bs.playerTeamIdx];
            const refreshed = fresh ? { ...fresh, name: battleMonName(fresh), currentHp: fresh.hp, hp: fresh.hp } : bs.player;
            const nextBs = { ...bs, player: refreshed, trainerTeam: newTeam, trainerTeamIdx: nextAlive, log: newLog, phase: "enemy_turn" };
            setBattleState(nextBs);
            // Landing composition: move-completion's handoff rule
            // (wait max(1200, animMs) so long profiles are not cut
            // off) applied to the payoff flow's no-recipients branch.
            setTimeout(() => doEnemyTurn(nextBs), Math.max(1200, animMs));
          }
          };
          if (plan.recipients.length > 0) {
            setBattleState({ ...bs, trainerTeam: newTeam, log: newLog, phase: "payoff" });
            pendingPayoffRef.current = () => continueAfterPayoff(true);
            setPayoffUi({ plan, moneyText: isFinalWin ? `You got ${bs.reward} Credits for winning!` : null, moneyAmount: isFinalWin ? bs.reward : 0 });
          } else {
            continueAfterPayoff(false);
          }
        }
      } else {
        if (bs.type === "wild") {
          setBattleState({ ...bs, wild: { ...bs.wild, currentHp: newHp }, log: newLog, phase: "enemy_turn" });
          setTimeout(() => doEnemyTurn({ ...bs, wild: { ...bs.wild, currentHp: newHp }, log: newLog }), Math.max(1200, animMs));
        } else {
          const newTeam = [...bs.trainerTeam];
          newTeam[bs.trainerTeamIdx] = { ...enemyMon, currentHp: newHp };
          setBattleState({ ...bs, trainerTeam: newTeam, log: newLog, phase: "enemy_turn" });
          setTimeout(() => doEnemyTurn({ ...bs, trainerTeam: newTeam, log: newLog }), Math.max(1200, animMs));
        }
      }
    }
  };

  const pickStarter = (starter: any) => {
    const mon = makeBattleMon(starter, 5);
    setPlayerTeam([mon]);
    setDex({ [starter.id]: "caught" });
    setIntroStep(4);
    notify(`${starter.name} chose you!`, starter.color);
  };

  // --------------------------------------------------------
  // RENDER: TITLE OR INTRO
  // --------------------------------------------------------
  if (screen === "title") {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center overflow-hidden relative select-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(0,0,0,0.8)_100%)] z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,150,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,150,0.05)_1px,transparent_1px)] bg-[size:40px_40px] animate-[gridscroll_8s_linear_infinite]" />
        
        <div className="w-16 h-16 rotate-45 bg-teal-400/70 mb-4 z-20" />
        <h1 className="text-teal-400 text-5xl md:text-7xl font-black tracking-[0.2em] animate-[pulse_2s_ease-in-out_infinite] mb-2 z-20 drop-shadow-[0_0_20px_rgba(0,255,255,0.8)] text-center">
          MOCHIICHAO
        </h1>
        <div className="text-green-400 text-sm md:text-xl tracking-[0.4em] mb-12 z-20 font-bold">MAINFRAME REGION</div>

        <button 
          onClick={() => setScreen("intro")}
          className="z-20 bg-transparent border-2 border-teal-400 text-teal-400 text-lg px-8 py-3 tracking-[0.2em] font-bold hover:bg-teal-400/20 hover:scale-105 transition-all"
        >
          NEW GAME
        </button>
      </div>
    );
  }

  if (screen === "intro") {
    const lines = [
      { text: "Welcome to the MAINFRAME REGION.", sub: "A digital continent where Mochiichao roam free." },
      { text: "But shadows gather in the network...", sub: "An organization called THE HACKERS brands and steals Mochiichao." },
      { text: "Your journey begins now.", sub: "Choose your name, then pick your partner." },
      { text: "What is your name?", sub: "", isName: true },
      { text: `Welcome, ${playerName}!`, sub: `Now choose your first Mochiichao.`, isStarter: true },
    ];
    const line = lines[introStep];

    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="max-w-2xl text-center">
          {!line.isStarter && !line.isName && (
            <div className="animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-teal-500/40 border-4 border-teal-300 mb-6 animate-bounce" />
              <h2 className="text-teal-400 text-2xl tracking-[0.2em] mb-4">{line.text}</h2>
              <p className="text-slate-400 text-sm mb-10 tracking-widest">{line.sub}</p>
              <button 
                onClick={() => setIntroStep(s => s + 1)}
                className="bg-transparent border-2 border-teal-400 text-teal-400 px-8 py-2 tracking-[0.2em] hover:bg-teal-400/20 transition-all font-bold"
              >
                {introStep < 2 ? "CONTINUE" : "BEGIN"}
              </button>
            </div>
          )}
          {line.isName && (
            <div className="animate-fade-in">
              
              <h2 className="text-teal-400 text-xl tracking-[0.2em] mb-6">{line.text}</h2>
              <input 
                value={nameInput} 
                onChange={e => setNameInput(e.target.value)}
                className="bg-slate-900 border-2 border-teal-400 text-teal-400 px-6 py-3 text-lg tracking-[0.2em] text-center w-full max-w-sm mb-6 outline-none"
                maxLength={12} 
              />
              <br/>
              <button 
                onClick={() => { setPlayerName(nameInput || "Netrunner"); setIntroStep(s => s + 1); }}
                className="bg-teal-400 text-black px-8 py-3 tracking-[0.2em] font-black hover:bg-teal-300 transition-all"
              >
                CONFIRM
              </button>
            </div>
          )}
          {line.isStarter && (
            <div className="animate-fade-in">
              <h2 className="text-yellow-400 text-xl tracking-[0.2em] mb-2">{line.text}</h2>
              <p className="text-slate-400 text-xs mb-8 tracking-widest">{line.sub}</p>
              <div className="flex gap-6 justify-center flex-wrap">
                {GAME_DATA.starters.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => { pickStarter(s); setScreen("overworld"); }}
                    className="bg-slate-900 rounded-xl p-6 w-40 text-center hover:-translate-y-2 transition-transform duration-200 border-2 group"
                    style={{ borderColor: s.color }}
                  >
                    <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform"><CreaturePortrait speciesId={s.id} view="front" size={72} /></div>
                    <div style={{ color: s.color }} className="font-black text-lg tracking-wider mb-1">{s.name}</div>
                    <div className="text-slate-400 text-xs mb-2">{s.type} Type</div>
                    <div className="text-slate-500 text-[10px] leading-relaxed">{s.desc.substring(0, 60)}...</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // RENDER: MENUS
  // --------------------------------------------------------
  if (screen === "menu") {
    return (
      <div className="w-screen h-screen bg-slate-950 flex text-white">
        {/* Sidebar */}
        <div className="w-40 bg-black border-r-2 border-teal-500 flex flex-col py-6 items-stretch">
          <div className="text-teal-500 text-[10px] tracking-[0.3em] px-4 pb-4 border-b border-slate-800 mb-2">MOCHIIMIND</div>
          {["team", "dex", "badges", "save"].map(t => (
            <button 
              key={t} onClick={() => setMenuTab(t)}
              className={`text-left px-4 py-3 text-sm tracking-widest uppercase border-l-4 transition-colors ${menuTab === t ? 'border-teal-400 text-teal-400 bg-teal-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              {t}
            </button>
          ))}
          <div className="flex-1"/>
          <button 
            onClick={() => setScreen("overworld")}
            className="text-left px-4 py-3 text-sm tracking-widest uppercase border-t border-slate-800 text-red-400 hover:bg-red-950/30"
          >
            ✕ CLOSE
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-4">
            <div>
              <div className="text-teal-400 text-2xl font-black tracking-widest uppercase">{playerName}</div>
              <div className="text-slate-500 text-xs mt-1">{mapData?.name}</div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 text-lg">{credits} CR</div>
              <div className="text-slate-500 text-xs">{badges.length}/8 Badges</div>
            </div>
          </div>

          {menuTab === "team" && (
            <div className="animate-fade-in max-w-2xl">
              <div className="text-slate-500 text-xs tracking-[0.2em] mb-4">ACTIVE TEAM ({playerTeam.length}/6)</div>
              {playerTeam.map((m, i) => {
                // v5.1 HP: store source of truth is hp; currentHp
                // is the battle copy. After the v5.1 sync both
                // agree, but display hp first so Team can never
                // show a stale battle copy.
                const hp = m.hp ?? m.currentHp ?? m.maxHp;
                const hpPct = (hp / m.maxHp) * 100;
                const tc = TYPE_COLORS[m.type] || "#888";
                return (
                  <div key={i} className="bg-slate-900 border rounded-xl p-4 mb-3 flex items-center gap-6" style={{ borderColor: `${tc}44` }}>
                    <div style={{ filter: `drop-shadow(0 0 10px ${tc})` }}><CreaturePortrait speciesId={m.speciesId || m.id} view="front" size={56} /></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-white font-bold text-lg">{m.name}</span>
                        <span className="text-slate-400 text-xs tracking-wider">Lv.{m.level}</span>
                      </div>
                      <div className="text-[10px] uppercase font-bold tracking-widest mb-3" style={{ color: tc }}>{m.type} TYPE</div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-slate-500 text-[10px]">HP</span>
                        <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${hpPct}%`, background: hpPct > 50 ? "#4caf50" : hpPct > 20 ? "#ff9800" : "#f44336" }} />
                        </div>
                        <span className="text-slate-400 text-[10px] w-8 text-right">{hp}/{m.maxHp}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {menuTab === "dex" && (
            <div className="animate-fade-in">
              <div className="text-slate-500 text-xs tracking-[0.2em] mb-4">MOCHIICHAO DEX — {Object.keys(dex).length} SET</div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {GAME_DATA.mochiichao.concat(GAME_DATA.starters).map(m => {
                  const status = dex[m.id];
                  const tc = TYPE_COLORS[m.type] || "#888";
                  if (!status) return null; // hide unknown for now to keep UI clean, or show silhouettes
                  return (
                    <div key={m.id} className="bg-slate-900 border rounded-lg p-3 text-center" style={{ borderColor: `${tc}44` }}>
                      <div className="mb-2 flex justify-center"><CreaturePortrait speciesId={m.speciesId || m.id} view="front" size={48} /></div>
                      <div className="text-white text-sm font-bold tracking-wide">{m.name}</div>
                      <div className="text-[10px] uppercase mt-1" style={{ color: tc }}>{m.type}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {menuTab === "badges" && (
            <div className="animate-fade-in max-w-xl">
               <div className="text-slate-500 text-xs tracking-[0.2em] mb-4">ROOT PERMISSIONS ({badges.length}/8)</div>
               {badges.length === 0 && <div className="text-slate-600 italic">No access badges authorized yet.</div>}
               {badges.map((b, i) => (
                 <div key={i} className="bg-slate-900 border border-teal-500/30 rounded-lg p-4 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      
                      <div>
                        <div className="text-teal-400 font-bold">{b}</div>
                        <div className="text-slate-500 text-xs">AUTHORIZED</div>
                      </div>
                    </div>
                    <div className="text-teal-500">✓</div>
                 </div>
               ))}
            </div>
          )}
          
          {menuTab === "save" && (
            <div className="animate-fade-in text-center py-12">
               
               <button 
                 onClick={() => { notify("Simulation states persisted to mainframe."); setScreen("overworld"); }}
                 className="bg-teal-400 text-black px-8 py-3 tracking-[0.2em] font-black hover:bg-teal-300 transition-all rounded"
               >
                 COMMIT SAVE
               </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------
  // RENDER: BATTLE
  // --------------------------------------------------------
  if (screen === "battle" && battleState) {
    const bs = battleState;
    const enemy = bs.type === "wild" ? bs.wild : bs.trainerTeam[bs.trainerTeamIdx];
    const player = bs.player;
    const playerHpPct = Math.max(0, (player.currentHp / player.maxHp) * 100);
    const enemyHpPct = Math.max(0, (enemy.currentHp / enemy.maxHp) * 100);
    const hpColor = (pct: number) => pct > 50 ? "#4caf50" : pct > 20 ? "#ff9800" : "#f44336";
    const typeColor = TYPE_COLORS[enemy.type] || "#888";
    // Payoff databox display (PRESENTATION-SPEC.md §2): during the
    // payoff the player databox reads the sequence's display values
    // — the battle copy in bs.player only refreshes from the
    // committed state when the battle resumes, while the source
    // databox tracks the battler's live level/HP/EXP gauge through
    // every beat. Outside the payoff the databox reads bs.player
    // exactly as before, its EXP gauge from the mon's own progress.
    const payoffOnPlayer = bs.phase === "payoff" && payoffDisplay.active && payoffDisplay.recipient?.partyIndex === bs.playerTeamIdx;
    const databoxLevel = payoffOnPlayer ? payoffDisplay.dispLevel : player.level;
    const databoxHp = payoffOnPlayer ? payoffDisplay.dispHp : Math.max(0, player.currentHp);
    const databoxMaxHp = payoffOnPlayer ? payoffDisplay.dispMaxHp : player.maxHp;
    const databoxHpPct = Math.max(0, (databoxHp / Math.max(1, databoxMaxHp)) * 100);
    const databoxExpFrac = payoffOnPlayer
      ? payoffDisplay.expFrac
      : (typeof player.experience === "number"
          ? expProgressInLevel(player.experience, player.level, SPECIES_DB[player.speciesId || player.id]?.growthRate ?? "Medium Fast").frac
          : 0);
    // Move-animation wiring (2026-10-30, gap G-B): when a move is
    // animating, build its presentation from the resolved profile —
    // delivery, canonical timeline, impact amplitude, palette, FX —
    // the same profile fields BattleView hands the Pixi canvas.
    const animPres = battleAnim ? buildWorldAttackPresentation(battleAnim.side, battleAnim.profile, battleAnim.power, battleAnim.nonce) : null;

    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col text-white relative">
        {animPres && <style>{animPres.cssText}</style>}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.8)_100%)] pointer-events-none z-10" />
        
        {/* Header HUD */}
        <div className="bg-black border-b-2 border-teal-500 px-3 sm:px-6 py-2 flex justify-between items-center gap-3 z-20">
          <span className="text-teal-400 text-xs tracking-[0.3em] font-bold truncate min-w-0">
            {bs.type === "wild" ? "WILD ENCOUNTER" : `SYS_BATTLE // ${bs.trainerName}`}
          </span>
          <span className="text-yellow-400 text-sm font-bold shrink-0">{credits} CR</span>
        </div>

        {/* Ranger companion plate (ranger-defense): same PMD
            partner-plate grammar as the overworld — visible only
            while its news is fresh (a defend just happened, or he
            is DOWN). Never a standing element of the battle HUD. */}
        {controlMode === "creature" && (rangerPlate || rangerDown(rangerHealthNow())) && (() => {
          const h = rangerHealthNow();
          const plate = rangerDown(h) ? { hp: h.hp, maxHp: h.maxHp, down: true } : rangerPlate!;
          const pct = plate.maxHp > 0 ? Math.max(0, (plate.hp / plate.maxHp) * 100) : 0;
          return (
            <div className="absolute left-3 top-16 z-30 bg-black/80 backdrop-blur border border-teal-700 rounded-lg px-3 py-2 w-48 pointer-events-none">
              <div className="flex justify-between items-baseline gap-2">
                <span className="font-bold text-[13px] tracking-wide truncate">{playerName}</span>
                <span className={`text-[11px] font-bold ${plate.down ? "text-red-400" : "text-slate-300"}`}>{plate.down ? "DOWN" : `${plate.hp}/${plate.maxHp}`}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: pct > 50 ? "#4caf50" : pct > 20 ? "#ff9800" : "#f44336" }} />
              </div>
            </div>
          );
        })()}

        {/* v5.1 win/lose banner: full-screen blocking overlay, NOT
            the v5 small row + 2000-2500ms timer. The v5 row was
            never seen in any of the three v5 playtest battles —
            whether it was missed between screenshots or hidden
            behind the arena, a timed row is too easy to miss.
            This overlay covers the battle, shows the outcome in
            large text, and BLOCKS until the player presses
            Continue (button, Enter, or Space — see the battle
            key handler). Flow continues either way — a loss
            blacks out and returns to the map, a win goes to the
            goal dialogue or the overworld. Audit-plan note: the
            WIN sub-line below ("Flow continues — your journey
            goes on.") is PLACEHOLDER wording, NOT Mars canon —
            no clear win line was found in story-fill-region1.md,
            so it is kept and labelled here, not replaced with
            invented dialogue. */}
        {bs.phase === "over" && (
          <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-4">
            <div className={`text-5xl font-black tracking-[0.25em] ${player.currentHp <= 0 ? "text-red-400" : "text-yellow-300"}`}>
              {player.currentHp <= 0 ? "DEFEAT!" : "VICTORY!"}
            </div>
            <div className="text-slate-200 text-sm tracking-widest text-center px-6">
              {player.currentHp <= 0 ? "You blacked out and were sent back — your journey continues." : "Flow continues — your journey goes on."}
            </div>
            <button
              onClick={finishBattleEnd}
              className="game-button px-8 py-3 font-bold min-h-[48px] tracking-widest"
            >
              Continue ►
            </button>
          </div>
        )}

        {/* Post-battle payoff ("payoff" phase): no overlay — the
            beat machine runs as the useBattlePayoffSequence hook
            above; its text renders in the bottom message tray, its
            gauge in the player databox, and its summary window
            inside the arena below (PRESENTATION-SPEC.md). The
            stored continuation (next send-out, or the VICTORY
            banner above) runs when it finishes. Money commits as
            its line prints. */}

        {/* Battle Arena — background is the resolved HGSS-grammar
            scene for this battle's context (map binding refined by
            the standing tile, phase from the running day/night hook
            through the legacy-phase adapter), drawn by
            BattleSceneBackdrop from lib/battleBackground geometry.
            Replaces the old context-free slate field + Tron floor
            grid every battle used to share. Platform anchors are
            matched to the billboard feet below (enemy top-right,
            player bottom-left); the ellipses are wide by design so
            the read holds across arena heights. */}
        <div className="flex-1 relative overflow-hidden flex" style={{ perspective: "1000px" }}>
           <BattleSceneBackdrop
             scene={resolveBattleScene({
               mapId: currentMap,
               standingTile: mapData?.tiles?.[playerPos.y]?.[playerPos.x] ?? null,
               interior: (mapData as any)?.interior ?? null,
               phase: phaseFromLegacyPhase(phase),
             })}
             anchors={{ enemy: { x: 624, y: 215 }, player: { x: 150, y: 368 } }}
           />

           {/* Move-animation FX layer (profile-driven, gap G-B):
               projectile/beam/spread/status travel, blitz afterimage
               ghosts, field ring, self aura/wall, multi-hit beats —
               spawned from the same profile the billboards animate
               with. Anchors are arena approximations of the two
               billboard positions. */}
           {battleAnim && animPres && animPres.fxCount > 0 && (
             <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
               {Array.from({ length: animPres.fxCount }).map((_, i) => (
                 <span key={i} style={animPres.fxSpanStyle(i)} />
               ))}
             </div>
           )}

           {/* Enemy Billboard */}
           <div className="absolute right-3 sm:right-[15%] flex flex-col items-center" style={{ top: `${battleEnemyTopPct(styleProfile)}%` }}>
              <div className="bg-black/80 backdrop-blur border rounded-lg p-3 w-52 max-w-[60vw] mb-6" style={{ borderColor: typeColor }}>
                 <div className="flex justify-between items-baseline gap-2 mb-1">
                   <h3 className="font-bold tracking-wide sm:tracking-wider text-[13px] sm:text-base truncate min-w-0">{enemy.name || enemy.nickname || SPECIES_DB[enemy.speciesId || enemy.id]?.name}</h3>
                   <span className="text-slate-400 text-xs shrink-0">Lv.{enemy.level}</span>
                 </div>
                 <div className="text-[10px] tracking-widest uppercase mb-2" style={{ color: typeColor }}>{enemy.type || SPECIES_DB[enemy.speciesId || enemy.id]?.types[0]} TYPE</div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full transition-all duration-500" style={{ width: `${enemyHpPct}%`, background: hpColor(enemyHpPct) }} />
                 </div>
              </div>
              <div
                className="text-9xl drop-shadow-2xl animate-pulse flex items-center justify-center h-40 w-40"
                style={{
                  filter: `drop-shadow(0 0 30px ${typeColor})`,
                  animation: battleAnim && animPres ? (battleAnim.side === "enemy" ? animPres.attackerAnimation : animPres.targetAnimation) : "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                }}
              >
                <CreaturePortrait speciesId={enemy.speciesId || enemy.id} view="front" size={144} />
              </div>
           </div>

           {/* Player Billboard */}
           <div className="absolute left-3 sm:left-[10%] flex flex-col items-center z-10" style={{ bottom: `${battlePlayerBottomPct(styleProfile)}%` }}>
              <div className="bg-black/80 backdrop-blur border-2 border-teal-400 rounded-lg p-3 w-52 max-w-[60vw] mb-6">
                 <div className="flex justify-between items-baseline gap-2 mb-1">
                   <h3 className="font-bold tracking-wide sm:tracking-wider text-[13px] sm:text-base text-teal-300 truncate min-w-0">{player.name || player.nickname || SPECIES_DB[player.speciesId || player.id]?.name}</h3>
                   <span className="text-slate-400 text-xs shrink-0">Lv.{databoxLevel}</span>
                 </div>
                 <div className="flex justify-between items-center mb-1 text-xs">
                   <span className="text-teal-400 font-bold">{databoxHp}/{databoxMaxHp} HP</span>
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full transition-all duration-500" style={{ width: `${databoxHpPct}%`, background: hpColor(databoxHpPct) }} />
                 </div>
                 {/* EXP gauge — part of the databox in the source
                     (PRESENTATION-SPEC.md §2); the payoff sweep
                     animates this gauge, in this box. */}
                 <div className="flex items-center gap-2 mt-1.5">
                   <span className="text-[9px] font-bold text-sky-300 tracking-widest">EXP</span>
                   <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full" style={{ width: `${databoxExpFrac * 100}%`, background: "#38b6ff" }} />
                   </div>
                 </div>
              </div>
              <div
                className="text-8xl drop-shadow-2xl flex items-end justify-center h-48 w-48"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(0,255,255,0.6))",
                  animation: battleAnim && animPres ? (battleAnim.side === "player" ? animPres.attackerAnimation : animPres.targetAnimation) : "none"
                }}
              >
                <CreaturePortrait speciesId={player.speciesId || player.id} view="back" size={144} />
              </div>
           </div>

           {/* Payoff summary window (payoff phase only): the
               level-up stat window at the source's geometry over
               the arena — scene, creatures and databoxes stay
               visible around it (PRESENTATION-SPEC.md §3). The
               payoff's text and gauge live in the bottom message
               tray and the player databox, not here. */}
           {bs.phase === "payoff" && payoffDisplay.statWindow && (
             <PayoffStatWindow
               lu={payoffDisplay.statWindow.lu}
               mode={payoffDisplay.statWindow.mode}
               recipient={payoffDisplay.statWindow.recipient}
               onAdvance={payoffDisplay.advance}
             />
           )}
        </div>

        {/* Action Bottom Panel — the command menu (Pokemon Black
            pattern: message/log window shrinks on the left, the 2x2
            command grid is corner-anchored at a fixed share on the
            right; neither may push the other off screen). On phone
            widths the panel padding tightens so the grid buttons keep
            usable width, and every flex child carries min-w-0 so long
            names/log lines truncate instead of flooding the row. */}
        <div className="h-48 bg-black border-t-4 border-teal-500 flex z-30 shrink-0">
          {/* LOG TRAY — during the payoff this tray is the battle's
              message window (PRESENTATION-SPEC.md §1): it carries
              the payoff's current line, the way the source prints
              into its standing message window; the log lines return
              with the next phase. */}
          <div className="flex-1 min-w-0 p-2 sm:p-4 overflow-y-auto overflow-x-hidden border-r-2 border-slate-800 flex flex-col justify-end text-sm text-slate-300 leading-relaxed" onClick={bs.phase === "payoff" ? payoffDisplay.advance : undefined}>
             {bs.phase === "payoff" && payoffDisplay.active ? (
               <div className="mb-1 break-words text-white font-bold">{payoffDisplay.message}</div>
             ) : bs.log.slice(-3).map((l: string, i: number, arr: any[]) => (
               <div key={i} className={`mb-1 break-words ${i === arr.length -1 ? 'text-white font-bold opacity-100' : 'opacity-60'}`}>
                 &gt; {l}
               </div>
             ))}
          </div>

          {/* CONTROLS */}
          <div className="w-[54%] sm:w-[45%] lg:w-[30%] shrink-0 p-2 sm:p-4 bg-slate-950">
             {bs.phase === "menu" ? (<>
             {battleMenu === "main" && (
               <div className="flex flex-col h-full gap-2">
                 <div className="grid grid-cols-2 gap-1.5 sm:gap-2 flex-1 min-w-0">
                   {(player.moves || []).map((mName: string) => {
                     // v4 bridge: party moves are moveIds — display the
                     // resolved name/type/power, not the raw id.
                     const mDef = GAME_DATA.moves[mName as keyof typeof GAME_DATA.moves];
                     const mResolved = resolveBattleMove(mName);
                     const mDisplay = mResolved?.display || mName;
                     const mType = mResolved?.type || mDef?.type;
                     const mPower = mResolved?.power ?? mDef?.power;
                     return (
                       <button
                         key={mName}
                         onClick={() => doBattleAction({ type: 'move', move: mName })}
                         className="bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-left p-2 transition-colors flex flex-col justify-center min-w-0"
                       >
                          <span className="font-bold text-white text-[12px] sm:text-[13px] leading-tight w-full line-clamp-2">{mDisplay}</span>
                          <span className="text-[10px] mt-1 truncate w-full" style={{ color: TYPE_COLORS[mType] || "#888" }}>{mType} | PWR {mPower || '-'}</span>
                       </button>
                     )
                   })}
                 </div>
                 <div className="flex gap-1.5 sm:gap-2 h-10 mt-2 shrink-0">
                   {bs.canCatch && (
                     <button
                       onClick={() => doBattleAction({ type: 'catch' })}
                       className="flex-1 min-w-0 truncate bg-teal-950/40 hover:bg-teal-900 border border-teal-700 text-teal-400 font-bold text-[13px] sm:text-sm rounded tracking-wider sm:tracking-widest px-1"
                     >
                       LUIGI CUBE
                     </button>
                   )}
                   <button
                     onClick={() => doBattleAction({ type: 'run' })}
                     className="flex-1 min-w-0 truncate bg-red-950/40 hover:bg-red-900 border border-red-800 text-red-400 font-bold text-[13px] sm:text-sm rounded tracking-wider sm:tracking-widest px-1"
                   >
                     FLEE
                   </button>
                 </div>
                 {/* Fix 2: BAG / PARTY submenu entries. Opening one
                     never consumes the turn; each submenu has its
                     own BACK button (and Escape / X) back here. */}
                 <div className="flex gap-1.5 sm:gap-2 h-9 shrink-0">
                   <button
                     onClick={() => { playCue('ui.cursor'); setBattleMenu("bag"); }}
                     className="flex-1 min-w-0 truncate bg-amber-950/40 hover:bg-amber-900 border border-amber-700 text-amber-300 font-bold text-[13px] sm:text-sm rounded tracking-wider sm:tracking-widest px-1"
                   >
                     BAG
                   </button>
                   <button
                     onClick={() => { playCue('ui.cursor'); setBattleMenu("party"); }}
                     className="flex-1 min-w-0 truncate bg-indigo-950/40 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 font-bold text-[13px] sm:text-sm rounded tracking-wider sm:tracking-widest px-1"
                   >
                     PARTY
                   </button>
                 </div>
               </div>
             )} {battleMenu === "bag" && (
               <div className="flex flex-col h-full gap-2">
                 <div className="flex items-center justify-between shrink-0">
                   <span className="font-bold text-amber-300 tracking-widest text-sm">BAG</span>
                   <button onClick={() => { playCue('ui.cancel'); setBattleMenu("main"); }} className="bg-slate-900 hover:bg-slate-800 border border-slate-600 text-white font-bold text-[13px] rounded px-3 py-1.5">◄ BACK</button>
                 </div>
                 {(() => {
                   const mendCount = inventory?.["mend_patch"] || 0;
                   const damaged = playerTeam.map((m: any, i: number) => ({ m, i })).filter(({ m }: any) => ((m.currentHp ?? m.hp) ?? m.maxHp) > 0 && ((m.currentHp ?? m.hp) ?? m.maxHp) < m.maxHp);
                   return (
                     <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
                       <button
                         disabled={mendCount <= 0 || damaged.length === 0}
                         onClick={() => { if (damaged.length === 1) { doBattleAction({ type: 'item', itemId: 'mend_patch', index: damaged[0].i }); } else { setBattleMenu("mend"); } }}
                         className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-amber-700/60 rounded text-left p-2 flex flex-col justify-center min-w-0"
                       >
                         <span className="font-bold text-white text-[13px] leading-tight">Mend Patch ×{mendCount}</span>
                         <span className="text-[10px] mt-1 text-slate-400">Restores 50 HP to one partner</span>
                       </button>
                       <div className="text-[11px] text-slate-400 leading-snug">
                         {mendCount <= 0 ? "No Mend Patches left — the MochiiPlex clerk sells them." : damaged.length === 0 ? "No partner needs healing right now." : "Pick the partner to heal. Using an item uses your turn."}
                       </div>
                       <div className="text-[11px] text-slate-500 leading-snug">Luigi Cubes are thrown from the main panel (wild battles only).</div>
                     </div>
                   );
                 })()}
               </div>
             )} {battleMenu === "mend" && (
               <div className="flex flex-col h-full gap-2">
                 <div className="flex items-center justify-between shrink-0">
                   <span className="font-bold text-amber-300 tracking-widest text-sm">USE ON WHOM?</span>
                   <button onClick={() => { playCue('ui.cancel'); setBattleMenu("bag"); }} className="bg-slate-900 hover:bg-slate-800 border border-slate-600 text-white font-bold text-[13px] rounded px-3 py-1.5">◄ BACK</button>
                 </div>
                 <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
                   {playerTeam.map((m: any, i: number) => {
                     const cur = (m.currentHp ?? m.hp) ?? m.maxHp;
                     if (!(cur > 0 && cur < m.maxHp)) return null;
                     return (
                       <button key={i} onClick={() => doBattleAction({ type: 'item', itemId: 'mend_patch', index: i })} className="bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-left p-2 flex items-center justify-between gap-2 min-w-0">
                         <span className="font-bold text-white text-[13px] truncate">{battleMonName(m)}</span>
                         <span className="text-[11px] text-teal-300 shrink-0">{cur}/{m.maxHp} HP</span>
                       </button>
                     );
                   })}
                 </div>
               </div>
             )} {battleMenu === "party" && (
               <div className="flex flex-col h-full gap-2">
                 <div className="flex items-center justify-between shrink-0">
                   <span className="font-bold text-indigo-300 tracking-widest text-sm">PARTY</span>
                   <button onClick={() => { playCue('ui.cancel'); setBattleMenu("main"); }} className="bg-slate-900 hover:bg-slate-800 border border-slate-600 text-white font-bold text-[13px] rounded px-3 py-1.5">◄ BACK</button>
                 </div>
                 <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
                   {playerTeam.map((m: any, i: number) => {
                     const cur = (m.currentHp ?? m.hp) ?? m.maxHp;
                     const isActive = i === bs.playerTeamIdx;
                     const fainted = cur <= 0;
                     return (
                       <button
                         key={i}
                         disabled={isActive || fainted}
                         onClick={() => doBattleAction({ type: 'switch', index: i })}
                         className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 rounded text-left p-2 flex items-center justify-between gap-2 min-w-0"
                       >
                         <span className="font-bold text-white text-[13px] truncate">{battleMonName(m)} <span className="text-slate-400 font-normal">Lv.{m.level}</span></span>
                         <span className="text-[11px] shrink-0" style={{ color: fainted ? "#f44336" : "#4caf50" }}>{isActive ? "IN BATTLE" : fainted ? "FAINTED" : `${cur}/${m.maxHp} HP`}</span>
                       </button>
                     );
                   })}
                   <div className="text-[11px] text-slate-500 leading-snug">Switching uses your turn. BACK never does.</div>
                 </div>
               </div>
             )} </>) : (
               <div className="w-full h-full flex items-center justify-center text-teal-500 animate-pulse tracking-widest font-bold">
                  {bs.phase === "enemy_turn" ? "AWAITING ENEMY ROOT ACTION..." : "RESOLVING..."}
               </div>
             )}
          </div>
        </div>
      </div>
    );
  }


  // --------------------------------------------------------
  // RENDER: OVERWORLD — PixiJS canvas, full viewport (pass 1)
  // The canvas fills the whole screen; HUD is an overlay; D-pad and
  // action buttons sit inside safe-area padding, never clipped.
  // --------------------------------------------------------
  return (
    <div className="game-screen">
      <PixiWorldCanvas
        mapData={
          controlMode === "creature"
            ? { ...displayMapData, npcs: [...(displayMapData.npcs || []), { id: "__ranger_companion", name: playerName, x: companionPos?.x ?? playerPos.x, y: companionPos?.y ?? playerPos.y }] }
            : displayMapData
        }
        mapId={currentMap}
        playerPos={playerPos}
        playerDir={playerDir}
        playerSpeciesId={controlMode === "creature" ? (swapLead?.speciesId || party[0]?.speciesId || null) : (party[0]?.speciesId || null)}
        playerKind={controlMode === "creature" ? "creature" : "human"}
        playerGender={playerGender}
        defeatedIds={defeatedTrainers}
        phase={phase}
        animWalk={animWalk}
        animTick={animTick}
        follower={controlMode === "creature" ? null : follower}
        wilds={roamers.filter((r) => r.state !== "down").map((r) => ({
          id: r.id,
          speciesId: r.speciesId,
          x: r.pos.x,
          y: r.pos.y,
          telegraph: r.state === "chase",
        }))}
        npcStates={
          controlMode === "creature" && companionPos
            ? { ...npcStates, __ranger_companion: { x: companionPos.x, y: companionPos.y, dir: "front" as const, moving: effCompanionCommand !== "wait", step: animTick } }
            : npcStates
        }
      />

      {/* v4 goal line: the missing "where do I start". The route
          gate itself already exists (block_route_1 events, noStarter
          condition, and tall-grass encounters already require a
          starter) — v4 makes it discoverable instead of inventing a
          second gate. */}
      <WorldHud
        mapName={mapData?.name || currentMap}
        timeLabel={`${String(gameHour).padStart(2, "0")}:00 ${phase}`}
        goalLabel={
          !hasStarter
            ? "Goal: Visit Prof. Aeon's Lab (walk into the north building)"
            : !defeatedTrainers.includes('hex_battle_event') && currentMap === 'aeon_lab'
              ? `Goal: Battle ${rivalName} at the lab exit, then head to Route 1.0`
              : currentMap === 'sector0'
                ? "Goal: Go to Route 1.0 — walk north through the gate, then to Silicon Town"
                : undefined
        }
        onMenu={() => setPauseOpen(true)}
        onRoster={() => { if (setView) setView("ROSTER"); }}
      />

      {/* Presentation-restraint law (owner, 2026-10-29): NO mode
          dashboard. PMD/HGSS grammar is the presentation: the sprite
          you control IS the mode indicator, the companion's body
          shows the command (at your heel / holding / wandering), and
          feedback rides the game's existing notification line only —
          the same surface the game already uses for its own events. */}

      {/* Ranger companion plate (ranger-defense): PMD partner-plate
          grammar — the plate exists ONLY in the moment it carries
          news: he defended, he was hurt, he is DOWN. It is shown by
          showRangerPlate() for a few seconds after such an event and
          never as a standing HUD element. While he is DOWN it stays
          until he is healed (a state, not a moment). */}
      {(rangerPlate || (controlMode === "creature" && rangerDown(rangerHealthNow()))) && (() => {
        const h = rangerHealthNow();
        const plate = rangerDown(h) ? { hp: h.hp, maxHp: h.maxHp, down: true } : rangerPlate!;
        const pct = plate.maxHp > 0 ? Math.max(0, (plate.hp / plate.maxHp) * 100) : 0;
        return (
          <div className="absolute left-3 bottom-24 z-30 bg-black/80 backdrop-blur border border-teal-700 rounded-lg px-3 py-2 w-48 pointer-events-none">
            <div className="flex justify-between items-baseline gap-2">
              <span className="font-bold text-[13px] tracking-wide truncate">{playerName}</span>
              <span className={`text-[11px] font-bold ${plate.down ? "text-red-400" : "text-slate-300"}`}>{plate.down ? "DOWN" : `${plate.hp}/${plate.maxHp}`}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
              <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, background: pct > 50 ? "#4caf50" : pct > 20 ? "#ff9800" : "#f44336" }} />
            </div>
            {plate.down && <div className="text-[11px] text-red-300 mt-1">He took a hit for you. Heal him.</div>}
          </div>
        );
      })()}

      {pauseOpen && (
        <PauseMenu
          onClose={() => setPauseOpen(false)}
          onRoster={() => { setPauseOpen(false); if (setView) setView("ROSTER"); }}
          onShop={() => { setPauseOpen(false); if (setView) setView("SHOP"); }}
          onSaveLoad={() => { setPauseOpen(false); setScreen("save_menu"); }}
          onNavigate={(v: string) => { setPauseOpen(false); if (setView) setView(v as any); }}
          onQuitToTitle={() => { setPauseOpen(false); window.location.reload(); }}
        />
      )}

      {/* Dialogue box, v4: the shared DialogueBox (typewriter,
          portrait left, ▼, 2 lines max per page, keyboard + click +
          A advance) over the world canvas. Battle log is untouched
          and stays ONLY as battle history — it is not the story
          carrier. Speaker portrait: slotForNpc, silhouette
          placeholder when no sheet exists — never emoji. */}
      {screen === "dialog" && dialog && (
        <DialogueBox
          lines={dialog.lines || []}
          speakerName={dialog.npc?.name}
          speakerSlot={dialog.npc ? slotForNpc(dialog.npc) : null}
          // Tier 1 persona framing, scene-selected: ONLY Luigi
          // Castagnoli's dialogue gets it (personaDialogue.ts).
          // Every other speaker passes 'default' — the locked default
          // dialogue look is unchanged. Mysterious Figure has no
          // repo scene yet, so it selects nothing here; see that file.
          presentationMode={personaPresentationForNpc(dialog.npc) ? 'persona' : 'default'}
          choice={!!dialog.isChoice}
          onComplete={finishDialog}
          onChoice={handleChoice}
          registerAdvance={(fn) => { dialogAdvanceRef.current = fn; }}
        />
      )}

      {/* Stub-kill S-2: witnessed-event choices. The director's
          events carry more outcomes than DialogueBox's YES/NO, so
          the choice is a small panel in the game's own button
          styling — what the player DOES, in verbs; outcome result
          text stays in the data where it belongs. */}
      {lwChoice && (
        <div className="absolute inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4">
          {lwChoice.choices.map((c) => (
            <button
              key={c.id}
              className="game-button w-full max-w-md px-6 py-2 font-bold min-h-[48px]"
              onClick={() => resolveLwChoice(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* MOBILE CONTROLS — D-pad bottom-left, fully on-screen */}
      <div
        className="absolute left-3 z-40 flex flex-col gap-1 select-none"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))', left: 'max(0.75rem, env(safe-area-inset-left))', touchAction: 'none' }}
      >
        <div className="flex justify-center">
          <button
            onPointerDown={(e) => { e.preventDefault(); move(0, -1); setHeldDir({dx: 0, dy: -1}); }}
            onPointerUp={() => setHeldDir(null)} onPointerLeave={() => setHeldDir(null)} onPointerCancel={() => setHeldDir(null)}
            style={{ touchAction: 'none' }}
            className="w-14 h-14 bg-black/70 border-2 border-teal-400/60 rounded-t-lg active:bg-teal-500/50 text-teal-300 flex items-center justify-center text-xl"
          >▲</button>
        </div>
        <div className="flex gap-1">
          <button
            onPointerDown={(e) => { e.preventDefault(); move(-1, 0); setHeldDir({dx: -1, dy: 0}); }}
            onPointerUp={() => setHeldDir(null)} onPointerLeave={() => setHeldDir(null)} onPointerCancel={() => setHeldDir(null)}
            style={{ touchAction: 'none' }}
            className="w-14 h-14 bg-black/70 border-2 border-teal-400/60 rounded-l-lg active:bg-teal-500/50 text-teal-300 flex items-center justify-center text-xl"
          >◄</button>
          <div className="w-14 h-14 bg-black/70 flex items-center justify-center border border-teal-400/20">
            <div className="w-4 h-4 rounded-full bg-teal-400/30" />
          </div>
          <button
            onPointerDown={(e) => { e.preventDefault(); move(1, 0); setHeldDir({dx: 1, dy: 0}); }}
            onPointerUp={() => setHeldDir(null)} onPointerLeave={() => setHeldDir(null)} onPointerCancel={() => setHeldDir(null)}
            style={{ touchAction: 'none' }}
            className="w-14 h-14 bg-black/70 border-2 border-teal-400/60 rounded-r-lg active:bg-teal-500/50 text-teal-300 flex items-center justify-center text-xl"
          >►</button>
        </div>
        <div className="flex justify-center">
          <button
            onPointerDown={(e) => { e.preventDefault(); move(0, 1); setHeldDir({dx: 0, dy: 1}); }}
            onPointerUp={() => setHeldDir(null)} onPointerLeave={() => setHeldDir(null)} onPointerCancel={() => setHeldDir(null)}
            style={{ touchAction: 'none' }}
            className="w-14 h-14 bg-black/70 border-2 border-teal-400/60 rounded-b-lg active:bg-teal-500/50 text-teal-300 flex items-center justify-center text-xl"
          >▼</button>
        </div>
      </div>

      {/* v5 interact prompt: when the facing tile holds an NPC, a
          door, or a signpost, show a tappable prompt (mobile has no
          reliable A key, and the playtest found on-screen A on a
          wall/sign did nothing because nothing said what was
          interactable). The prompt is a button, not just text, so
          tapping it interacts. Hidden during dialogue, when A
          already advances the box. */}
      {screen === "overworld" && (() => {
        const dx = playerDir === "right" ? 1 : playerDir === "left" ? -1 : 0;
        const dy = playerDir === "down" ? 1 : playerDir === "up" ? -1 : 0;
        const fx = playerPos.x + dx, fy = playerPos.y + dy;
        const npc = npcAt(fx, fy);
        const door = mapData.doors?.find((d: any) => d.x === fx && d.y === fy);
        const sign = mapData.signs?.find((s: any) => s.x === fx && s.y === fy);
        const label = npc ? `Talk to ${npc.name}` : door ? (isDoorOpen(door.condition, badges) ? `Enter ${door.label || "door"}` : `Sealed: ${door.label || "door"}`) : sign ? "Read sign" : null;
        if (!label) return null;
        return (
          <button
            onClick={() => interact()}
            className="absolute left-1/2 -translate-x-1/2 z-40 px-5 py-3 font-bold tracking-widest game-button min-h-[48px]"
            style={{ top: 'max(5.5rem, calc(env(safe-area-inset-top) + 5.5rem))' }}
          >
            A — {label}
          </button>
        );
      })()}

      {/* MOBILE CONTROLS — action buttons bottom-right, fully on-screen.
          v5: z-70, above the dialogue box (z-50). Before v5 A/B sat
          at z-40 under the dialogue box and were partially obscured
          whenever dialogue was open. Size unchanged — not shrunk.
          v5.2: hidden entirely during a YES/NO choice dialogue.
          Root cause of the v5.1 playtest blocker: YES/NO buttons sit
          at the bottom-right of the dialogue box (z-50), directly
          under the A/B cluster (z-70), so tapping YES/NO hit A/B
          instead — and the on-screen A only advances non-choice
          dialogue, so it did nothing for a choice either. With A/B
          hidden for choice dialogues, YES/NO are tappable, and the
          DialogueBox Y/N keyboard shortcut (below) covers keys. */}
      {!(screen === "dialog" && dialog?.isChoice) && (<div
        className="absolute right-3 z-[70] flex gap-3 items-end select-none"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))', right: 'max(0.75rem, env(safe-area-inset-right))', touchAction: 'none' }}
      >
        <button
          onClick={() => {
            if (screen === 'dialog') { /* B does not advance dialogue in v4 */ }
            else if (screen === 'menu' || screen === 'save_menu') setScreen("overworld");
            else setPauseOpen(true);
          }}
          style={{ touchAction: 'none' }}
          className="w-16 h-16 rounded-full bg-red-900/60 border-b-4 border-red-500/70 text-red-100 flex items-center justify-center font-black text-2xl active:border-b-0 active:translate-y-1 transition-all"
        >
          B
        </button>
        <button
          onClick={() => {
            if (screen === 'overworld') interact();
            else if (screen === 'dialog') dialogAdvanceRef.current?.();
          }}
          style={{ touchAction: 'none' }}
          className="w-16 h-16 rounded-full bg-teal-900/60 border-b-4 border-teal-400/70 text-teal-100 flex items-center justify-center font-black text-2xl active:border-b-0 active:translate-y-1 transition-all"
        >
          A
        </button>
      </div>)}

      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black border-2 px-6 py-3 font-bold tracking-widest z-50 text-center shadow-2xl rounded" style={{ borderColor: notification.color, color: notification.color }}>
          {notification.msg}
        </div>
      )}

      {screen === "save_menu" && (
        <SaveMenu onClose={() => setScreen("overworld")} />
      )}

      <div className={`absolute inset-0 bg-black z-[60] transition-opacity duration-300 pointer-events-none ${isTransitioning ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );
}
