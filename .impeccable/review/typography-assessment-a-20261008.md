Method: independent Assessment A sub-agent; fresh source review and fresh CUA tab. Assessment B and parent synthesis are outside this report.

# Typography finish review — Assessment A

Date: 2026-10-08. Target: `src/app/page.tsx` → `src/components/lab/RouteLab.tsx`, served at `http://127.0.0.1:3100/`.

## Verdict and recommendation

The current presentation is authored for SceneBreaker. The editable spatial experiment, intended/actual route distinction, speed-and-delay results, and measured comparison give the page its identity. The oversized monochrome heading now introduces that work with enough confidence for a CV showcase. The opening, demonstration, workbench, results, and methodology remain a coherent sequence. Preserve this flow.

**Nielsen assessment: 33/40 — Good. Typography judgment: 8.5/10 — approve the current direction.** These are separate judgments, not a conversion between scales. No P0 or P1 problem was found in this bounded review. There is one reproducible P2 validation-state defect worth fixing before the final handoff. There is no evidence-based reason here for another visual redesign or a larger headline.

## Provenance and limits

- Read the complete Impeccable `SKILL.md` and `reference/critique.md`, project `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, and relevant current source. Did not read previous critiques, scores, or detector reports. Did not run a detector or inject/mutate page code through evaluate.
- The skill context launcher was attempted once and returned permission denied. Existing product/design context was read directly, as the skill instructs. This did not prevent Assessment A.
- Inspected all three requested parent screenshot files with `view_image`: `type-desktop-20261008.png` (1440×900), `type-mobile-20261008.png` (390×844), and `type-tablet-20261008.png` (768×1024), all in this report's directory.
- Created and used only my own fresh CUA tab at the supplied localhost URL. Live screenshots were 1280×720. Did not change the shared viewport. Closed my tab after inspection; started no server.
- The parent reports no horizontal overflow at 375px. That is supplied evidence, not an independently repeated test. Mobile/tablet conclusions here concern the supplied opening screenshots plus current responsive source, not a complete mobile interaction certification.
- This was a pragmatic finish review: representative editor actions, errors, keyboard behavior, replay, and comparison. File imports/exports, exhaustive engine correctness, browser failure injection, actual screen-reader speech, and 200% zoom were not tested. No source files were edited.

## Separate typography judgment

**8.5/10. Keep Familjen Grotesk 700, monochrome headings, and the current sizes.**

`layout.tsx` registers Familjen Grotesk and Azeret Mono locally. `globals.css:130` explicitly gives h1/h2 the body sans family, weight 700, normal style, graphite color, −0.035em tracking, balanced wrapping, and the shared 1.5 leading. The registered fonts and current heading JSX do not restore the rejected serif or blue italic word emphasis. Blue remains useful for actions, focus, and simulation geometry.

The CSS ramp is made of exact 1.25 steps. The opening uses approximately 119.21px at 1440+, 95.37px at 1200–1439, 76.29px on tablet, and 48.83px on phone. The live 1280px browser agrees visually with the smaller desktop treatment. The desktop screenshot's 119px title has ample presence without displacing the scene or crowding the supporting column. The phone screenshot keeps the full title on one line at its supplied 390px width, with readable supporting copy and a clear primary action.

The tablet's “Break / the route.” wrap creates a noticeably generous interline gap. The workbench's two-line heading has the same spacious rhythm. This is the expected consequence of the user's explicit 150% leading requirement; it is a tradeoff, not a defect to secretly tighten. It keeps the page airy, although it is less compact than an aggressively typeset display treatment. Together with the large jump from headline to small scene captions, that keeps my judgment below a perfect score. Neither warrants a fix under the present brief.

Body text, labels, controls, and monospaced measurements remain legible and differentiated in the actual editor. The first impression is bold; the workbench remains calm enough to operate. Making all subordinate headings heavier or enlarging everything would weaken that distinction.

## Fresh Nielsen table

Both Persuade (opening) and Operate (editor) are in scope, so all ten heuristics apply. Scores use the skill's 0–4 scale.

| # | Heuristic | Score | Specific evidence and limits |
| --- | --- | ---: | --- |
| 1 | Visibility of system status | 3 | Object movement immediately changed the measured duration from 4.13 to 4.16 s; undo restored it. Play became Pause and time/current speed advanced. Stress-test completion reported 23/45 cases. Some general confirmations sit below the entire editor, so they can be outside the working viewport. |
| 2 | Match between system and real world | 4 | “Add object,” “Add waypoint,” dimensions in metres, named objects, “Goal reached,” and “Contact with Crossing cart” match the visible model. The nearest alternative gives concrete speed and delay changes rather than an unexplained score. |
| 3 | User control and freedom | 3 | Keyboard undo restored the moved cart; adding a waypoint was undoable; replay has pause/restart, and comparison exposes Clear, Restore, and Return to my settings. Source supplies a dirty-tab leave warning. Recovery of imported visual assets was outside the live test, so this is not a blanket perfect score. |
| 4 | Consistency and standards | 4 | The same typography, outlined controls, blue actions, and fine separators continue from opening to editor. Scene/Robot/Route uses standard arrow-key and Home behavior with visible focus. 2D/3D and selected objects expose their state in the accessibility tree. |
| 5 | Error prevention | 3 | Entering room width 2 was rejected with a 4–30 bound and preserved the 12×8 scene. Initial Undo/Redo was disabled appropriately. Undoable scene changes and the source's unload warning reduce accidental loss; no persistent draft recovery was claimed or tested. |
| 6 | Recognition rather than recall | 3 | Labels, units, named handles, route instructions, planned/actual legend, and “What changed” make the flow understandable in place. Dense object controls and the optional 45-cell result grid still require deliberate scanning. |
| 7 | Flexibility and efficiency | 3 | The fresh tab supported skip navigation, keyboard inspector tabs, arrow-key object movement, and ⌘Z. Numeric controls provide an alternative to dragging; the grid provides a direct alternative replay. The grid exposes many individual keyboard stops, so this is useful rather than maximally efficient. |
| 8 | Aesthetic and minimalist design | 4 | The working scene is the centerpiece. Bold monochrome headings, a restrained palette, flat ruled groups, and the limited set of visible inspector tabs provide a clear hierarchy. No unrelated decoration or marketing claims compete with the experiment. |
| 9 | Error recognition and recovery | 3 | Invalid room width has a specific inline message, retains the committed scene, and clears on valid correction. However, the object-width validation message survives changing the selected object, falsely marking another object's valid value; see P2 below. |
| 10 | Help and documentation | 3 | Context explains dragging/arrows, drive models, motion endpoints, grid interpretation, and finite-test limits. The methodology disclosures and source link are task-relevant. This is good contextual guidance; comprehensive searchable help is not present or necessary for this finish pass. |
| | **Total** | **33/40** | **Good. 0 P0, 0 P1, 1 P2.** |

## What worked in the fresh browser

1. **The visual promise leads into a usable editor.** Tab → the skip link → Enter → Tab reached the experiment-name field. The live editor preserves the opening's visual language without a jarring switch to a generic dashboard.
2. **Input changes have visible, reversible effects.** Right Arrow on the Crossing cart handle moved X from 6.0 to 6.1 m and duration from 4.13 to 4.16 s. ⌘Z restored both. Add waypoint selected the new route point, switched to Route, and exposed coordinates and instructions; Undo returned to two route points.
3. **The results explain a useful causal contrast.** The restored example produced 23 failures in 45 sampled cases. Compare these conditions pinned the 1.20 m/s contact run (4.13 s) and selected the 0.90 m/s successful run (11.56 s; 0.39 m sampled gap). “What changed” explicitly identified maximum speed 1.2 → 0.9 m/s. The comparison and finite-grid limitations were readable. The 3D view rendered, Play advanced time/speed, and Pause stopped it.

## Priority issue

### P2 — A numeric error follows the user onto a different object

**Observed reproduction:** Select Crossing cart, set its Width to `0`, and Tab away. The field correctly says “Enter 0.1–12. Your previous value is unchanged.” Select North shelving on the plan. Its Width now displays the valid value `3`, but the previous error remains beneath it. Focusing and then blurring that valid field clears the error without any geometry change.

**Impact:** The inspector appears to report a problem with a valid, untouched object. A first-time user can waste time “fixing” it; the source also leaves `aria-invalid` and the error association active for the wrong context. This undermines confidence precisely where the product asks users to trust input-to-result causality. It did not corrupt the scene or block the tested flow.

**Source evidence:** `src/components/lab/Fields.tsx:22` stores error state at the `Numeric` component level. The `key={value}` at line 34 remounts only the input, not its enclosing error state. The selected-object numeric controls at `src/components/lab/RouteLab.tsx:1121` are reused across selection changes; Width is at line 1164.

**Concrete fix:** Reset draft/error state at an explicit selected-object/endpoint boundary, or key the selected geometry field group by that identity. Preserve ordinary same-object invalid-input feedback. Ensure the reset also occurs when two selected objects happen to share the same numeric value; keying solely by value is insufficient. Confirm this exact cart → shelf reproduction and same-object correction once. Suggested command: `/impeccable harden`, followed by a bounded `/impeccable polish` confirmation.

Only this one issue merits the priority list in the current scope. Extra issues have not been invented to meet a quota.

## Cognitive-load checklist

| Check | Result | Evidence |
| --- | --- | --- |
| Single focus | Pass | Opening offers a clear build action and a small demonstration; the editor keeps geometry central. |
| Chunking | Pass, with dense data exception | Scene/Robot/Route separates kinds of input. Coordinates/dimensions and motion are grouped; the result matrix is intentionally structured data. |
| Grouping | Pass | Proximity, rules, and inspector placement associate fields with scene operations and compare related results. |
| Visual hierarchy | Pass | Heading → scene → primary actions → labels/measurements is clear in supplied captures and live views. |
| One thing at a time | Pass | File tools and methodology are disclosed on demand; the grid appears only after a test. |
| Minimal choices | Fail against the literal ≤4 rule | There are 45 replay cells and nine delay columns after a test. Object geometry also includes selector/name, four numeric fields, and the motion toggle. These exceed the threshold, though grouping and a single suggested contrast reduce the burden. |
| Working memory | Pass | Named selection, current settings, pinned/current outputs, and the input-change list retain decision context. |
| Progressive disclosure | Pass | Three inspector tabs, Scene files, and methodology disclosures keep secondary tasks out of the initial view. |

**One failed item: low overall extraneous cognitive load by the skill's checklist, with concentrated analytical density after testing.** The grid is the experiment's useful output; do not replace it or force it into artificial four-option menus. The toolbar also contains more than four total controls, but separates view selection, geometry creation, and file/history operations into meaningful groups. Those are separate decisions rather than one flat menu.

## Three persona walkthroughs

- **Jordan, first-time visitor:** The bold title, literal supporting sentence, and working scene communicate the task. The build link reaches editable examples; add-waypoint behavior and input-change comparison teach through action. Specific red flag: the stale Width warning on North shelving contradicts its valid value and could suggest the sample scene is broken.
- **Sam, keyboard-dependent visitor:** The skip link, visible focus, arrow/Home inspector navigation, named handles, arrow movement, and ⌘Z worked in the fresh tab. Accessible result names include speed, delay, and outcome. Specific red flag: the stale error is also an accessibility-state error. The many grid cells are an efficiency limit; actual screen-reader announcements and complete keyboard traversal were not certified.
- **Alex, technical evaluator/power user:** Reached editing without onboarding, changed geometry, undid it, generated the grid, and opened a measured opposite outcome. “What changed” and honest model limits support implementation credibility. Specific red flag: the field-state bug is easy to demonstrate while switching objects. No evidence here justifies adding bulk editing, automation features, or another navigation layer for this showcase.

## Emotional journey and minor observations

The opening creates confidence; the live geometry makes the promise tangible. The strongest moment is the successful alternative beside the failed baseline with the exact changed speed. That is a better portfolio payoff than the headline alone. The small emotional valley is dense numerical setup, made manageable by the visible plan and labeled controls. The stale warning is the only observed point where this reassurance breaks. The end explains model limits and exposes the source, which closes the demonstration credibly.

The tablet headline's roomy leading and the long inspector are visible tradeoffs, not invitations to alter the approved flow. Mobile's opening retains a clear action and readable text in the supplied screenshot. Mobile comparison density and touch interaction were not newly exercised, so they are not promoted into new defects from source alone. The existing source's local-memory/save model is explicit; this review does not request a storage subsystem.

## Parent handoff

Assessment A is complete. Keep the current typography and sequence. Fix the one selected-object numeric error-state defect, reproduce it once to confirm the correction, then finish the handoff. The strongest concrete fix is in `Fields.tsx`/the selected geometry field boundary, not in the heading CSS. No source changes were made, no detector output was consulted, and my fresh browser tab is closed.

Questions skipped: 1 Priority Issue, below the skill's three-issue threshold; the user's typography and preserve-flow constraints already determine the direction.
