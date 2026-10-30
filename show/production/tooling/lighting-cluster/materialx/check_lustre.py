#!/usr/bin/env python3
"""Check the lustre MaterialX file against LIGHTING-SYSTEM.md section 6.

Loads lustre_sheen.mtlx with the real MaterialX library (standard
libraries loaded) and verifies:
  1. the document is schema-valid MaterialX;
  2. the LV-3 dial states exist as data: day sheen 1.0, night 0.35,
     Dark Forest 0.0 (sheen absent - LV-3's hard case);
  3. LV-1: the graph's locked base colour is Dorowani's sheet deep
     blue #3070b0;
  4. LV-4/CS-2: no colour anywhere in the file sits near the
     quarantined accent red #a03436.

Usage:  python3 check_lustre.py [path-to-lustre_sheen.mtlx]
Exit:   0 = all checks pass, 1 = failure.
Requires: MaterialX (pip install MaterialX) - a tool install.
"""

import os
import sys

import MaterialX as mx

HERE = os.path.dirname(os.path.abspath(__file__))
DEEP_BLUE = (0x30 / 255.0, 0x70 / 255.0, 0xB0 / 255.0)
ACCENT_RED = (0xA0 / 255.0, 0x34 / 255.0, 0x36 / 255.0)
EXPECTED_SHEEN = {"lustre_day": 1.0, "lustre_night": 0.35, "lustre_dark_forest": 0.0}

results = []


def check(ok, label, detail=""):
    results.append(bool(ok))
    print(("PASS  " if ok else "FAIL  ") + label + ((" - " + detail) if detail else ""))


def colors_in(elem):
    """Yield every color3 value authored anywhere under elem."""
    for child in elem.getChildren():
        yield from colors_in(child)
    if hasattr(elem, "getValue") and hasattr(elem, "getType") and elem.getType() == "color3":
        v = elem.getValue()
        if v is not None:
            yield (elem.getNamePath(), (v[0], v[1], v[2]))


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "lustre_sheen.mtlx")
    doc = mx.createDocument()
    mx.loadLibraries(mx.getDefaultDataLibraryFolders(),
                     mx.getDefaultDataSearchPath(), doc)
    mx.readFromXmlFile(doc, path)
    ok, msg = doc.validate()
    check(ok, "document is schema-valid MaterialX 1.39", msg.strip()[:200])

    for name, want in EXPECTED_SHEEN.items():
        node = doc.getNode(name)
        check(node is not None, f"LV-3 state instance present: {name}")
        if node is not None:
            got = node.getInput("sheen_amount").getValue()
            check(abs(got - want) < 1e-6, f"{name} sheen_amount == {want}", f"got {got}")
        mat = doc.getNode("M_" + name)
        check(mat is not None, f"material binding present: M_{name}")

    graph = doc.getNodeGraph("NG_lustre_look")
    check(graph is not None, "nodegraph NG_lustre_look present")
    if graph is not None:
        base = graph.getInput("base_color").getValue()
        got = (base[0], base[1], base[2])
        check(all(abs(a - b) < 0.01 for a, b in zip(got, DEEP_BLUE)),
              "LV-1 locked base colour is Dorowani deep blue #3070b0", str(got))

    near_red = [(p, c) for p, c in colors_in(doc)
                if sum((a - b) ** 2 for a, b in zip(c, ACCENT_RED)) ** 0.5 < 0.2]
    check(not near_red, "LV-4/CS-2 no colour in the file near quarantined accent red",
          "; ".join(p for p, _ in near_red))

    print(f"\n{sum(results)}/{len(results)} checks passed")
    return 0 if all(results) else 1


if __name__ == "__main__":
    sys.exit(main())
