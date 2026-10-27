---
title: "Ecos: A Memory Can Be Incomplete and Still Be Worth Keeping"
published: false
tags: devchallenge, hf26challenge, opensource, webdev
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 4: Ghost in the Machine](https://dev.to/challenges/hacktoberfest-week4-2026-10-26).*

## What I Built

A family archive has a difficult failure mode: it can become more certain than the people it is supposed to remember.

Someone says a trip happened in 1987. Someone else remembers 1989. A tidy generated biography could quietly choose one. The result would read beautifully, and part of the family’s voice would be gone.

I built **Ecos**, a small, browser-based archive for written memories. It finds passages by meaning, keeps them attached to the original words, and gives uncertain dates somewhere to stay.

For **Ghost in the Machine**, I chose the remembrance side of the theme. The “ghost” is a voice still present in a phrase, a recipe or a contradictory account. Ecos retrieves that voice. It does not impersonate the person or write a more polished life for them.

The public collection is **entirely fictional**: eight short Duarte-family memories, including a repaired coat, a birthday power cut, a recipe measured by touch and an undated letter. These are not my family records or interviews with real people.

![The Ecos archive, with a warm paper palette and an original still-life illustration](https://raw.githubusercontent.com/Brunof94-debug/ecos-week4/7a585b9d9555a6b0bd54f44a6b375146c0bc7f65/evidence/ecos-home.png)

## Demo

**[Open Ecos](https://brunof94-debug.github.io/ecos-week4/)** · English / Português

You can read the fictional collection immediately. To try the open model:

1. Choose **Enable private search**. First use downloads about **135 MB** of model files. Story text stays in your browser.
2. Try **a celebration by candlelight**. The query asks for “A celebration without electric lights”; the returned source begins with an electricity failure during a birthday supper.
3. Open **Read original**. The highlighted words are an exact slice of the source, with the original line and character range.
4. Choose **Keep this passage**, then open the **Remembrance shelf** and download a plain-text keepsake.
5. Compare the two **first river crossing** accounts. Clara says 1987; Rui says 1989. Both remain visible. The letter with no date stays undated.

![A real local-model retrieval result, linked to the original birthday memory](https://raw.githubusercontent.com/Brunof94-debug/ecos-week4/7a585b9d9555a6b0bd54f44a6b375146c0bc7f65/evidence/ecos-search.png)

You can also add your own written memory, download a portable JSON archive, reopen it later, or explicitly save an unencrypted copy in this browser. The interface never silently saves your stories to an account.

## Code

**[GitHub repository](https://github.com/Brunof94-debug/ecos-week4)** · MIT application code and original illustration

The repository includes the locked dependencies, fictional collection, source-integrity tests, actual retrieval experiment and a build/deployment workflow. The project and repository were started on October 26, inside the Week 4 window.

## How I Built It

The important separation is between **finding a passage** and **deciding what it proves**.

For finding, I used [Transformers.js](https://github.com/huggingface/transformers.js) 3.8.1 and the open [multilingual MiniLM model](https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2), pinned to revision `2c4055b12046f11709e9df2c122e59ffbdc2f900`. Its q8 ONNX weights run in a browser worker through ONNX Runtime WASM, using one CPU thread.

Each story is split into short passages while retaining offsets into its unmodified source. Mean-pooled, normalized embeddings compare the query with the **story body only**. Titles, dates and expected test labels are excluded from inference. Results below a cosine similarity of 0.30 are omitted; this cutoff is a heuristic, not a confidence score. Results are explicitly called **possible echoes**.

The model is essential to this search. If it cannot load, you can still read and export, but the app does not quietly substitute keyword matches and call them model results.

For preservation, ordinary code does the work. It keeps original text, computes citation ranges, sorts contributor-supplied dates and identifies differing years only when contributors supplied the same event label. It cannot decide whether Clara or Rui is right. That limitation is intentional.

### I measured the misses, too

I ran the pinned q8 model against **12 authored English/Portuguese queries** over the eight fictional stories, alongside a simple stopword-filtered exact-token overlap baseline.

| Method | Expected memory at rank 1 | Expected memory in top 3 distinct memories |
|---|---:|---:|
| Actual open-model embeddings | 10/12 | 10/12 |
| Exact-token overlap baseline | 1/12 | 2/12 |

The [complete results include the failures](https://github.com/Brunof94-debug/ecos-week4/blob/main/evidence/retrieval-evaluation.json).

Two related queries returned no close result. One was a broad request about keeping an object to remember someone who died. A more specific description of the grandmother’s apron worked in the browser, so I made the sample prompt more specific. The original evaluation still includes the miss.

I also tried three unrelated queries. Two returned nothing; a fictional question about a chess tournament on Mars incorrectly retrieved the coat memory. That is a useful warning about treating similarity as truth.

This is a tiny authored experiment, **not a held-out benchmark or a general accuracy claim**. The CPU experiment and actual browser WASM checks are recorded separately. Eight deterministic tests cover source fidelity, uncertain dates, archive validation, untrusted citation metadata and retrieval guards; those tests do not measure model quality.

## Why Does Open Innovation Matter?

Here, the practical benefit is control over a very personal input.

The open model lets the browser compare meanings without sending family stories to an inference service. I can pin the weights, inspect the retrieval behavior and ship the same search without a private model key or per-query bill. That choice also makes its limitations reproducible.

It does **not** make the app magically private. The host receives normal app requests. Hugging Face and its download CDN receive normal request metadata when the model is fetched. A locally saved archive is unencrypted, and downloaded archives contain the stories, names, supplied dates, selected passages and a bounded recent-search receipt. Shared devices and shared downloads still require care.

Offline operation is conditional: the user must cache the app, finish the model download and keep both browser caches. Browser storage can be evicted. A downloaded JSON archive is the portable backup; a text keepsake remains readable even if Ecos disappears.

## The Spirit of It

The decisive example is the disagreement about the boat trip. Ecos could have produced one confident sentence. Instead, it shows two accounts with two names and two years.

![Original source text, including the narrator’s uncertainty](https://raw.githubusercontent.com/Brunof94-debug/ecos-week4/7a585b9d9555a6b0bd54f44a6b375146c0bc7f65/evidence/ecos-source.png)

That leaves the archive a little less neat. It also leaves more of the people in it.

The current scope is deliberately small: written text, up to 40 memories, English and Portuguese search. There is no audio transcription, photo recognition, cloud sync, generated biography or claim of historical verification. I have not tested it with real families or measured a benefit to them.

For this theme, the most useful thing I could build was a place where an incomplete memory does not need to become a complete fiction.

## Prize Categories

**Best Use of GitHub Copilot — GitHub Actions automation.** The challenge page explicitly includes automating a project with GitHub Actions in this category. Ecos uses Actions to install the locked dependencies, run the source-integrity tests, build the app and deploy GitHub Pages. This is the automation being submitted; I do not claim Copilot generated the code.

Built solo by Bruno Fernandes, an Accounting graduate with intermediate programming experience. Codex assisted implementation, documentation and testing. Open components and licenses are credited in the [third-party notices](https://github.com/Brunof94-debug/ecos-week4/blob/main/THIRD_PARTY_NOTICES.md).
