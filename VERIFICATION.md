# Verification — 2026-10-26

## Deterministic checks

Eight Node tests passed: exact Unicode/CRLF quotations and physical line offsets, long-line chunk boundaries, unknown/approximate dates, explicit event-label disagreements, malformed/oversized archive rejection and JSON source preservation, untrusted shelf metadata/range rejection, invalid embedding guards, and retrieval abstention/per-memory result limits.

The complete actual model experiment is in `evidence/retrieval-evaluation.json`. Twelve authored related queries and three out-of-scope queries; actual pinned q8 ONNX CPU inference. Failures are retained, with no keyword replacement. This is a small demonstration, not a representative evaluation.

## Browser observations

- Actual local browser WASM model load succeeded with the pinned q8 model.
- “A celebration without electric lights” retrieved original passages from the fictional birthday power-cut memory, including line 1, UTF-16 characters 0–133.
- “Remembering grandma through the smell of her apron” retrieved the original undated letter as the first passage; it remained explicitly undated.
- Original-passage dialog showed exact source range 0–133 on physical line 1. Pinning preserved that passage and its narrator on the shelf.
- The keepsake/archive download controls were exercised. Their generated files were not available in the executor's Downloads directory, so no on-disk browser-download integrity claim is made.
- Explicit local saving and a page reload restored all eight fictional stories and the pinned passage.
- Portuguese interface and a 390px-wide embedded viewport were visually checked at the hero and search/collection controls. This is a layout check, not a real-device compatibility test.
- Actual screenshot evidence is in `evidence/ecos-home.png`, `evidence/ecos-search.png` and `evidence/ecos-source.png`.

## Publication

Public repository was created at https://github.com/Brunof94-debug/ecos-week4 . Pages is configured for GitHub Actions. Code upload is awaiting renewal of the user's existing GitHub sign-in; the demo URL is not yet verified live.

A complete unpublished draft was saved under DEV account `brunof94_debug`, article ID `7718487`, with the challenge tags and an accurate Fully Autonomous disclosure. The contest entry has **not** been published or submitted. Action-time acceptance of the new Week 4 contest rules is still required immediately before publication.

## Limitations

No claim of real-user testing, historical accuracy, private-story security audit, representative retrieval quality or universal browser/device compatibility. App and model caches are separate; offline operation is conditional on cache retention.
