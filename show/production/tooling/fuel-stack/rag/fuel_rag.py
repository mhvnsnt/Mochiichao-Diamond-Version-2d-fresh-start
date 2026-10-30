"""fuel_rag — the fuel stack's retrieval layer (item 8: do less work).

A small, dependency-light retrieval module the Wielder seats and the
grok-local server mode can call, so a small brain answers from fetched
evidence instead of spending parameters on memorised facts.

Design rules (Wielder house style, inherited on purpose):
- Stdlib only in the core path. No new dependency enters Wielder's
  runtime because of this module.
- Honest failure, never a fabricated answer: a missing optional
  embedder raises NOT CONFIGURED with the exact fix named; a store
  built by a different embedder refuses queries (vector-space guard)
  instead of returning garbage similarities.
- Advisory only: retrieved text is EVIDENCE for a seat's prompt. It
  never routes, never scores, never issues a verdict — the same rule
  brain.advise() lives under.

Embedders:
- TfidfEmbedder (built in): hashed-vocabulary TF-IDF, deterministic,
  zero downloads. Lexical, not neural — weaker on paraphrase, exact
  on terminology. This is the embedder the package's own end-to-end
  test runs, and the honest default until a neural embedder is
  installed on the seat.
- SentenceTransformerEmbedder (optional): wraps sentence-transformers
  (Apache-2.0) with a licence-clean open model — default
  BAAI/bge-small-en-v1.5 (MIT, 384-dim) or
  sentence-transformers/all-MiniLM-L6-v2 (Apache-2.0, 384-dim).
  First use downloads the weights ON THE SEAT (never vendored here).

Store: one SQLite file (stdlib sqlite3). Vectors are stored as JSON
term-weight maps (TF-IDF) or float lists (neural); search is exact
brute-force cosine — the right tool at programme scale (thousands of
chunks). If a corpus ever outgrows it, sqlite-vec (dual MIT /
Apache-2.0) is the documented accelerator; the store format keeps
chunk text + source beside every vector so a re-index is mechanical.

Licences: this module is ours. Optional pieces it can call:
sentence-transformers Apache-2.0; bge-small-en-v1.5 MIT;
all-MiniLM-L6-v2 Apache-2.0; sqlite-vec MIT/Apache-2.0 (optional).
"""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import sqlite3
import sys
from pathlib import Path

TOKEN_RE = re.compile(r"[a-z0-9]+")
DEFAULT_TOP_K = int(os.environ.get("FUEL_RAG_TOP_K", "3"))  # Wielder's RETRIEVAL_TOP_K default


def _tokens(text: str) -> list[str]:
    return TOKEN_RE.findall(text.lower())


def _cosine(a: dict[str, float], b: dict[str, float]) -> float:
    if not a or not b:
        return 0.0
    if len(a) > len(b):
        a, b = b, a
    dot = sum(w * b.get(t, 0.0) for t, w in a.items())
    na = math.sqrt(sum(w * w for w in a.values()))
    nb = math.sqrt(sum(w * w for w in b.values()))
    return dot / (na * nb) if na and nb else 0.0


# ---------------------------------------------------------------------------
# Embedders
# ---------------------------------------------------------------------------

class TfidfEmbedder:
    """Built-in lexical embedder. fit() on the corpus, then embed()."""

    name = "tfidf-builtin"
    kind = "sparse"

    def __init__(self) -> None:
        self.idf: dict[str, float] = {}
        self.n_docs = 0

    def fit(self, texts: list[str]) -> None:
        self.n_docs = len(texts)
        df: dict[str, int] = {}
        for t in texts:
            for tok in set(_tokens(t)):
                df[tok] = df.get(tok, 0) + 1
        n = max(self.n_docs, 1)
        self.idf = {t: math.log((n + 1) / (c + 1)) + 1.0 for t, c in df.items()}

    def embed(self, text: str) -> dict[str, float]:
        toks = _tokens(text)
        if not toks:
            return {}
        tf: dict[str, float] = {}
        for tok in toks:
            tf[tok] = tf.get(tok, 0.0) + 1.0
        return {t: (c / len(toks)) * self.idf.get(t, 1.0) for t, c in tf.items()}

    def signature(self) -> str:
        return f"{self.name}:vocab={len(self.idf)}:docs={self.n_docs}"


class SentenceTransformerEmbedder:
    """Optional neural embedder. Raises NOT CONFIGURED, never guesses."""

    kind = "dense"

    def __init__(self, model: str = "BAAI/bge-small-en-v1.5") -> None:
        self.name = f"sentence-transformers:{model}"
        self.model_id = model
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            raise RuntimeError(
                "NOT CONFIGURED — sentence-transformers is not installed on "
                "this seat. Fix: pip install sentence-transformers "
                "(Apache-2.0), or use the built-in tfidf embedder.")
        self._model = SentenceTransformer(model)

    def fit(self, texts: list[str]) -> None:  # neural embedders need no fit
        return None

    def embed(self, text: str) -> dict[str, float]:
        vec = self._model.encode(text, normalize_embeddings=True)
        return {str(i): float(v) for i, v in enumerate(vec)}

    def signature(self) -> str:
        return self.name


def make_embedder(spec: str):
    """'tfidf' (default) or 'st:<hf-model-id>' for the neural path."""
    if spec == "tfidf":
        return TfidfEmbedder()
    if spec.startswith("st:"):
        return SentenceTransformerEmbedder(spec[3:])
    raise ValueError(f"unknown embedder spec {spec!r} — use 'tfidf' or 'st:<model-id>'")


# ---------------------------------------------------------------------------
# Chunking
# ---------------------------------------------------------------------------

def chunk_text(text: str, max_chars: int = 800, overlap: int = 100) -> list[str]:
    paras = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    chunks: list[str] = []
    buf = ""
    for p in paras:
        if len(buf) + len(p) + 1 <= max_chars:
            buf = f"{buf}\n{p}" if buf else p
            continue
        if buf:
            chunks.append(buf)
        while len(p) > max_chars:
            chunks.append(p[:max_chars])
            p = p[max_chars - overlap:]
        buf = p
    if buf:
        chunks.append(buf)
    return chunks


# ---------------------------------------------------------------------------
# The store + retrieval API
# ---------------------------------------------------------------------------

class FuelRAG:
    def __init__(self, db_path: str | Path, embedder=None) -> None:
        self.db_path = Path(db_path)
        self.embedder = embedder or TfidfEmbedder()
        self.db = sqlite3.connect(str(self.db_path))
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS chunks ("
            "id INTEGER PRIMARY KEY, source TEXT, ord INTEGER, "
            "text TEXT, vector TEXT)")
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT)")
        self.db.commit()
        stored = self._meta("embedder_signature")
        if stored is not None and stored != self.embedder.signature():
            # A TF-IDF signature embeds corpus stats, so only enforce the
            # guard on the embedder family + model identity, not the fit.
            if stored.split(":")[0] != self.embedder.signature().split(":")[0]:
                raise RuntimeError(
                    f"VECTOR-SPACE GUARD — store at {self.db_path} was built "
                    f"by {stored!r}; this seat configured "
                    f"{self.embedder.signature()!r}. Re-ingest into a new "
                    "store; do not mix embedders in one store.")

    # -- internals ------------------------------------------------------
    def _meta(self, key: str):
        row = self.db.execute("SELECT value FROM meta WHERE key=?", (key,)).fetchone()
        return row[0] if row else None

    def _set_meta(self, key: str, value: str) -> None:
        self.db.execute("INSERT OR REPLACE INTO meta (key, value) VALUES (?,?)",
                        (key, value))
        self.db.commit()

    def close(self) -> None:
        self.db.close()

    # -- ingest ---------------------------------------------------------
    def ingest_text(self, source: str, text: str) -> int:
        chunks = chunk_text(text)
        self.db.execute("DELETE FROM chunks WHERE source=?", (source,))
        for i, ch in enumerate(chunks):
            self.db.execute(
                "INSERT INTO chunks (source, ord, text, vector) VALUES (?,?,?,?)",
                (source, i, ch, ""))  # vectors filled by _refit()
        self.db.commit()
        self._refit()
        return len(chunks)

    def ingest_dir(self, path: str | Path, glob: str = "*.md") -> dict[str, int]:
        out: dict[str, int] = {}
        for f in sorted(Path(path).glob(glob)):
            out[f.name] = self.ingest_text(f.name, f.read_text(encoding="utf-8"))
        return out

    def _refit(self) -> None:
        """(Re)fit the embedder on the whole corpus and refresh vectors.
        TF-IDF is corpus-fitted, so ingestion refits; neural embedders
        no-op the fit and just embed."""
        rows = self.db.execute("SELECT id, text FROM chunks ORDER BY id").fetchall()
        if not rows:
            return
        self.embedder.fit([t for _, t in rows])
        for cid, text in rows:
            vec = self.embedder.embed(text)
            self.db.execute("UPDATE chunks SET vector=? WHERE id=?",
                            (json.dumps(vec), cid))
        self.db.commit()
        self._set_meta("embedder_signature", self.embedder.signature())

    # -- query ----------------------------------------------------------
    def retrieve(self, query: str, k: int = DEFAULT_TOP_K) -> list[dict]:
        qv = self.embedder.embed(query)
        scored = []
        for source, ord_, text, vec_json in self.db.execute(
                "SELECT source, ord, text, vector FROM chunks"):
            if not vec_json:
                continue
            score = _cosine(qv, json.loads(vec_json))
            if score > 0.0:
                scored.append({"source": source, "ord": ord_,
                               "score": round(score, 4), "text": text})
        scored.sort(key=lambda r: (-r["score"], r["source"], r["ord"]))
        return scored[:k]

    def context_block(self, query: str, k: int = DEFAULT_TOP_K) -> str:
        """The seat-facing shape: retrieved evidence as one prompt block.
        Callers prepend their stable system prefix BEFORE this block so
        the prefix stays cache-hot (see TEARDOWN-caching-and-retrieval)."""
        hits = self.retrieve(query, k)
        if not hits:
            return ""
        lines = ["RETRIEVED EVIDENCE (fuel_rag — advisory; verify before relying):"]
        for h in hits:
            lines.append(f"\n[{h['source']}#{h['ord']} score={h['score']}]\n{h['text']}")
        return "\n".join(lines)

    def stats(self) -> dict:
        n_chunks = self.db.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
        n_docs = self.db.execute(
            "SELECT COUNT(DISTINCT source) FROM chunks").fetchone()[0]
        return {"db": str(self.db_path), "documents": n_docs, "chunks": n_chunks,
                "embedder": self._meta("embedder_signature") or self.embedder.signature()}


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="fuel_rag", description=__doc__.splitlines()[0])
    ap.add_argument("--db", default=os.environ.get("FUEL_RAG_DB", "fuel_rag.sqlite"))
    ap.add_argument("--embedder", default=os.environ.get("FUEL_RAG_EMBEDDER", "tfidf"))
    sub = ap.add_subparsers(dest="cmd", required=True)
    p_ing = sub.add_parser("ingest", help="ingest a directory of .md/.txt files")
    p_ing.add_argument("path")
    p_ask = sub.add_parser("ask", help="retrieve evidence for a query")
    p_ask.add_argument("query")
    p_ask.add_argument("-k", type=int, default=DEFAULT_TOP_K)
    sub.add_parser("stats", help="store statistics")
    args = ap.parse_args(argv)

    rag = FuelRAG(args.db, make_embedder(args.embedder))
    try:
        if args.cmd == "ingest":
            counts = {}
            for glob in ("*.md", "*.txt"):
                counts.update(rag.ingest_dir(args.path, glob))
            print(json.dumps({"ingested": counts, **rag.stats()}, indent=2))
        elif args.cmd == "ask":
            block = rag.context_block(args.query, args.k)
            print(block if block else "NO EVIDENCE — no chunk scored above zero.")
        elif args.cmd == "stats":
            print(json.dumps(rag.stats(), indent=2))
    finally:
        rag.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
