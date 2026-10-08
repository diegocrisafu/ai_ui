---
target: SceneBreaker typography finish
total_score: 33
max_score: 40
na_heuristics: ""
p0_count: 0
p1_count: 0
target_identity: "file:/Users/diegocrisafulli/Documents/ai_ui/src/components/lab/RouteLab.tsx"
target_fingerprint: "sha256:51d2a77b01a474155d140e02a81db38ae3b9a8ee50c8a9f05d81244277775b67"
target_path: /Users/diegocrisafulli/Documents/ai_ui/src/components/lab/RouteLab.tsx
timestamp: 2026-10-08T05-05-24Z
slug: src-components-lab-routelab-tsx
---
Method: dual-agent (A: 01a119dc-ebc1-7b53-af55-a3b0f10507ee · B: 01a119dc-ec02-7250-9d7d-24e4dac82abb)

# SceneBreaker typography finish critique

Target: src/components/lab/RouteLab.tsx. Reviewed 2026-10-08 before the corrective batch. Separate raw A/B reports in ../review preserve detailed evidence and limits.

## Design specificity and overall impression

The design now feels specific to SceneBreaker: the working scene, editable route and failed-versus-successful replay give it an identity beyond the headline. The bold monochrome typography fits that direction. Both reviewers recommend preserving the flow. Assessment A's typography judgment is 8.5/10, separate from its Nielsen score; neither is a claim of perfection.

## Design health

| Heuristic | Score / 4 | Finding |
|---|---:|---|
| System status | 3 | Results update clearly; some confirmations sit below the editor. |
| Real-world language | 4 | Objects, dimensions and outcomes match the visible experiment. |
| User control | 3 | Editing, undo and replay work; imported-asset recovery wasn't retested. |
| Consistency | 4 | Typography, controls and keyboard tabs are coherent. |
| Error prevention | 3 | Invalid values preserve the last valid scene. |
| Recognition | 3 | Labels help; the results grid requires deliberate scanning. |
| Efficiency | 3 | Keyboard editing works; the grid has many focus stops. |
| Visual hierarchy | 4 | The experiment leads, with no competing decoration. |
| Error recovery | 3 | A validation warning incorrectly survives changing objects. |
| Help | 3 | Useful contextual instructions and honest model limits. |
| **Total** | **33/40** | **Good. No P0 or P1 found in the bounded review.** |

## What's working

1. The headline leads naturally into a usable editor.
2. Changes produce reversible, measured effects.
3. Comparisons explain exactly which tested settings changed the outcome.

## Priority issues

- **P2: reset field errors when switching objects or route points.** A Width error entered on Crossing cart follows the user to North shelving, falsely flagging valid width 3. This also leaves aria-invalid in the wrong context. Key the geometry group by selection identity, including equal-value objects and motion endpoints; preserve same-object invalid feedback. Suggested command: /impeccable harden, then bounded /impeccable polish confirmation.
- **P3: match the time-limit symbol to its legend.** The caption says clock but the timeout branch renders RotateCcw. Use the existing icon library's Clock. Suggested command: /impeccable polish. Source-confirmed; timeout wasn't reached in the browser sequence.

## Cognitive load and emotional journey

Seven of eight cognitive-load checks pass. The optional 45-result grid exceeds the literal four-choice guideline, but is useful experimental data with a suggested contrast. Keep the grid. The strongest moment is the successful alternative beside the failed baseline; the stale warning creates the only observed trust-breaking valley. Ending with explicit model limits and source is credible.

## Persona red flags

- Jordan, first-time user: a stale warning makes a valid sample object appear broken.
- Sam, keyboard-dependent user: the same warning incorrectly preserves aria-invalid; many result cells are an efficiency limit. Skip link, tabs, object movement and undo worked.
- Alex, technical evaluator: the easy-to-reproduce field-state bug undermines input-to-result trust despite working editing, tests and comparisons.

## Detector and browser evidence

The single Assessment B scan returned 38 flags: 37 in generated out/ and one test regex; none in the targeted authored lab/layout sources. Breakdown: font 12, colour 13, size 7, radius 1, padding 3, leading 2. Most are generated font aliases, documented derived colours, parser artifacts or framework code. Canvas padding is intentional. Mobile-context padding and two unidentified static leading flags were not confirmed live. Browser samples confirmed h1/h2 weight 700, normal style, graphite and 1.5 leading; measurements use locally registered Azeret Mono. No console entries were returned during the tested sequence. No injected overlay was available; inspection used native screenshots and read-only DOM evidence.

## Minor observations and limits

Tablet headline spacing is deliberately generous under the user's 150% rule, not an invitation to override it. Parent inspected desktop 1440, tablet 768 and phone 390 captures; 375px DOM showed no overflow. Actual screen-reader speech, exhaustive imports/downloads, every mobile editor interaction and 200% zoom are not certified. Equal-count route edits are summarized by point count rather than coordinates (source observation, not a confirmed live issue in this review). Validation speech may repeat the inline message; actual speech wasn't tested.

Questions skipped: 2 Priority Issues; the user already specified the direction and delegated refinement. Keep the approved flow and correct the concrete defects, without manufacturing a perfect score.

## Subsequent corrective batch (not rescored)

The selected-object/endpoint Fragment and selected-route-point field group are now keyed by selection identity. Independent browser confirmation passed the cart→shelf, equal-width shelf→shelf, same-object correction, route-point and motion-endpoint cases. The timeout glyph now uses Clock (source-confirmed). See [narrow fix confirmation](../review/typography-fix-confirmation-20261008.md).

`npm run check` (lint, types and 64 tests), static production build, dependency audit (zero vulnerabilities), and `git diff --check` passed after the correction. The reviewed-source fingerprint and 33/40 score above remain historical, not a claimed post-fix rescore. Corrected RouteLab SHA-256: c065d1c3c40494a17ff23a8649e140d7ad3daa2148a2b14091f3039df1f917be.
