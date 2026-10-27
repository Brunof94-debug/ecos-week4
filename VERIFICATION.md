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
- Actual Portuguese browser query “Quem consertava roupas em vez de comprar outras?” retrieved the coat memory, including original physical line 2, character range 164–300.
- Actual screenshot evidence is in `evidence/ecos-home.png`, `evidence/ecos-search.png` and `evidence/ecos-source.png`.

## Publication

Public source: https://github.com/Brunof94-debug/ecos-week4 . GitHub Pages: https://brunof94-debug.github.io/ecos-week4/ . The user completed the existing-account sign-in renewal; code upload succeeded. GitHub Actions run `40435199877` completed successfully for application commit `7a585b9d9555a6b0bd54f44a6b375146c0bc7f65`. Public demo returned HTTP 200. The pinned model also loaded on the public Pages URL and “A celebration without electric lights” retrieved the original birthday passage, line 1, character range 0–133.

A complete draft was prepared under DEV account `brunof94_debug` (temporary draft identifier `7718487`), with the challenge tags and an accurate Fully Autonomous disclosure. All three article screenshots loaded successfully. After the user explicitly authorized publication and acceptance of the Week 4 specific/general rules, the article was published at https://dev.to/brunof94_debug/ecos-a-memory-can-be-incomplete-and-still-be-worth-keeping-4cdg . Its public article identifier is `4924998`; the public API confirms `published_at: 2026-10-27T02:41:19Z` (October 26, 23:41:19 Brasília). It also appeared in the official `hf26challenge` latest feed. The published page was reloaded successfully without the unpublished banner. This confirms publication of the entry, not a judging decision or guaranteed eligibility/prize. Account screenshots are kept in ignored `.runtime/evidence/`, not the public repo.

## Limitations

No claim of real-user testing, historical accuracy, private-story security audit, representative retrieval quality or universal browser/device compatibility. App and model caches are separate; offline operation is conditional on cache retention.
