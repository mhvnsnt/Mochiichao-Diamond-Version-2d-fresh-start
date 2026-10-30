# TEARDOWN — Epic / Unreal Engine (patterns level)

**Licence (verified at source):** Unreal Engine is **proprietary and
EULA-gated**. The full C++ source lives in a *private* GitHub repository
(`EpicGames/UnrealEngine`); access requires (1) an Epic Games account,
(2) linking that account to a GitHub account, (3) accepting the Unreal
Engine EULA, and (4) accepting the EpicGames org invitation — an unlinked
visitor gets a 404. The EULA also forbids combining engine code with
copyleft-licensed code and permits sharing source only with other licensees
of the same version. Epic's genuinely open-source side-projects (labeled
`open-source` in the EpicGames org, MIT/Apache) are separate repos and are
not the engine.

**Evidence grade: DOCS** for everything below (Epic's public documentation
describes these systems in depth). **The source itself is a GAP** — see §4.

**What this teardown is:** the three Unreal systems whose *patterns* a 2D
open-world RPG genuinely needs — animation state machines, behaviour
trees + blackboards, and the replication model — torn down from Epic's
public docs and mapped onto Mochiichao's existing native systems. No Unreal
code, no Unreal assets; we are not building in Unreal. The value is that
Epic has spent 25 years naming and refining these patterns; we take the
names and the discipline, in our own formats.

---

## 1. Animation state machines (AnimBP)

Epic's documented model:

- An **AnimGraph** evaluates per frame: **state machines** (states hold
  poses/animation graphs; **transitions** carry rules and blend durations;
  **conduit** states route without posing) feed **cached poses** (evaluate
  once, reuse in several places) and layered blends.
- The iron rule: **gameplay code requests states and sets variables; it
  never plays animations directly.** The state machine owns "what does
  running-while-turning look like"; gameplay owns "the creature is fleeing".

**Native mapping — already half-built, named here as the same pattern:**
the movement system's battle-staging classes and behaviour axes (PR #66)
and the show's `move-animscript/v1` grammar are this pattern in our
formats: staging/state names on the data side, performances resolved by
the presentation layer. What this teardown adds is the *conduit* and
*cached pose* vocabulary for the show side: a conduit = a routing beat
with no pose of its own (e.g. "turn to face partner" inside a PRESENT
pair-pose), a cached pose = a held pose reused across cuts (the posing
system's held poses). Recorded as cross-reference, no new files needed.

## 2. Behaviour Trees + Blackboard

Epic's documented model:

- A **Blackboard** is the AI's shared notebook: named, typed keys
  (object/vector/float/bool…) that perception, behaviour, and gameplay all
  read/write.
- A **Behavior Tree** runs from its root each tick: **composites**
  (Selector = try children until one succeeds; Sequence = run children
  until one fails) over **tasks** (do a thing) and **decorators**
  (conditions that gate or abort a branch), with **services** updating
  blackboard keys on intervals while their branch is active.
- The discipline that makes it work: the tree is *reactive data*, not a
  script — any tick can re-decide from the root, and the blackboard is the
  only memory.

**Native mapping — the shape already exists in our data core; this
teardown names the join:** Mochiichao's wild individuals carry per-creature
memory (the individual record + wild-memory overlays) and per-area
behaviour profiles with two authored axes (movement system, PR #66;
spawn records carry `Behavior` fields in the Arceus template the movement
teardown verified). Read through Epic's lens: **the individual record is
the blackboard** (per-creature keys), **the area behaviour profile is the
tree's static shape** (per area+method), and the sim tick is the
evaluation clock (sim-core spec §5). Follow-on wiring, when behaviour work
resumes: express each profile as selector/sequence over the existing axes
in the profile's JSON — a format note in the movement system's home, not a
new system here. Western Heart's encounter AI inherits the same mapping.

## 3. Replication (the authority menu, Epic's naming)

Epic's documented multiplayer model, which is the clearest published
statement of the server-authoritative family:

- The **server is authoritative**; clients are rendering + input terminals
  with local prediction for their own pawn.
- **Actors replicate** when flagged; **properties** replicate with
  conditions (to everyone / owner only / simulated proxies…) and
  **relevancy** (distance/interest culls who hears about an actor);
  **RPCs** come in three kinds (server / client / multicast) with explicit
  reliability choices; **dormancy** lets unchanged actors sleep off the
  replication graph.

**Native mapping:** none of this ships today (no netplay surface), and the
teardown's job is to make the *decision vocabulary* ours before we need it:
sim-core §4 adopts Epic's terms (authority, relevancy, dormancy) beside
id's lockstep and GGPO's rollback so the first netplay design starts from
named options instead of vibes. Dormancy has a single-player echo we *do*
adopt now: off-screen areas' individuals sleep between ticks in the
world sim (sim-core §5) — the same idea at zero network cost.

## 4. THE GAP — the source itself

- **State:** unreachable from this seat. The repo is private; the PAT that
  serves the owner's GitHub has no Epic linkage, and creating that linkage
  means accepting a EULA in the owner's own Epic account.
- **The unlock (one owner action, his accounts, his browser):** sign in at
  unrealengine.com → Linked Accounts → connect GitHub (mhvnsnt) → accept
  the EULA → accept the EpicGames org invite. After that, a study pass
  could read engine source the way this pass read id's.
- **No workaround attempted or wanted:** mirrors of the engine source that
  circulate outside Epic's gate are licence violations; they are refused
  here on sight, per the standing rules.
- **What we lose by the gap, honestly:** implementation detail (how their
  replication graph is actually built, their exact state-machine
  evaluation order). The *patterns* — which are what a 2D TypeScript game
  can use — are fully documented in public, and those are delivered above.

## Sources (this pass)

- Unreal Engine FAQ (unrealengine.com) — source access, EULA terms,
  copyleft prohibition, licensee-only sharing; EpicGames GitHub org page —
  licensed vs open-source repo split; Epic's account-linking instructions,
  retrieved 2026-10-28.
- Epic public documentation (dev.epicgames.com): Animation Blueprints /
  state machines, Behavior Trees + Blackboard, Networking & Replication —
  long-standing public docs, described at pattern level.
