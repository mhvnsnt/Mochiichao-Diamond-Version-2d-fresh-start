"""WIELDER skill import — SKILL.md files become Wielder skills.

Round-1 parity gap #2: the agent field's reusable-guidance format is
the SKILL.md file (a folder's `SKILL.md`: YAML frontmatter carrying
`name` + `description`, the body carrying the instructions — the
format used across `/opt/muse/skills/*/SKILL.md` and by the Codex /
OpenHands / Cline skill systems in the parity sweep). Wielder had no
way to take one in. This module is that adapter, built to Wielder's
rules rather than the donors':

- **Guidance data, never code.** An imported skill is stored as text
  in Wielder's own skill registry (`wielder/skills.json` in the
  package — the same package-config pattern as `hooks.json` and
  `mcp-servers.json`, with a loader in this module). Nothing in the
  registry is ever executed, imported, or eval'd; there is no code
  path from a skill record to the tool layer. A skill can inform a
  plan the way a method record informs one — the graph, the gates
  and the constitution stay exactly where they were.
- **Prompt hygiene at the door.** The name, description and body pass
  through Wielder's first-person scrubber (`wielder.scrub`, the same
  scrub applied to card text at perceive) so authorship anchoring in
  a donor skill cannot bias a run. The body is scrubbed line-by-line
  so its Markdown structure survives.
- **Rules-registry check at load.** The scrubbed skill is checked
  with `wielder.rules.check_text` — a banned term (a settled owner
  ruling) rejects the import with the ruling cited, exactly as a
  plan naming one fails at PLANNING.
- **No self-authorization, ever.** Following the instruction-gate
  pattern (a skill is an instruction surface, so it is gated like
  one): a skill whose text tries to override the constitution, the
  finish gate or the rules registry, to grant or claim authorization
  for itself, or to claim one of the Standing Authorization Ledger's
  never-grantable classes (`wielder.authz.NEVER_GRANTABLE`) is
  REJECTED, not scrubbed into compliance — the attempt is the
  finding. Importing is the only write path and it grants nothing.

Frontmatter-less files (a bare `# Title` + body, as some shipped
SKILL.md files are) import too: the name comes from the first H1 and
the description from the first body paragraph. A file with neither
frontmatter nor an H1 has no name and is rejected.
"""
from __future__ import annotations

import json
import re
import time
from pathlib import Path
from typing import Optional

from . import constitution as C
from . import rules as rules_mod
from .scrub import scrub

CONFIG_NAME = "skills.json"

_ABOUT = (
    "WIELDER skill registry (wielder/skill_import.py). Each entry is "
    "guidance data imported from a SKILL.md file — never executable "
    "code. Imports pass the prompt-hygiene scrub (wielder.scrub), the "
    "rules-registry check (wielder.rules) and the self-authorization "
    "gate in skill_import.py. Empty by default."
)


class SkillImportError(RuntimeError):
    pass


def _now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S%z")


def registry_path() -> Path:
    return C.WIELDER_HOME / CONFIG_NAME


# ---------------------------------------------------------------------------
# Registry (the hooks.json / mcp-servers.json pattern: package JSON + loader)
# ---------------------------------------------------------------------------

def load_skills(path: Optional[Path] = None) -> list[dict]:
    p = Path(path) if path else registry_path()
    if not p.exists():
        return []
    return list(json.loads(p.read_text()).get("skills", []))


def _save_skills(skills: list[dict], path: Optional[Path] = None) -> Path:
    p = Path(path) if path else registry_path()
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps({"_about": _ABOUT, "skills": skills}, indent=1))
    return p


def get_skill(name: str, path: Optional[Path] = None) -> Optional[dict]:
    for s in load_skills(path):
        if s.get("id") == _slug(name) or s.get("name") == name:
            return s
    return None


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.strip().lower()).strip("-")


# ---------------------------------------------------------------------------
# SKILL.md parsing
# ---------------------------------------------------------------------------

def _parse_frontmatter_block(block: str) -> dict:
    """YAML frontmatter -> dict. PyYAML when importable; otherwise a
    flat `key: value` parser (the SKILL.md frontmatter Wielder needs
    — name/description — is flat by format)."""
    try:
        import yaml  # type: ignore
        data = yaml.safe_load(block) or {}
        return dict(data) if isinstance(data, dict) else {}
    except ImportError:
        pass
    out: dict = {}
    for line in block.splitlines():
        m = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", line)
        if m:
            out[m.group(1)] = m.group(2).strip().strip("'\"")
    return out


def _derive_description(body: str) -> str:
    """First body paragraph of a frontmatter-less file: the first
    non-heading line (a leading bullet marker is stripped)."""
    for line in body.splitlines():
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        s = re.sub(r"^[-*+]\s+", "", s)
        return s[:300]
    return ""


def parse_skill_markdown(text: str, source: str = "") -> dict:
    """Parse SKILL.md text into {name, description, body, frontmatter}.
    Raises SkillImportError when no name can be established."""
    text = (text or "").replace("\r\n", "\n")
    frontmatter: dict = {}
    body = text
    if text.startswith("---\n") or text.startswith("---\r\n"):
        end = text.find("\n---", 3)
        if end != -1:
            frontmatter = _parse_frontmatter_block(text[4:end])
            body = text[end + 4:].lstrip("\n")
    name = str(frontmatter.get("name") or "").strip()
    description = str(frontmatter.get("description") or "").strip()
    if not name:
        m = re.search(r"^#\s+(.+?)\s*$", body, flags=re.M)
        if m:
            name = m.group(1).strip()
    if not name:
        raise SkillImportError(
            f"{source or 'SKILL.md'}: no skill name — neither YAML "
            "frontmatter `name` nor a leading `# Title` heading")
    if not description:
        description = _derive_description(body)
    body = body.strip()
    if not body:
        raise SkillImportError(f"{source or 'SKILL.md'}: skill body is empty — "
                               "a skill is its instructions; there are none")
    return {"name": name, "description": description, "body": body,
            "frontmatter": frontmatter}


# ---------------------------------------------------------------------------
# The gate: scrub + rules-registry + no self-authorization
# ---------------------------------------------------------------------------

# Instruction-gate patterns for a guidance surface. Each is an attempt
# to change who governs the run; guidance may inform a run, it may
# never govern one. Matched case-insensitively over name+description+body.
_FORBIDDEN: list[tuple[re.Pattern, str]] = [
    (re.compile(r"ignore\s+(all\s+)?(previous|prior|above|earlier)\s+"
                r"(instructions|directions|rules|prompts)", re.I),
     "instructs the reader to ignore prior instructions"),
    (re.compile(r"(override|bypass|disable|disregard|circumvent)\s+"
                r"(the\s+|all\s+)?(constitution|finish[-\s]?gate|owner\s+gate|"
                r"rules[-\s]?registry|standing\s+authorization|verifier)", re.I),
     "tries to override the constitution / finish gate / rules registry"),
    (re.compile(r"(grant|grants|granting|authorize|authorizes|authorizing|"
                r"approve|approves)\s+(yourself|itself|this\s+skill|the\s+skill)", re.I),
     "tries to grant itself authorization"),
    (re.compile(r"this\s+skill\s+is\s+(hereby\s+)?(authorized|approved|granted)", re.I),
     "claims authorization for itself"),
    (re.compile(r"you\s+are\s+(now\s+)?(authorized|approved)\s+to", re.I),
     "claims the reader is authorized by the skill"),
]


def _forbidden_hits(text: str) -> list[str]:
    hits = [label for rx, label in _FORBIDDEN if rx.search(text)]
    # A never-grantable class named as granted/claimed is the same
    # attempt in the ledger's own vocabulary (wielder.authz).
    from . import authz as _authz
    for cls in _authz.NEVER_GRANTABLE:
        if re.search(rf"(grant\w*|authoriz\w*|approv\w*|pre[-\s]?approved)"
                     rf"[^.\n]{{0,60}}{re.escape(cls)}", text, flags=re.I) or \
           re.search(rf"{re.escape(cls)}[^.\n]{{0,40}}"
                     rf"(is\s+)?(granted|authorized|approved)", text, flags=re.I):
            hits.append(f"claims the never-grantable class {cls!r}")
    return hits


def _scrub_body(body: str) -> str:
    """wielder.scrub is a whole-text rewriter (it collapses runs of
    whitespace); applied per line it keeps the body's Markdown intact."""
    return "\n".join(scrub(ln) if ln.strip() else ln for ln in body.splitlines())


def vet_skill(name: str, description: str, body: str) -> tuple[str, str, str]:
    """Scrub + check one parsed skill. Returns the scrubbed
    (name, description, body); raises SkillImportError on a
    rules-registry violation or a self-authorization attempt."""
    s_name, s_desc, s_body = scrub(name), scrub(description), _scrub_body(body)
    combined = f"{s_name}\n{s_desc}\n{s_body}"
    try:
        rules_mod.check_text(combined, context=f"skill {s_name!r}")
    except rules_mod.RuleViolation as e:
        raise SkillImportError(str(e)) from e
    hits = _forbidden_hits(combined)
    if hits:
        raise SkillImportError(
            f"skill {s_name!r} rejected at the instruction gate: "
            + "; ".join(hits)
            + " — a skill is guidance data; it cannot change who "
              "governs a run or grant authorization (wielder.authz)")
    return s_name, s_desc, s_body


# ---------------------------------------------------------------------------
# Import — the only write path
# ---------------------------------------------------------------------------

def import_skill(source: str | Path, registry: Optional[Path] = None) -> dict:
    """Import one SKILL.md file into the Wielder skill registry.
    Re-importing the same skill id replaces its record (the registry
    is configuration, kept current — the current-version rule)."""
    src = Path(source)
    if not src.exists():
        raise SkillImportError(f"skill file not found: {src}")
    parsed = parse_skill_markdown(src.read_text(errors="replace"), source=str(src))
    name, description, body = vet_skill(parsed["name"], parsed["description"],
                                        parsed["body"])
    record = {
        "id": _slug(name),
        "name": name,
        "description": description,
        "body": body,
        "kind": "guidance",          # data only — never executed
        "executable": False,
        "source": str(src),
        "frontmatter": parsed["frontmatter"],
        "imported_at": _now(),
    }
    skills = [s for s in load_skills(registry) if s.get("id") != record["id"]]
    skills.append(record)
    _save_skills(skills, registry)
    return record
