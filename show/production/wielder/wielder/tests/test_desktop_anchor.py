"""Desktop session-bus anchor (parity round 2, Job 2).

Root cause being pinned: after the 2026-10-28 restore, the restored
tree's data dir was overlaid wholesale from the old build tree —
including wielder/data/xdg-runtime/bus-address, whose CONTENTS are the
build tree's absolute address string. desktop.bus_address() computed
its file location from the CURRENT package (correct), but its only
validity check was "the socket at the address's path exists" — and
the old build tree still exists on the VM, socket file and all, so
the stale address passed and was trusted forever.

These tests plant exactly that fixture: a bus-address file in the
current runtime dir whose address points at a DIFFERENT (old) runtime
dir, with a live socket planted there too. The pre-fix logic
(replicated below as _legacy_bus_address) surfaces the stale path;
the fixed code treats it as stale and re-anchors.
"""
from __future__ import annotations

import socket
from pathlib import Path

import pytest

from wielder import desktop


def _legacy_bus_address(addr_file: Path) -> str | None:
    """The pre-fix bus_address(), verbatim logic: socket-lives is the
    only check, no anchor check."""
    if addr_file.exists():
        addr = addr_file.read_text().strip()
        path = addr.split("=", 1)[-1].split(",")[0] if "unix:path=" in addr else None
        if path and Path(path).exists():
            return addr
    return None


def _plant_socket(path: Path) -> None:
    """A real unix socket file at path (left on disk after close, like
    the build tree's leftover)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    s.bind(str(path))
    s.close()
    assert path.exists()


@pytest.fixture()
def anchor(tmp_path, monkeypatch):
    """Current runtime dir + an 'old build tree' runtime dir, with
    desktop's globals pointed at the current one."""
    # Short dir names on purpose: AF_UNIX socket paths cap at ~108
    # chars and pytest's tmp prefix is already long. These stand in
    # for <current home>/wielder/data/xdg-runtime and the old build
    # tree's .../phase3-build/wielder/data/xdg-runtime respectively.
    current = tmp_path / "cur-rt"
    old = tmp_path / "old-rt"
    current.mkdir(parents=True)
    old.mkdir(parents=True)
    monkeypatch.setattr(desktop, "RUNTIME_DIR", current)
    monkeypatch.setattr(desktop, "BUS_ADDR_FILE", current / "bus-address")
    monkeypatch.setattr(desktop.C, "DATA", tmp_path / "data")
    return {"current": current, "old": old,
            "stale_addr": f"unix:path={old}/bus,guid=deadbeef",
            "current_addr": f"unix:path={current}/bus,guid=cafef00d"}


def _plant_stale(anchor):
    _plant_socket(anchor["old"] / "bus")  # the old tree's socket still lives
    (anchor["current"] / "bus-address").write_text(anchor["stale_addr"])


def test_legacy_logic_would_surface_the_stale_path(anchor):
    """Proof the fixture reproduces the restore wart: pre-fix code
    returns the build-tree address."""
    _plant_stale(anchor)
    assert _legacy_bus_address(anchor["current"] / "bus-address") == anchor["stale_addr"]


def test_fixed_code_rejects_stale_anchor(anchor):
    _plant_stale(anchor)
    assert desktop.bus_address() is None
    # ...and it can name what it discarded, for evidence.
    assert desktop.stale_bus_address() == anchor["stale_addr"]


def test_current_anchor_is_trusted(anchor):
    _plant_socket(anchor["current"] / "bus")
    (anchor["current"] / "bus-address").write_text(anchor["current_addr"])
    assert desktop.bus_address() == anchor["current_addr"]
    assert desktop.stale_bus_address() is None


def test_dead_socket_in_current_dir_is_still_distrusted(anchor):
    # Anchored correctly but the socket is gone — the original
    # socket-lives check must keep working alongside the anchor check.
    (anchor["current"] / "bus-address").write_text(anchor["current_addr"])
    assert desktop.bus_address() is None


def test_ensure_bus_reanchors_and_reports_the_discard(anchor, monkeypatch):
    _plant_stale(anchor)

    def fake_run(cmd, timeout=60, env=None):
        _plant_socket(anchor["current"] / "bus")
        class P:
            returncode = 0
            stdout = anchor["current_addr"] + "\n"
            stderr = ""
        return P()

    monkeypatch.setattr(desktop, "_run", fake_run)
    result = desktop.ensure_bus()
    assert result["bus"] == anchor["current_addr"]
    assert result["stale_address_discarded"] == anchor["stale_addr"]
    # The persisted file now holds the re-anchored address, and it reads back.
    assert (anchor["current"] / "bus-address").read_text() == anchor["current_addr"]
    assert desktop.bus_address() == anchor["current_addr"]


def test_ensure_bus_noop_when_current_bus_lives(anchor):
    _plant_socket(anchor["current"] / "bus")
    (anchor["current"] / "bus-address").write_text(anchor["current_addr"])
    assert desktop.ensure_bus() == {"bus": anchor["current_addr"], "action": "none"}


def test_env_for_drops_inherited_stale_bus_address(anchor, monkeypatch):
    monkeypatch.setenv("DBUS_SESSION_BUS_ADDRESS", anchor["stale_addr"])
    env = desktop.env_for()
    assert "DBUS_SESSION_BUS_ADDRESS" not in env  # stale inherited anchor not handed on
    assert env["XDG_RUNTIME_DIR"] == str(anchor["current"])


def test_env_for_uses_current_bus_address(anchor, monkeypatch):
    _plant_socket(anchor["current"] / "bus")
    (anchor["current"] / "bus-address").write_text(anchor["current_addr"])
    monkeypatch.delenv("DBUS_SESSION_BUS_ADDRESS", raising=False)
    env = desktop.env_for()
    assert env["DBUS_SESSION_BUS_ADDRESS"] == anchor["current_addr"]
