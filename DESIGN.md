---
name: SceneBreaker
description: Cool porcelain, graphite and ultramarine for an editable route laboratory.
colors:
  accent: "#2547d0"
  paper: "#f5f6f8"
  ink: "#17191f"
  muted: "color-mix(in srgb, var(--ink) 76%, var(--paper))"
  line: "color-mix(in srgb, var(--ink) 18%, var(--paper))"
  control: "color-mix(in srgb, var(--ink) 60%, var(--paper))"
  soft: "color-mix(in srgb, var(--ink) 4.5%, var(--paper))"
typography:
  type-small:
    fontSize: "0.8rem"
    lineHeight: 1.5
  type-base:
    fontSize: "1rem"
    lineHeight: 1.5
  type-1:
    fontSize: "1.25rem"
    lineHeight: 1.5
  type-2:
    fontSize: "1.5625rem"
    lineHeight: 1.5
  type-3:
    fontSize: "1.953125rem"
    lineHeight: 1.5
  type-4:
    fontSize: "2.44140625rem"
    lineHeight: 1.5
  type-5:
    fontSize: "3.0517578125rem"
    lineHeight: 1.5
  type-6:
    fontSize: "3.814697265625rem"
    lineHeight: 1.5
  type-7:
    fontSize: "4.76837158203125rem"
    lineHeight: 1.5
  type-8:
    fontSize: "5.9604644775390625rem"
    lineHeight: 1.5
  display:
    fontFamily: "Instrument Serif, serif"
    fontSize: "5.9604644775390625rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Instrument Serif, serif"
    fontSize: "3.814697265625rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Familjen Grotesk, sans-serif"
    fontSize: "1.5625rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Familjen Grotesk, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Familjen Grotesk, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: "Familjen Grotesk, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.5
  measurement:
    fontFamily: "Azeret Mono, monospace"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  square: "0"
  field: "3px"
  button: "5px"
  segmented: "6px"
  handle: "50%"
spacing:
  space-4: "4px"
  space-6: "6px"
  space-8: "8px"
  space-12: "12px"
  space-16: "16px"
  space-20: "20px"
  space-24: "24px"
  space-28: "28px"
  space-36: "36px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "9px 14px"
  button-primary-hover:
    backgroundColor: "color-mix(in srgb, var(--accent) 88%, var(--ink))"
  button-default:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "9px 14px"
  button-default-hover:
    backgroundColor: "{colors.soft}"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "9px 14px"
  button-dark-hover:
    backgroundColor: "{colors.accent}"
  button-text:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "8px 0"
  button-text-hover:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
  button-icon:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "8px"
    width: "44px"
  numeric-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "7px 10px"
    width: "100%"
  navigation:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  segmented:
    backgroundColor: "{colors.soft}"
    rounded: "{rounded.segmented}"
    padding: "3px"
  segmented-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "9px 14px"
  heat-cell:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "6px"
    width: "100%"
  heat-cell-collision:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper}"
  heat-cell-timeout:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  run-comparison:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "20px 0"
---

# Design System: SceneBreaker

## Overview

**Creative North Star: "The Live Route Study"**

SceneBreaker presents editable geometry as a precise product study on cool porcelain. Graphite supplies structure; ultramarine draws attention to actions, movement and contact. Broad surfaces and fine rules keep the experiment visible while serif display type gives the opening a distinct editorial voice.

The same world continues into practical controls: readable sans-serif labels, monospaced measurements, restrained corners and explicitly named outcomes. The visual centerpiece is working Three.js geometry and an SVG plan, with motion started by the visitor. There is no authored raster artwork in this world; imported floorplans and models are user content.

**Key Characteristics:**

- Three color anchors with derived opacity tones.
- Instrument Serif display, Familjen Grotesk interface, Azeret Mono measurements.
- Exact 1.25 type scale with 150% leading.
- Shared 12/8/4-track alignment and flat, ruled control groups.
- Live spatial context and measured input-to-outcome comparisons.

This is a source-grounded record of the current route laboratory, not a quality score or a new browser review. Evidence is [globals.css](src/app/globals.css), [layout.tsx](src/app/layout.tsx), [palette.ts](src/lib/palette.ts), and [lab components](src/components/lab/). The [surface brief](.impeccable/surface-briefs/route-lab.md) retains the opening/workbench strategy; its page composition is not a universal layout rule. Earlier [review evidence](.impeccable/review/evidence.md) records its own scope and predates the separately reviewed final corrections.

## Colors

The palette has three anchors. The four derived neutral tokens in the frontmatter preserve the actual CSS color-mix expressions; they are not additional brand colors.

### Primary

Ultramarine (`accent`) serves primary actions, italic emphasis, active tabs, moving geometry, the actual route, collision cells and focus indicators. It is not a failure-only color.

### Neutral

Cool porcelain (`paper`) is the page and field surface and the text on solid actions. Graphite (`ink`) is primary text, dark actions and selected view controls. Secondary copy uses `muted`; decorative rules use `line`; interactive boundaries use `control`; grouped surfaces use `soft`.

**The Three Anchors Rule.** Derive interface tones from paper, ink and accent; keep user-imported imagery and model materials outside the interface palette.

The scene's `PALETTE.rust` property is a retained code identifier for ultramarine, not a fourth color or an instruction to restore rust. `tone()` composites a scene anchor over paper in sRGB. Physical lighting and tone mapping alter rendered brightness; the UI's CSS tokens are not pixel samples of the lit scene. The imported model is cloned with its materials, so its colors are not guaranteed to match these anchors.

**The Outcome Has a Name Rule.** Pair color with outcome text, geometry, line style or an icon; never make color the sole explanation of a result.

The plan distinguishes dashed planned motion from the solid actual route. Stress cells carry check, cross or rotate-arrow icons, duration and an accessible replay label. Low-opacity rules and the plan grid are structural decoration; they are not text or control-boundary tokens. This pass does not republish the old palette's contrast ratios or certify accessibility.

## Typography

The frontmatter records the complete implemented size ramp and the main semantic roles. A role's default size is its desktop value; responsive overrides select other whole steps.

| Scale step | Size at a 16px root | Typical current use |
| --- | ---: | --- |
| type-small | 12.8px | Hints, captions, small measurements |
| type-base | 16px | Body, inputs, buttons |
| type-1 | 20px | Intro copy, inspector and comparison headings |
| type-2 | 25px | Default h3, desktop result values, experiment name |
| type-3 | 31.25px | Stopping-distance value |
| type-4 | 39.0625px | Mobile section headings, tablet methodology heading |
| type-5 | 48.828125px | Mobile opening, tablet workbench, desktop methodology |
| type-6 | 61.03515625px | Desktop workbench heading |
| type-7 | 76.2939453125px | Tablet opening |
| type-8 | 95.367431640625px | Desktop opening |

**The Whole Steps Rule.** Use the existing 1.25 scale and 1.5 line height; responsive type changes move between whole scale steps.

Display and section headings use Instrument Serif at weight 400, with tight tracking and the locally bundled italic for emphasis. Familjen Grotesk carries body copy, controls and labels, with weight 500 for buttons and h3 headings and 600 for the wordmark. Azeret Mono is reserved for measured output, definition-list values, grid headings, grid durations and stopping distance. Numeric inputs retain Familjen Grotesk with tabular figures.

The opening uses type-8 / type-7 / type-5 across desktop / tablet / phone. The workbench heading uses type-6 / type-5 / type-4. The methodology heading uses type-5 / type-4 / type-4. Inspector and comparison headings override the general title size with type-1. Measurement text inherits its context's scale step; the frontmatter measurement role describes the ordinary comparison measurement paragraph. Methodology and import-review prose are bounded at 75ch; the stress introduction uses 60ch. These are observed local limits, not a page-wide measure.

### Local font files and licenses

[layout.tsx](src/app/layout.tsx) uses `next/font/local` and `display: "swap"` for all three families. The CSS family variables are `--font-display`, `--font-body` and `--font-mono`, with serif, sans-serif and monospace fallbacks respectively; generated Next.js family names are implementation details.

| Family | Bundled files under src/app/fonts/ | Registered weights | License |
| --- | --- | --- | --- |
| Instrument Serif | InstrumentSerif-Regular.woff2; InstrumentSerif-Italic.woff2 | 400 normal and italic | [InstrumentSerif-OFL.txt](public/fonts/InstrumentSerif-OFL.txt) |
| Familjen Grotesk | FamiljenGrotesk-Variable.woff2 | 400–700 | [FamiljenGrotesk-OFL.txt](public/fonts/FamiljenGrotesk-OFL.txt) |
| Azeret Mono | AzeretMono-Variable.woff2 | 100–900 | [AzeretMono-OFL.txt](public/fonts/AzeretMono-OFL.txt) |

The notices are in [public/third-party-notices.txt](public/third-party-notices.txt). Uncut Sans and Spline Sans remain archived assets, not current layout families. The product brief's sourcing wish is not evidence that the current display face came from Uncut.

## Layout

| Viewport | Tracks | Outer inset | Gutter | Workbench scene / inspector |
| --- | ---: | --- | --- | --- |
| 1200px and wider | 12 | 4vw | 24px | 9 / 3 |
| 768–1199px | 8 | 3vw | 20px | 5 / 3 |
| Up to 767px | 4 | 20px | 16px | Both full width, scene above inspector |

Header, main and footer share a centered maximum width (1600px), including their horizontal padding. The opening, section introduction, laboratory and methodology each use explicit repeated tracks; the current CSS does not use subgrid. Main navigation is flex layout, with a 100px desktop/tablet header and 76px phone header.

The opening title spans eight desktop tracks, with supporting copy starting at track ten. On tablet they use five and three tracks; on phone both span the full grid. Methodology follows a six-track title / track-eight content arrangement on desktop, four / four on tablet, and full-width sections on phone. These are this surface's compositions.

Spacing is a practical vocabulary, not a strict multiples-of-eight system: labels use 6–7px separation, adjacent actions commonly use 8–12px, control groups use 16–24px, and major sections have larger explicit breaks. The frontmatter records recurring small spacing values; it does not claim every gap uses a custom property.

### Mobile context and evidence

Within the phone inspector, the miniature plan and computed outcome stick to the top of the viewport (`top: 0`, z-index 5) while the inspector scrolls. The preview fits within 230px by 150px, preserves the experiment aspect ratio, hides labels and editing handles, and offers play/pause. It is a live read-only spatial preview; its text reports the computed whole-run outcome, not a contact event guaranteed to be visible at the current frame.

The scene view becomes 300px high on phone; the opening scene is 275px high. The file drawer becomes one column. The stress table retains a minimum width (670px) and scrolls in its own container. The pinned/current comparison remains two columns even on phone; there is no implemented stacking override, and that density is an observed limit rather than a rule for future comparisons.

## Elevation & Depth

The interface has no CSS box-shadow or text-shadow vocabulary. Fine borders, neutral surface tones, spacing and selected fills separate controls. The Three.js scene supplies actual geometric depth through an orthographic camera, lighting and PCF shadows; these are scene rendering, not UI elevation tokens.

**The Flat Interface Rule.** Separate controls with tone, spacing and rules; let rendered scene geometry carry physical depth.

Hover changes background, text or border color over 180ms with the browser's default ease. Disclosure arrows rotate 90 degrees over 180ms. Focus uses a 3px ultramarine outline with a 4px offset; primary buttons switch that outline to graphite. Scene handles use a 2px offset; heat-cell hover/selected outlines use graphite with a 1px offset. There is no implemented spring, lift or entrance-animation system.

Reduced-motion CSS disables transitions and animations and changes smooth page scrolling to automatic. Playback begins paused and advances only after explicit play; the preference does not remove the visitor's replay controls or stop user-started playback.

## Shapes

Fields have slight corners (`rounded.field`), buttons slightly softer corners (`rounded.button`), and grouped view switches a small outer radius (`rounded.segmented`). Tabs are square; draggable plan handles are circular hit targets. Dividers and control boundaries are generally 1px strokes. The UI does not introduce pills, badge silhouettes or decorative card shells.

The editable plan is a flat rectangular surface with a control-strength border. SVG uses world-unit strokes and paths, so those measurements are not CSS spacing or border tokens. Plan handles occupy 44px squares despite their smaller visible geometry; inline SVG icons supply interface symbols rather than raster art or icon fonts.

## Components

The code supplies feature components rather than an exported general-purpose component library. The sidecar translates ten representative patterns into scoped HTML/CSS previews; React event handlers, simulation, tab switching and validation are not recreated in those static snippets. No chip or generic card primitive is invented.

### Buttons and actions

Primary actions use ultramarine; dark actions use graphite and turn ultramarine on hover. Default outlined actions use the control boundary and a soft hover surface. Text actions are underlined ultramarine and turn graphite on hover. Icon actions use the same base control with a transparent border and a 44px width. Standard actions have at least 44px height; disabled buttons use 45% opacity and a not-allowed cursor. Hover is not explicitly excluded for disabled buttons in current CSS.

Retain descriptive accessible names for icon-only play/pause, undo and plan actions. Button and disclosure icons are inline SVG. No separate pressed animation is implemented.

### Fields and ranges

Text/select/numeric fields use paper, a control border, 3px corners and at least 44px height. Numeric labels sit above the input with a reserved 48px label area and an optional small unit. `Numeric` validates on blur or Enter, reports bounds through an associated alert and preserves the previous committed value on invalid input. Disabled numeric inputs use 50% opacity. An invalid state has accent error text and `aria-invalid`; there is no distinct invalid-border style.

Ranges use native browser tracks and thumbs with the accent color, at least 44px control height and a monospaced adjacent value. Experiment naming is a separate underline-only field at type-2; it is not the default field shape.

### Navigation and view selection

The header has Laboratory, How it works and Source links. The middle link is hidden on phone; there is no implemented mobile menu or scroll-active link state. View switches use a soft segmented container and graphite selected button, with `aria-pressed`. Scene / Robot / Route inspector tabs use an accent underline and `aria-selected`; arrow keys, Home and End move selection and focus.

### Plan and replay

`PlanEditor` overlays actual button hit targets on SVG geometry. Selection, keyboard edits and drag edits share the experiment state; the mini preview omits those edit handles. The plan has dashed intended route, solid actual route, labeled points, moving-object endpoint and ghost, optional clearance zones, and a contact mark. `Scene3D` is the corresponding lit replay with orbit controls and an unavailable/loading message. Rendering is a view of measured results, not independent evidence of a successful route.

### Pinned comparison and nearest contrast

Pinned and current runs show named outcomes, time, speed and extra grid delay. “What changed” comes from `inputChanges()`: effective speed, robot settings, dimensions, route changes, obstacle additions/removals, geometry and effective moving-object start delays. Route changes are summarized by ordered-point count, not a coordinate-by-coordinate diff; visual height can appear in this list and should not be described as proof of a changed 2D collision result.

“Restore pinned experiment” restores the saved experiment plus its exact replay speed and phase. Undo can recover the preceding geometry; imported visual files require reattachment.

“Compare these conditions” pins the current experiment's baseline and replays the nearest tested opposite outcome. `closestContrast()` measures Manhattan distance in sampled grid indices, relative to the speed sample nearest the baseline and phase index zero. Ties prefer less extra delay, then lower speed. “Opposite” means reached versus did not reach, with contact and time limit both on the unsuccessful side. This is a finite sampled contrast, not an optimum, a probability or a safe operating recommendation.

**The Compare Inputs Rule.** Explain a changed result with recorded effective inputs and replayable conditions; retain the finite-grid limits beside the finding.

### Stress results and disclosure containers

Stress cells are buttons in a labeled table: soft surface for reached, ultramarine for contact, graphite for timeout. Icons, accessible labels and measured duration supplement the fills. Hover and selection have graphite outlines. The finding above the table uses ruled edges and an action; it stacks on phone.

File/import tools use native details/summary and ruled groups. Empty stress results use a broad soft region with explanatory text. These are task containers, not a reusable raised-card system.

## Do's and Don'ts

### Do:

- Do use the three anchors and their existing opacity-derived tones.
- Do keep the exact 1.25 type steps, 150% leading and 12/8/4-track breakpoints.
- Do load the three current font families locally and retain their bundled license files.
- Do pair measured outcomes with text and show effective input differences beside comparisons.
- Do preserve visible focus, accessible names, numeric validation and mobile spatial context.

### Don't:

- Don't restore the archived cream, forest and rust palette or Uncut/Spline typography.
- Don't present a nearest sampled contrast as an optimum, safety score or exhaustive result.
- Don't invent card, chip, shadow or motion primitives absent from the build.
- Don't substitute decorative raster artwork for the live route study.
- Don't treat this documentation pass, prior screenshots or target review scores as a fresh accessibility or quality certification.

Documented limits: no browser review or rebuild was performed for this record; final corrections are reviewed separately. Comparison density on phone, summarized route diffs and visual-file reattachment are described as implemented limits, not endorsed defaults. The sidecar omits synthetic tonal ramps because no eight-step color scale is built. Its snippets retain source states but do not implement application behavior. Product-brief font-sourcing language and the legacy `rust` identifier are recorded as drift, not repaired in source.
