import { create } from 'zustand';
import { MochiiInstance } from '../lib/types';
import { createMochii } from '../lib/engine';
import type { GardenSaveRecord } from '../lib/garden-wiring';
import type { DaycareEgg } from '../lib/creatureDaycare';
import type { GuardianAssignment } from '../lib/monster-tamer-systems';
import type { DeedEntry } from '../lib/honor';
import { emptyLivingWorldState } from '../lib/livingWorld';
import type { LivingWorldState } from '../lib/livingWorld';
import type { KeepsakeFact } from '../lib/itemMeaning';
import { GameSettings, DEFAULT_SETTINGS, loadStoredSettings, persistSettings } from '../lib/gameSettings';
import { deriveRangerMaxHp, applyRangerDamage, applyRangerHeal, applyRangerFullHeal } from '../lib/rangerDefense';
import { setAutosaveHold, getAutosaveHold } from '../lib/saveSystem';
import type { WorldClockAnchor } from '../lib/worldClock';
import { applyFontRoles } from '../lib/fonts';
import { applySoundMode } from '../lib/audioRouting';
import { worldFullPp } from '../lib/worldBattleCore';
import { backfillIndividuals, driftLeadMood, followerLeadId, resetLeadMoodOnChange, withMoodEvent } from '../lib/individual';
import { withPendingHandover, type PendingFindHandover } from '../lib/followerFind';
import { withResearchTally, type ResearchTallies } from '../lib/research';
import { publishAnnouncement as publishAnnouncementList, publishScheduleAnnouncements as publishScheduleAnnouncementsList, type Announcement, type CalendarContext, type ScheduleEntry } from '../lib/calendar';

interface GameState {
  playerName: string;
  playerGender: 'boy' | 'girl';
  /** Rival name, v4: default "Hex" (canon). Set in the rival-name phase. */
  rivalName: string;
  saveSlot: number;
  introCompleted: boolean;
  party: MochiiInstance[];
  pc: MochiiInstance[];
  wallet: number;
  inventory: { [key: string]: number };
  badges: string[];
  dex: Record<string, string>; // 'seen' | 'caught'
  // Research (gap-fill S11 slice 2, Arceus WIRING-PLAN W1 store half):
  // the ONLY stored research state, facts only — {speciesId:
  // {taskId: count}}. Levels and points are DERIVED at read time by
  // src/lib/research.ts and are never stored here (a stored level
  // would be a landing defect, the same law as the deed ledger).
  // SaveMenu serializes the whole store, so this section persists
  // with saves like dex; old saves carry no field and load with
  // the empty default through loadState's spread. No level, no
  // task list, no writer lives here: task defs are data-lane
  // content (#97: zero instanced) and writers are slice 3.
  research: ResearchTallies;
  recordResearchTally: (speciesId: string, taskId: string, by?: number) => void;
  // Announcements (gap-fill S12 slice 2, G-17 store half): the ONLY
  // stored announcement state — the published list itself, in
  // publish order. No publisher lives here and no reader lives
  // here: publishers (the calendar, later the ecology branches)
  // call publishAnnouncement, and readers use slice 1's
  // announcementsForDay / announcementsSince over this list.
  // Publishing an invalid or duplicate-id announcement is a
  // no-op that keeps the same list reference (slice 1's rule),
  // so the store skips the set exactly as the research section
  // does. SaveMenu serializes the whole store, so this list
  // persists with saves like dex; old saves carry no field and
  // load with the empty default through loadState's spread.
  // Announcement TEXT is publisher-supplied content — this
  // slice publishes nothing of its own.
  announcements: readonly Announcement[];
  publishAnnouncement: (ann: Announcement) => void;
  // Announcements (gap-fill S12 slice 3, G-17 calendar publisher):
  // the store half of slice 3's pure publisher. Rows, context, and
  // text are all caller-supplied; this method publishes nothing of
  // its own, and a no-op run keeps the same list reference, so the
  // store skips the set exactly as slices 2's publishAnnouncement
  // does. No host calls this yet — the day-change hook is a later
  // slice — and no schedule rows or text live here.
  publishScheduleAnnouncements: (entries: readonly ScheduleEntry[], ctx: CalendarContext, dayIndex: number, textFor: (entry: ScheduleEntry) => string | null | undefined) => void;
  completedEvents: string[];
  defeatedTrainers: string[];
  
  // Settings (title/press/settings wiring, 2026-10-25): persisted both
  // in localStorage (loadStoredSettings) and, because SaveMenu /
  // GameShell serialize the whole state, inside every save. Changing
  // settings never erases a save.
  settings: GameSettings;
  setSettings: (patch: Partial<GameSettings>) => void;

  // Creature Mode / Garden shared state (pass 3): Garden records used
  // to live only in GardenView's local state, so Creature Mode could not
  // read the +9% Garden bonus and a Guardian assignment vanished on
  // leaving the screen. Both now live in the shared store, so SaveMenu
  // (which serializes the whole state) saves and loads them with the game.
  gardenRecords: Record<string, GardenSaveRecord>;
  setGardenRecord: (creatureId: string, record: GardenSaveRecord) => void;
  guardian: GuardianAssignment | null;
  setGuardian: (guardian: GuardianAssignment | null) => void;
  // Preserved from Chao Garden PR #225 (live main): Garden minutes.
  gardenMinutes: number;
  setGardenMinutes: (minutes: number) => void;

  // World clock (gap-fill S1, CLOCK-FROM-POKEMON §3.2): the anchor
  // is the ONLY stored clock state. Phase, weekday, season and
  // day-of-year are derived from it by src/lib/worldClock.ts and
  // are never stored. Null = not yet anchored (old saves, and
  // fresh games before their first WorldEngine tick); the engine
  // anchors a new game at day 0, 10:00 via newGameAnchor(). Old
  // saves carry no field and load with null through loadState's
  // spread, exactly like the ledger/living-world defaults above.
  worldClock: WorldClockAnchor | null;
  setWorldClock: (anchor: WorldClockAnchor) => void;
  // Creature Mode Pass 7 — Daycare steps: persisted tile steps taken
  // in Creature Mode while a Guardian is assigned (deposited).
  // FireRed daycare.c: steps accumulate for deposited creatures
  // while the player walks; EXP and cost are computed on retrieve,
  // never guessed mid-walk. SaveMenu serializes the whole store,
  // so these steps persist with saves like gardenRecords/guardian.
  daycareSteps: number;
  setDaycareSteps: (steps: number) => void;
  // Creature Mode Pass 8 — second deposit slot (Partner) + egg.
  // Partner is the same GuardianAssignment shape as guardian;
  // egg is null until a 256-step egg roll passes (see creatureDaycare).
  daycarePartner: GuardianAssignment | null;
  setDaycarePartner: (partner: GuardianAssignment | null) => void;
  daycareEgg: DaycareEgg | null;
  setDaycareEgg: (egg: DaycareEgg | null) => void;

  // Honor (List 28, P0): the deed ledger is the ONLY stored honor
  // state, and it is append-only — recordDeed (src/lib/honor.ts) is
  // the one write helper, and nothing edits or removes entries.
  // Morale, tallies, standing and wanted are derived at read time by
  // src/lib/honor.ts and are never stored in the store or a save
  // (guarded mechanically by honor.test.ts). SaveMenu serializes the
  // whole store, so the ledger persists with saves like the Garden
  // state above; old saves carry no ledger and load with the empty
  // default through loadState's spread.
  deedLedger: DeedEntry[];
  appendDeed: (entry: DeedEntry) => void;

  // Living world (world-encounter package, stub-kill S-2): the
  // director's progress state — resolved event ids, stranger-arc
  // stages, flags. The director itself (src/lib/livingWorld.ts) is
  // pure; this field is its one stored home, beside the ledger it
  // writes witnessed deeds into. Old saves carry no field and load
  // with the empty default through loadState's spread.
  livingWorld: LivingWorldState;
  setLivingWorld: (state: LivingWorldState) => void;

  // Field techniques (stub-kill S-3): acquisition flags in the
  // tech.* namespace of the event-flag schema
  // (src/data/core/schemas/event-flag.schema.json) — keyed
  // "tech.<verb-slug>", e.g. "tech.illuminate". Held vs performed are
  // separate facts: this record is HELD only; performance is checked
  // against the live party by src/lib/fieldTechniques.ts. Every flag
  // starts un-granted — grants are authored teach_technique effects
  // and owner-gated verb fiction, never defaults.
  techniqueFlags: Record<string, boolean>;
  setTechniqueFlag: (flag: string, held: boolean) => void;

  // Ranger companion health (ranger-defense package, owner ruling
  // 2026-10-29 ~21:21 CDT): the Ranger companion has a real health
  // pool — he can DEFEND the player-creature in creature mode, take
  // a hit's real damage on it, go DOWN (never die), and be healed.
  // rangerMaxHp 0 = uninitialised; ensureRangerHealth derives the
  // pool from the lead creature's level band (lib/rangerDefense —
  // DORO-DERIVED derivation, recorded there). Damage and healing
  // flow ONLY through the actions below, never display-side. Like
  // every state field here, SaveMenu serializes the whole store, so
  // the pool persists with the save; old saves load it as 0 and the
  // engine initialises it on the first creature-mode tick.
  rangerHp: number;
  rangerMaxHp: number;
  ensureRangerHealth: (leadLevel: number) => void;
  damageRanger: (amount: number) => { hp: number; dealt: number; downedNow: boolean };
  healRangerBy: (amount: number) => void;
  healRangerFull: () => void;
  // Item meaning (item-meaning lane S-IM1): FACTS ONLY, the same
  // derived-reads discipline as the deed ledger. identifiedItems
  // lists item ids the appraisal service has named for this
  // Ranger — what an item IS lives in its record
  // (src/lib/itemMeaning.ts), never here. keepsakeLog is
  // append-only: a keepsake's depth is derived from it at read
  // (keepsakeBand), never stored as a number. Old saves carry
  // neither field and load with the empty defaults through
  // loadState's spread.
  identifiedItems: string[];
  identifyItem: (itemId: string) => void;
  keepsakeLog: KeepsakeFact[];
  appendKeepsakeFact: (fact: Omit<KeepsakeFact, 'seq'>) => void;

  // Overworld state
  currentMap: string;
  playerPos: { x: number, y: number };
  // Built-in cheat codes (cheat-to-mechanic lane, 2026-10-29): the
  // owner's honest-cheats rule — codes typed in Settings are part of
  // the game, and their use is RECORDED, never hidden. cheatLog is
  // the record: one entry per successful code application (code +
  // wall-clock timestamp), serialized with the whole store by
  // SaveMenu like every other field, so it persists with the save;
  // old saves carry no log and load with the empty default through
  // loadState's set-merge. infiniteMoney is the INFINITE MONEY
  // toggle: while on, buyItem grants without deducting the wallet.
  // Cheats NEVER write deedLedger (honor), bond state, or dex
  // records except the codes that explicitly say so (MOCHII-ALL
  // marks dex Seen, and says so on its face).
  infiniteMoney: boolean;
  cheatLog: { code: string; at: number }[];
  setInfiniteMoney: (v: boolean) => void;
  recordCheatUse: (code: string) => void;
  addItem: (itemId: string, qty?: number) => void;

  // Cheat expansion (Gen 7/8/9 catalogue, 2026-10-29): the modern
  // cheat families that fit this game, as store flags the REAL
  // systems read — never parallel state. guaranteedCatch is read by
  // both catch sites (WorldEngine wild catch + BattleView
  // handleCatch); noEncounters by the WorldEngine tall-grass roll;
  // infiniteItems by useItem below (the mirror of infiniteMoney in
  // buyItem); expMultiplier by both EXP award sites (BattleView
  // victory + Creature Mode defeat). All default to the honest
  // values (false / 1) and persist with the save like every field.
  guaranteedCatch: boolean;
  noEncounters: boolean;
  infiniteItems: boolean;
  expMultiplier: number;
  setGuaranteedCatch: (v: boolean) => void;
  setNoEncounters: (v: boolean) => void;
  setInfiniteItems: (v: boolean) => void;
  setExpMultiplier: (v: number) => void;


  // Sprint Boots (sequence build, 2026-10-28): the fiction already
  // grants them — Mom's dialogue in sector0 / sector0_house_1f says
  // "Sprint Boots. Hold B and you can run" (and the canon opening,
  // src/lib/wiring/dialogue/region1-truck-start.ink, sets the
  // sprint_boots VAR in its mom_boots knot) — but no flag and no run
  // mechanic existed, so the promise did nothing. WorldEngine grants
  // this flag when Mom's dialogue completes and reads it for the
  // held-direction move interval (140 ms walk / 70 ms run, the same
  // two rates the fastForward cheat already uses). Saved with the
  // game like every other state field; old saves load it as false.
  hasSprintBoots: boolean;
  setHasSprintBoots: (v: boolean) => void;

  // Cheat / debug state (pass 1, cheat-console-spec: native allowlist only).
  // cheated is set by ANY cheat code and is saved with the game.
  cheated: boolean;
  shiny: boolean;
  noclip: boolean;
  fastForward: boolean;
  setCheatFlags: (flags: Partial<{ cheated: boolean; shiny: boolean; noclip: boolean; fastForward: boolean }>) => void;

  // Playtest 2026-10-26 (attempt 6): a START OVER run autosaved over
  // its occupied slot on world entry / map change, even though the
  // START OVER dialogs promise the old save is replaced only when
  // the player later saves over the slot. When this holds a slot
  // number, WorldEngine autosaves into that slot are skipped until
  // the player makes an explicit manual save, which clears the hold.
  // Loading a save also clears it (that run is established).
  autosaveHeldForSlot: number | null;
  setAutosaveHeldForSlot: (slot: number | null) => void;

  // Actions
  setPlayerInfo: (name: string, gender: 'boy' | 'girl', slot: number) => void;
  setRivalName: (name: string) => void;
  loadState: (state: Partial<GameState>) => void;
  initializeStarter: (speciesId: string) => void;
  completeIntro: () => void;
  healParty: () => void;
  addMochii: (mochii: MochiiInstance) => void;
  gainWallet: (amount: number) => void;
  buyItem: (itemId: string, cost: number) => boolean;
  useItem: (itemId: string) => boolean;
  updatePartyMember: (index: number, updated: MochiiInstance) => void;
  // Gap-fill S8 slice 2 — follower mood host actions (pure helpers in
  // src/lib/individual.ts; WorldEngine calls these). Both skip the set
  // when the helper returns the party unchanged, so a no-op tick or a
  // non-change never churns the store, saves, or re-renders.
  driftFollowerMood: () => void;
  resetFollowerMoodOnLeadChange: (prevLeadId: string | null) => void;
  // Gap-fill S8 slice 7 — find handover at the talk site (pure
  // decision in src/lib/followerFind.ts; WorldEngine's talk-to-
  // follower branch calls this). Returns the outcome so the host
  // can pick its dialog line; skips the set entirely when the lead
  // carries no pending find, so a plain talk never churns the
  // store. A handed find lands in the bag by its data id (no
  // display-name table exists yet, so no name is produced here).
  handoverFollowerFind: () => PendingFindHandover;
  addBadge: (badge: string) => void;
  updateDex: (id: string, status: 'seen' | 'caught') => void;
  completeEvent: (id: string) => void;
  defeatTrainer: (id: string) => void;
  setMapState: (mapId: string, pos: { x: number, y: number }) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerName: "Netrunner",
  playerGender: "boy",
  rivalName: "Hex",
  saveSlot: 1,
  introCompleted: false,
  party: [],
  pc: [],
  wallet: 1000,
  inventory: {
    'luigi_cube': 10,
    'mend_patch': 5
  },
  badges: [],
  dex: {},
  research: {},
  recordResearchTally: (speciesId, taskId, by = 1) => {
    const current = get().research;
    const next = withResearchTally(current, speciesId, taskId, by);
    if (next !== current) set({ research: next });
  },
  announcements: [],
  publishAnnouncement: (ann) => {
    const current = get().announcements;
    const next = publishAnnouncementList(current, ann);
    if (next !== current) set({ announcements: next });
  },
  publishScheduleAnnouncements: (entries, ctx, dayIndex, textFor) => {
    const current = get().announcements;
    const next = publishScheduleAnnouncementsList(current, entries, ctx, dayIndex, textFor);
    if (next !== current) set({ announcements: next });
  },
  completedEvents: [],
  defeatedTrainers: [],
  gardenRecords: {},
  setGardenRecord: (creatureId, record) => set(s => ({ gardenRecords: { ...s.gardenRecords, [creatureId]: record } })),
  guardian: null,
  setGuardian: (guardian) => set({ guardian }),
  gardenMinutes: 0,
  setGardenMinutes: (minutes) => set({ gardenMinutes: minutes }),
  worldClock: null,
  setWorldClock: (anchor) => set({ worldClock: anchor }),
  daycareSteps: 0,
  setDaycareSteps: (steps) => set({ daycareSteps: steps }),
  daycarePartner: null,
  setDaycarePartner: (partner) => set({ daycarePartner: partner }),
  infiniteMoney: false,
  cheatLog: [],
  guaranteedCatch: false,
  noEncounters: false,
  infiniteItems: false,
  expMultiplier: 1,
  setGuaranteedCatch: (v) => set({ guaranteedCatch: v }),
  setNoEncounters: (v) => set({ noEncounters: v }),
  setInfiniteItems: (v) => set({ infiniteItems: v }),
  setExpMultiplier: (v) => set({ expMultiplier: v }),
  setInfiniteMoney: (v) => set({ infiniteMoney: v }),
  recordCheatUse: (code) => set(s => ({ cheated: true, cheatLog: [...s.cheatLog, { code, at: Date.now() }] })),
  // Free inventory grant — ONE action, two caller families
  // (composition unification, landing-composition 2026-10-29):
  // stub-kill S-7's drops/pickups call addItem(itemId) for +1; the
  // cheat registry calls addItem(itemId, 99) for its grant codes.
  // The cheat lane's (itemId, qty) signature carries both; qty
  // defaults to 1 so the S-7 call sites are unchanged.
  addItem: (itemId, qty = 1) => set(s => ({ inventory: { ...s.inventory, [itemId]: (s.inventory[itemId] || 0) + qty } })),
  daycareEgg: null,
  setDaycareEgg: (egg) => set({ daycareEgg: egg }),
  rangerHp: 0,
  rangerMaxHp: 0,
  ensureRangerHealth: (leadLevel) => {
    const { rangerHp, rangerMaxHp } = get();
    const derived = deriveRangerMaxHp(leadLevel);
    if (rangerMaxHp <= 0) {
      // First derivation: a fresh pool, full.
      set({ rangerHp: derived, rangerMaxHp: derived });
    } else if (derived > rangerMaxHp) {
      // The journey outgrew the pool: the max rises and the
      // difference is granted (level-up top-up of the delta only —
      // wounds already taken stay taken).
      set({ rangerHp: rangerHp + (derived - rangerMaxHp), rangerMaxHp: derived });
    }
  },
  damageRanger: (amount) => {
    const { rangerHp, rangerMaxHp } = get();
    const out = applyRangerDamage({ hp: rangerHp, maxHp: rangerMaxHp }, amount);
    set({ rangerHp: out.health.hp, rangerMaxHp: out.health.maxHp });
    return { hp: out.health.hp, dealt: out.dealt, downedNow: out.downedNow };
  },
  healRangerBy: (amount) => {
    const { rangerHp, rangerMaxHp } = get();
    if (rangerMaxHp <= 0) return;
    const out = applyRangerHeal({ hp: rangerHp, maxHp: rangerMaxHp }, amount);
    set({ rangerHp: out.hp });
  },
  healRangerFull: () => {
    const { rangerHp, rangerMaxHp } = get();
    if (rangerMaxHp <= 0) return;
    const out = applyRangerFullHeal({ hp: rangerHp, maxHp: rangerMaxHp });
    set({ rangerHp: out.hp });
  },
  deedLedger: [],
  appendDeed: (entry) => set(s => ({ deedLedger: [...s.deedLedger, entry] })),
  livingWorld: emptyLivingWorldState(),
  setLivingWorld: (state) => set({ livingWorld: state }),
  techniqueFlags: {},
  setTechniqueFlag: (flag, held) => set(s => ({ techniqueFlags: { ...s.techniqueFlags, [flag]: held } })),
  identifiedItems: [],
  identifyItem: (itemId) => set(s => ({
    identifiedItems: s.identifiedItems.includes(itemId) ? s.identifiedItems : [...s.identifiedItems, itemId]
  })),
  keepsakeLog: [],
  appendKeepsakeFact: (fact) => set(s => ({
    keepsakeLog: [...s.keepsakeLog, { ...fact, seq: s.keepsakeLog.length + 1 }]
  })),
  currentMap: 'sector0',
  playerPos: { x: 21, y: 14 },
  hasSprintBoots: false,
  setHasSprintBoots: (v) => set({ hasSprintBoots: v }),
  settings: loadStoredSettings(),
  setSettings: (patch) => set(s => {
    const next = { ...s.settings, ...patch };
    persistSettings(next);
    applyFontRoles(next);
    // SOUND routing: the stored mode is applied to the Web Audio
    // graph on every settings change, not just in SettingsScreen.
    applySoundMode(next.sound);
    return { settings: next };
  }),
  cheated: false,
  shiny: false,
  noclip: false,
  fastForward: false,
  setCheatFlags: (flags) => set(flags),

  // Restored from the persisted hold (saveSystem), so a START OVER
  // hold survives Quit-to-Title reloads instead of silently
  // vanishing with module state (attempt 8 timestamp-stamp bug).
  autosaveHeldForSlot: getAutosaveHold(),
  setAutosaveHeldForSlot: (slot) => { setAutosaveHold(slot); set({ autosaveHeldForSlot: slot }); },

  setPlayerInfo: (name, gender, slot) => set({ playerName: name, playerGender: gender, saveSlot: slot }),
  setRivalName: (name) => set({ rivalName: name }),
  loadState: (state) => {
    // Playtest 2026-10-26 (live Pages, step 4): a font row changed in
    // Settings and saved to localStorage was lost after loading an
    // older save, because the old save's settings overwrote the newer
    // localStorage settings and were then persisted back. Settings
    // the player chose most recently win: the store's current settings
    // already came from localStorage at boot, or from a later Settings
    // save in this session, so they are newer than any save written
    // before that change. Only when the current settings are still
    // exactly the defaults (no stored choice, no in-session change)
    // does the save's own settings win, so a save carried to a fresh
    // install still brings its settings with it. The merged result is
    // persisted, so the next save written over this slot converges.
    const savedSettings = ((state as any).settings || {}) as Partial<GameSettings>;
    const currentSettings = get().settings;
    const currentIsDefault = (Object.keys(DEFAULT_SETTINGS) as (keyof GameSettings)[])
      .every(k => (currentSettings as any)[k] === (DEFAULT_SETTINGS as any)[k]);
    const nextSettings: GameSettings = currentIsDefault
      ? { ...DEFAULT_SETTINGS, ...savedSettings }
      : { ...DEFAULT_SETTINGS, ...savedSettings, ...currentSettings };
    persistSettings(nextSettings);
    applyFontRoles(nextSettings);
    applySoundMode(nextSettings.sound);
    setAutosaveHold(null);
    // Gap-fill S7 slice 2: old saves carry party/pc members with no
    // individual record (slice 1 made the field optional so they load
    // unchanged). Backfill here, in memory, for exactly the arrays this
    // save carries — a member with a record keeps it (never re-rolled),
    // and a partial loadState call carrying no party/pc adds no key, so
    // the store's current arrays are never wiped by a partial load.
    // Every save-load path funnels through loadState (SaveMenu's
    // loadGame, IntroSequence, CheatConsole, WorldEngine autosave), so
    // this one site covers all of them.
    const backfilled: Partial<GameState> = {};
    if (Array.isArray(state.party)) backfilled.party = backfillIndividuals(state.party);
    if (Array.isArray(state.pc)) backfilled.pc = backfillIndividuals(state.pc);
    set({ ...state, ...backfilled, settings: nextSettings, introCompleted: true, rivalName: (state as any).rivalName || 'Hex', autosaveHeldForSlot: null });
  },
  completeIntro: () => set({ introCompleted: true }),
  
  initializeStarter: (speciesId) => {
    const starter = createMochii(speciesId, 5);
    if (starter) {
      set(state => ({ 
        party: [starter], 
        dex: { [speciesId]: 'caught' },
        inventory: { ...state.inventory, 'luigi_cube': (state.inventory['luigi_cube'] || 0) + 5 }
      }));
    }
  },

  healParty: () => {
    // v5.1 HP sync: heal writes BOTH hp and currentHp. Before
    // v5.1 it wrote hp only, so a healed party would still enter
    // its next battle at the old damaged currentHp.
    // Ranger-defense extension (2026-10-29): a healer heals the
    // household — the Ranger companion's pool is restored by the
    // same beat (Mochi Center / Mom, every isHeal path calls this).
    // His pool is only touched once it exists (maxHp > 0), so a
    // pre-creature-mode heal never founds it early.
    // Gap-fill S6 step 6: a healer restores PP to full too (the
    // restore half of PP write-back — without it, spent PP would
    // deplete with no recovery, the reason battleWiring left the
    // resolver's PP unwritten). A member with no moves keeps an
    // empty pp array; a member whose pp was never tracked gains
    // its full list, the same initialisation createMochii uses.
    set(state => ({
      party: state.party.map(m => {
        const healed = { ...m, hp: m.maxHp, currentHp: m.maxHp, status: null, pp: worldFullPp(m.moves) };
        // Gap-fill S8 slice 5: recovering from poison at 1 HP pays
        // -50 mood (TEARDOWN-HGSS §1). The test is the PRE-heal state:
        // status exactly "poison" (not toxic — the teardown names
        // poison) and (currentHp ?? hp) === 1. A member poisoned above
        // 1 HP, a member at 1 HP without poison, and a member with no
        // individual record all heal unchanged (withMoodEvent).
        const wasPoisonAt1 = m.status === "poison" && ((m as any).currentHp ?? m.hp) === 1;
        return wasPoisonAt1 ? withMoodEvent(healed, "poison-recovery-1hp") : healed;
      }),
      rangerHp: state.rangerMaxHp > 0 ? state.rangerMaxHp : state.rangerHp
    }));
  },

  addMochii: (mochii) => {
    const { party, pc } = get();
    set(s => ({ dex: { ...s.dex, [mochii.speciesId]: 'caught' } }));
    if (party.length < 6) {
      set({ party: [...party, mochii] });
    } else {
      set({ pc: [...pc, mochii] });
    }
  },

  gainWallet: (amount) => set(s => ({ wallet: s.wallet + amount })),

  buyItem: (itemId, cost) => {
    const state = get();
    // INFINITE MONEY cheat (recorded in cheatLog when toggled):
    // purchases grant the item without deducting the wallet.
    if (state.infiniteMoney) {
      set(s => ({
        inventory: { ...s.inventory, [itemId]: (s.inventory[itemId] || 0) + 1 }
      }));
      return true;
    }
    if (state.wallet >= cost) {
      set(s => ({
        wallet: s.wallet - cost,
        inventory: { ...s.inventory, [itemId]: (s.inventory[itemId] || 0) + 1 }
      }));
      return true;
    }
    return false;
  },

  useItem: (itemId) => {
    const state = get();
    if (state.inventory[itemId] > 0) {
      // INFINITE ITEMS cheat (recorded in cheatLog when toggled):
      // the use succeeds but the count never decreases — the mirror
      // of INFINITE MONEY's buyItem path above.
      if (state.infiniteItems) return true;
      set(s => ({
        inventory: { ...s.inventory, [itemId]: s.inventory[itemId] - 1 }
      }));
      return true;
    }
    return false;
  },

  updatePartyMember: (index, updated) => {
    set(s => {
      const newParty = [...s.party];
      newParty[index] = updated;
      return { party: newParty };
    });
  },
  driftFollowerMood: () => {
    const party = get().party;
    const next = driftLeadMood(party);
    if (next !== party) set({ party: next });
  },
  resetFollowerMoodOnLeadChange: (prevLeadId) => {
    const party = get().party;
    const next = resetLeadMoodOnChange(party, prevLeadId);
    if (next !== party) set({ party: next });
  },

  handoverFollowerFind: () => {
    const party = get().party;
    const leadId = followerLeadId(party);
    if (!leadId) return { outcome: "none", itemId: null };
    const idx = party.findIndex((m) => m.id === leadId);
    if (idx < 0) return { outcome: "none", itemId: null };
    const { member: nextMember, handover } = withPendingHandover(party[idx]);
    if (handover.outcome === "none" || nextMember === party[idx]) return handover;
    const nextParty = [...party];
    nextParty[idx] = nextMember;
    if (handover.outcome === "handed" && handover.itemId) {
      const handedId = handover.itemId;
      set((s) => ({ party: nextParty, inventory: { ...s.inventory, [handedId]: (s.inventory[handedId] || 0) + 1 } }));
    } else {
      set({ party: nextParty });
    }
    return handover;
  },

  addBadge: (badge) => set(s => ({ badges: s.badges.includes(badge) ? s.badges : [...s.badges, badge] })),
  updateDex: (id, status) => set(s => ({ dex: { ...s.dex, [id]: s.dex[id] === 'caught' ? 'caught' : status } })),
  completeEvent: (id) => set(s => ({ completedEvents: [...s.completedEvents, id] })),
  defeatTrainer: (id) => set(s => ({ defeatedTrainers: [...s.defeatedTrainers, id] })),
  setMapState: (mapId, pos) => set({ currentMap: mapId, playerPos: pos })
}));
