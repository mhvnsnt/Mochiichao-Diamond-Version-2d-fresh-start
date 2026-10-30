"""End-to-end test for fuel_rag on the shipped sample documents.

Runs the REAL pipeline on this machine: chunk -> TF-IDF embed ->
SQLite store -> retrieve -> context block -> persistence reload ->
embedder guard. No mocks in the retrieval path. The neural embedder
path is exercised only for its honest NOT CONFIGURED failure (the
library is not a dependency of this package); its live proof is a
first-run item wherever sentence-transformers is installed.

Run: python3 test_fuel_rag.py   (exit 0 = all checks passed)
"""
from __future__ import annotations

import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import fuel_rag  # noqa: E402

HERE = Path(__file__).resolve().parent
SAMPLES = HERE / "sample_docs"

CASES = [
    ("what colour are Dorowani's fin cheeks?", "dorowani.md"),
    ("how many GPU hours per week does the free tier give?", "kaggle-budget.md"),
    ("where do model weights live permanently, GitHub or TeraBox?", "staging.md"),
    ("which verifier is the only pass issuer?", "wielder-rules.md"),
    ("which model runs on the phone by default and how big is it?", "phone-seat.md"),
    ("how many shards does the music model have?", "terabox-music.md"),
]

failures: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    print(f"{'PASS' if cond else 'FAIL'}  {name}" + (f"  — {detail}" if detail else ""))
    if not cond:
        failures.append(name)


def main() -> int:
    with tempfile.TemporaryDirectory() as td:
        db = Path(td) / "test.sqlite"
        rag = fuel_rag.FuelRAG(db)
        counts = rag.ingest_dir(SAMPLES)
        st = rag.stats()
        check("ingest: all sample docs present", len(counts) == 6, str(counts))
        check("ingest: chunks >= documents", st["chunks"] >= st["documents"] == 6,
              f"chunks={st['chunks']}")

        for query, expected in CASES:
            hits = rag.retrieve(query, k=3)
            top = hits[0]["source"] if hits else None
            check(f"retrieve top-1: {expected}", top == expected,
                  f"query={query!r} top={top} scores={[h['score'] for h in hits]}")

        block = rag.context_block("how many GPU hours per week?", k=2)
        check("context block carries source tags",
              "kaggle-budget.md" in block and "RETRIEVED EVIDENCE" in block)

        empty = rag.context_block("zzzqqq nonexistentterm", k=3)
        check("no-evidence query returns empty block, not a fabrication", empty == "")
        rag.close()

        # Persistence: a fresh instance reads the same store.
        rag2 = fuel_rag.FuelRAG(db)
        hits = rag2.retrieve("what colour are the fin cheeks?", k=1)
        check("persistence: store reopens and retrieves",
              bool(hits) and hits[0]["source"] == "dorowani.md")
        rag2.close()

        # Embedder guard: a dense-embedder seat must refuse a sparse store.
        class FakeDense(fuel_rag.TfidfEmbedder):
            name = "sentence-transformers:fake"
        try:
            fuel_rag.FuelRAG(db, FakeDense())
            check("embedder guard refuses mixed store", False, "no error raised")
        except RuntimeError as e:
            check("embedder guard refuses mixed store", "VECTOR-SPACE GUARD" in str(e))

        # Neural path honesty: without the library it must say NOT CONFIGURED.
        try:
            fuel_rag.make_embedder("st:BAAI/bge-small-en-v1.5")
            print("NOTE  neural embedder library present on this machine; "
                  "NOT CONFIGURED check skipped (live path available)")
        except RuntimeError as e:
            check("neural embedder fails honest when library absent",
                  "NOT CONFIGURED" in str(e))

    print(f"\n{len(CASES) + 6 - len(failures)}/{len(CASES) + 6} checks passed"
          if not failures else f"\nFAILURES: {failures}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
