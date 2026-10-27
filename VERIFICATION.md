# Verification — 2026-10-26

## Deterministic checks

Eight Node tests passed: exact Unicode/CRLF quotations and physical line offsets, long-line chunk boundaries, unknown/approximate dates, explicit event-label disagreements, malformed/oversized archive rejection and JSON source preservation, untrusted shelf metadata/range rejection, invalid embedding guards, and retrieval abstention/per-memory result limits.

The complete actual model experiment is in `evidence/retrieval-evaluation.json`. Twelve authored related queries and three out-of-scope queries; actual pinned q8 ONNX CPU inference. Failures are retained, with no keyword replacement. This is a small demonstration, not a representative evaluation.

## Browser observations

- Actual local browser WASM model load succeeded with the pinned q8 model.
- “A celebration without electric lights” retrieved original passages from the fictional birthday power-cut memory, including line 1, UTF-16 characters 0–133.
- “Remembering grandma through the smell of her apron” retrieved the original undated letter as the first passage; it remained explicitly undated.
- Further browser checks and publication receipts are recorded below when actually completed.

## Limitations

No claim of real-user testing, historical accuracy, private-story security audit, representative retrieval quality or universal browser/device compatibility. App and model caches are separate; offline operation is conditional on cache retention.
