# Ecos · The stories we carry

A new project for **DEV Hacktoberfest 2026 Week 4 — Ghost in the Machine**, started October 26, 2026 after the entry window opened. Written-memory preservation inspired by the season of remembrance: retrieve original voices without generating a replacement biography.

**Demo:** https://brunof94-debug.github.io/ecos-week4/

**Published Week 4 entry:** https://dev.to/brunof94_debug/ecos-a-memory-can-be-incomplete-and-still-be-worth-keeping-4cdg . Published October 26, 2026 in Brasília time, after the user's authorization of the Week 4 rules. The public article API and the official `hf26challenge` latest feed were checked. Publication is not a judging result or a guarantee of eligibility/prize.

## Try the fictional collection

1. Browse eight fictional Duarte-family memories. No account or model download is needed to read them.
2. Enable private search. First use downloads about 135 MB of public model data, separately from the app runtime.
3. Try **a celebration by candlelight**. Open a returned passage to see its exact source text and original line/character offsets.
4. Keep a passage on the remembrance shelf; download a plain-text keepsake.
5. Compare Clara and Rui's first river crossing: one says 1987, the other 1989. Neither account is silently overwritten. An undated letter remains undated.

English and Portuguese interface and semantic queries. Original stories stay in their original language; they are not translated or rewritten. All public demonstration stories, people, artwork and events are authored fiction, not Bruno's family records.

## Where the open AI is essential

Transformers.js **3.8.1** runs **Xenova/paraphrase-multilingual-MiniLM-L12-v2**, pinned revision **2c4055b12046f11709e9df2c122e59ffbdc2f900**, q8, with ONNX Runtime WASM in a browser worker, using one CPU thread. Mean-pooled normalized 384-dimensional embeddings compare a query against body-only passages of up to 480 UTF-16 characters. Titles, dates, event labels and expected evaluation labels do not enter model input. Cosine similarity below 0.30 is omitted; this is a heuristic, not calibrated confidence. At most two passages from one memory appear among four results.

Without the model, browsing, adding, citations, timeline, shelf and export still work, but semantic search is unavailable. There is **no simulated inference, hidden keyword replacement, inference API, generative answer or deceased-person impersonation**.

Ordinary code handles dates, explicit shared-event disagreements, source offsets, storage and downloads. It does not infer a date from prose or decide which narrator is correct. Source text is rendered as inert escaped text. Imported shelf line numbers are recomputed from the original offsets.

## A small actual experiment

See [the complete result](evidence/retrieval-evaluation.json), including failures. On twelve authored English/Portuguese queries against eight fictional stories (24 passages):

| Method | Expected memory at rank 1 | Expected memory in top 3 distinct memories |
|---|---:|---:|
| Pinned q8 embeddings, actual ONNX CPU run | 10/12 | 10/12 |
| Stopword-filtered exact-token overlap | 1/12 | 2/12 |

Of three additional unrelated queries, two returned no result; one incorrectly retrieved a coat memory for a fictional Mars chess question. Two relevant queries returned no close result, including a broad remembrance query. This small, authored exercise is not a held-out benchmark, model accuracy estimate or evidence of benefit to real families. After seeing the broad remembrance miss, the third sample UI prompt was made more specific; the original twelve-query results remain unchanged and include that miss.

Node CPU evaluation and browser WASM verification are separate. See [VERIFICATION.md](VERIFICATION.md) for browser observations. Similarity can fail; a candidate passage never becomes a verified historical answer.

## Privacy and storage

- Story text, queries and vectors are processed in the browser. No account, analytics, content-upload endpoint or inference service is used.
- Normal app requests go to GitHub Pages. Enabling search requests public weights/configuration from Hugging Face and its CDN. These services receive normal request metadata such as IP address and user agent.
- By default stories live in the tab. **Save on this device** explicitly writes an unencrypted archive to this browser's localStorage. Someone with access to the same browser profile can read it.
- Downloaded JSON contains the stories, names, supplied dates, SHA-256 source-text digests, shelf selections and a bounded receipt of recent search queries/results. It is private data if you enter private stories. Text keepsakes contain selected passages and their source information. Share deliberately.
- Opening another archive replaces the tab collection after confirmation; it does not overwrite a previously saved local copy until you save. **Clear collection** removes the tab collection and Ecos's saved archive in this browser, not downloaded backups or the model cache. This is not a secure erasure guarantee.
- Export digests detect accidental text changes during reimport, not malicious tampering or historical authenticity.
- App offline caching is opt-in. Model downloads use a separate browser cache. Both must be retained for offline search. Browser eviction/private browsing can remove them; downloaded archives remain the portable backup.

## Scope

Up to 40 written memories, 8,000 characters per story, 80 shelf passages and 1.5 MB per imported JSON archive. Local JSON import/export; no audio recording, transcription, photo recognition, PDF/Office extraction, cloud sync, encryption, genealogy verification, generated biographies or automatic relationship inference. Device/browser resources can prevent loading; the original stories remain usable without search.

## Develop and reproduce

Node 22+:

```sh
npm ci
npm test
npm run build
npm start
```

Preview: **http://127.0.0.1:4344/**. To reproduce the actual model experiment:

```sh
npm run evaluate
```

The experiment downloads the same pinned model into ignored `.runtime/model-cache`. It writes the complete small synthetic result to `evidence/retrieval-evaluation.json`. No user records are used. The app uses a locally served Transformers browser bundle and WASM, not a runtime JavaScript CDN.

GitHub Actions installs the locked dependencies, runs meaningful source-integrity/retrieval-guard tests, builds a static bundle with SHA-256 asset manifest and publishes it to GitHub Pages. It does not run the model benchmark in CI or claim that deterministic tests measure model quality.

MIT application code and original illustration, Bruno Fernandes. [Third-party notices](THIRD_PARTY_NOTICES.md). Codex assisted implementation, documentation and testing. No Copilot code-generation claim is made. No customer interviews, real-family testing, production reliability or measured time savings are claimed.
