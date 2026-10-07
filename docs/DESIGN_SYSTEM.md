# SceneBreaker design system

The design follows the owner's brief accompanying [this video](https://www.youtube.com/watch?v=vbFn0C-pvis): a 1.25× type scale, 150% leading, 12/8/4-column grids, proximity, hierarchy and a restrained palette. The video did not expose a transcript during research; this implementation follows the supplied notes, not an independently verified transcription.

## Typography

- **Uncut Sans** headings and wordmark: [Uncut catalog](https://uncut.wtf/sans-serif/uncut-sans/), [original source](https://github.com/kaspernordkvist/uncut_sans). Alternate R is enabled through OpenType `ss01`.
- **Spline Sans** body and controls: [Fontshare](https://www.fontshare.com/fonts/spline-sans), [original source](https://github.com/SorkinType/SplineSans). Designed by Eben Sorkin and Mirko Velimirović.
- Both variable WOFF2 files include weights 300–700, are bundled locally, and use `next/font/local`. No external font request at build or runtime. Full OFL licenses appear in `public/fonts/` and third-party notices.
- Numbers use tabular figures in Spline Sans, not a third font.

| Token | Font size at 16 px root |     Line height |
| ----- | ----------------------: | --------------: |
| small |                 12.8 px |         19.2 px |
| base  |                   16 px |           24 px |
| 1     |                   20 px |           30 px |
| 2     |                   25 px |         37.5 px |
| 3     |                31.25 px |       46.875 px |
| 4     |              39.0625 px |     58.59375 px |
| 5     |            48.828125 px |   73.2421875 px |
| 6     |          61.03515625 px | 91.552734375 px |

Every adjacent step is exactly 1.25×. All CSS font sizes reference these tokens. All line heights use the unitless `--leading: 1.5` token, including headings and controls. Body copy and editable inputs remain 16 px; 12.8 px is reserved for secondary metadata and compact controls. Hero text switches whole steps at breakpoints; no fluid interpolation introduces intermediate sizes. Scene-space SVG/canvas labels use world/texture coordinates, not CSS interface pixels.

## Grid and proximity

| Viewport          | Tracks | Outer inset | Gutter | Arrangement                                                                        |
| ----------------- | -----: | ----------: | -----: | ---------------------------------------------------------------------------------- |
| 1360 px and wider |     12 |       48 px |  24 px | Setup 3 + replay 9; evidence 8 + export 4                                          |
| 1200–1359 px      |     12 |       32 px |  20 px | Same spans, compact panel insets                                                   |
| 768–1199 px       |      8 |       32 px |  20 px | Full-width setup with two related groups; full-width replay; evidence 4 + export 4 |
| Up to 767 px      |      4 |       20 px |  16 px | Full-width sections; comparison scenes stacked                                     |

Header, main and footer share the same tracks. Main sections use CSS subgrid to inherit alignment. The content maximum is 1536 px. Related labels and controls are 8–12 px apart; control groups are separated by 20–24 px, with larger section breaks. The result sits directly beneath the experiment, followed by detailed evidence. Secondary search settings stay collapsed.

## Three-anchor palette

| Anchor | Value     | Job                                                       |
| ------ | --------- | --------------------------------------------------------- |
| Paper  | `#f5f3ec` | Dominant neutral canvas                                   |
| Forest | `#183f35` | Text, structure, focus, actions and successful navigation |
| Rust   | `#9d432c` | Movable obstacle, failures and counterexamples            |

The 60/30/10 principle is a visual hierarchy guide: roughly 60% quiet canvas, 30% grouped/tinted work surfaces, and 10% salient actions/evidence. It is not a claim of exact pixel coverage in every responsive state. Do not introduce another hue for hover, charts or replanning. Surface, border and secondary-text shades derive from anchor opacity.

`src/lib/palette.ts` supplies the same anchors to thumbnails, SVG fallback and Three.js. `tone()` composites an anchor over paper. Physical lighting changes the rendered scene's brightness; it does not introduce a separate interface palette.

Failures also have square markers and striped trial bars. Replanned routes are solid; original/failure routes are dashed. Text names and outcomes remain the primary explanation, independent of color.

## Contrast

Relative sRGB luminance, alpha composited against the actual background:

| Usage                                | Contrast |
| ------------------------------------ | -------: |
| Forest text on paper                 |  10.50:1 |
| Muted text (76% forest) on paper     |   5.33:1 |
| Muted text on a selected surface     |   4.87:1 |
| Rust on failure surface              |   5.29:1 |
| Control boundary on selected surface |   3.24:1 |

Decorative dividers use lower opacity; interactive boundaries and focus indicators are stronger. Disabled controls are intentionally dimmed and are not normal-text contrast targets.

## Verification

- 34 tests pass: 28 existing simulation tests plus six design-system checks for type ratios, leading, grid tokens, palette parity, contrast and bundled font licenses.
- ESLint, TypeScript, optimized build and production dependency audit pass.
- Browser checked at 375, 768, 1024 and 1440 px: document width equals viewport width; main grid resolves to 4, 8, 8 and 12 tracks respectively.
- Computed font families are Uncut Sans and Spline Sans; sampled text and controls resolve to 150% line height.
- Visible buttons and disclosure controls meet the 44 px minimum height. Phone comparison stacks, and the trial table scrolls within its own container.
- Warehouse search still finds the 1.15 m counterexample; end-of-replay shows “Robot stalled” beside “Goal reached” after selecting A\* replanning.
- Native modal receives focus, fits the viewport, dismisses with Escape and returns focus to its trigger.

Browser checks are interactive smoke tests, not a full assistive-technology or cross-browser certification. The simulation/search algorithm is unchanged by this design revision.
