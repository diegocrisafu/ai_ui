# SceneBreaker — independent methodology assessment A

Scope: lower `#how-it-works.method-section` only. Read-only source assessment; this report is the sole requested write. Preserve Familjen Grotesk 700 monochrome headings, exact 1.25 scale, 150% leading, 12/8/4 tracks, and the surrounding flow.

Evidence: supplied October 8, 1:08:18 AM screenshot inspected with `view_image`; current `src/app/globals.css`, relevant `src/components/lab/RouteLab.tsx`, `src/app/layout.tsx`, `DESIGN.md`, product and surface context. Impeccable SKILL.md, layout.md and typeset.md read fully. Context launcher returned permission denied; context read directly. No browser, detector, or prior review files opened. Screenshot is a crop, not a known CSS viewport: rendered proportions support composition findings, not pixel measurements or mobile verification.

## Recommendation

Give this section a stronger title and a more connected two-column composition. Read in this order: title → workbench purpose and limits → visible answer about personal files → optional technical detail → source link. Keep a quiet, readable explanation with ruled disclosures; no new cards or decorative treatment.

### Layout

| Question | Evidence and recommendation |
| --- | --- |
| Reading order | The screenshot's title is recognizable, but its small footprint leaves a large empty left field while the right column carries nearly all the content. `.method-section h2` is only `--type-5` on desktop (48.83px at a 16px root). Try `--type-7` (76.29px) on desktop, `--type-5` on tablet, and retain `--type-4` on phone. Keep 700, graphite and 1.5 leading. The two phrases should read as one section title. |
| Grouping | `.method-section h2` spans six tracks while `.method-content` starts at track eight: an unused seventh track compounds the gutter. Start content at track seven, retaining a six/six split and the existing 24px gutter. Align the top of both groups. Keep the existing four/four tablet split. This moves the explanation toward its title and grants prose more room. |
| Rhythm | `.lead` has 18px below it, the next paragraph 28px, and open-detail paragraphs 18px. Use a local cadence of 24px after the lead, 32px before disclosures, and 16px between disclosure paragraphs; reserve 24px for the source-link separation. On phone the title's 18px margin adds to the 16px grid gap: replace both contributions with a single 32px row gap and zero title margin. Keep the 150% heading leading; fix surrounding spacing rather than tightening its lines. |
| Structure | Three native disclosures are appropriate for optional engine/import/privacy details. The personal-file capability is prerequisite understanding, so it should be visible above them. Keep the existing lead and limitations, then add a compact, factual import sentence. Do not duplicate the upload form here. Preserve DOM order and native disclosure semantics. |
| Density | The screenshot feels sparse overall but concentrates reading in the right column. Rebalancing columns and strengthening the title resolves this more directly than enlarging every text role. Retain 16px explanatory text, 20px lead and a bounded measure. For section padding, test 96px top/bottom desktop and 64px phone as local replacements for 80/110 and 50/64; the cropped image does not establish adjacent-section spacing. |
| Adaptation | Current rules are six/five columns at ≥1200px, four/four at 768–1199px, and stacked full width at ≤767px. Preserve the breakpoint/grid system with the proposed six/six desktop change. On phone keep title, explanation, disclosures and source in DOM order. Do not introduce sticky positioning or CSS reordering. At intermediate widths, prefer an earlier full-width stack if the enlarged title crowds its four tracks; do not reduce body size to force a split. |
| Extremes | An expanded engine disclosure contains two substantial paragraphs; let the section grow naturally. `.method-content summary` inherits flex layout and its trailing SVG can shrink: retain a full-row hit area (currently ≥64px), give the arrow `flex: none`, and use a scoped text wrapper if needed for reliable wrapping. Allow the source-link text to wrap at 320px and 200% zoom. Existing `h2` overflow wrapping helps long words; test localization and the forced `<br />` together. No methodology-specific overlay, sticky element or empty-state dependency is present in inspected markup. |

### Typography

| Question | Evidence and recommendation |
| --- | --- |
| Authority and fit | `h1, h2` use `var(--font-body)`, weight 700, normal style, graphite, −0.035em tracking and `var(--leading)`. `layout.tsx` registers local Familjen Grotesk 400–700. This matches the accepted identity; preserve it. Azeret Mono remains for measurements elsewhere and has no needed role here. |
| Hierarchy | Current local roles are title 48.83px/700, lead 20px/400, body 16px/400 and disclosure summary 16px/500. The title is underpowered for the screenshot's broad field. Increase the title first; a scoped summary weight of 600 can distinguish questions from prose without making every row a headline. Retain the current lead size so the title leads clearly. |
| Scale and consistency | Use existing whole steps only: proposed desktop/tablet/phone title `--type-7 / --type-5 / --type-4`; lead `--type-1`; body and summaries `--type-base`. Preserve `--leading: 1.5` for every role. Avoid interpolated sizes and global h2 changes that would alter the opening or workbench. |
| Reading | `.method-content` caps width at 75ch but the grid often constrains it earlier; 75ch is a ceiling, not evidence of actual line length. Bound prose to approximately 60–65ch where room permits, and allow shorter lines on small screens. Preserve normal body tracking, current ink/muted distinction and clear paragraph separation. The screenshot supports legibility concerns about composition, not a measured contrast failure. |
| Stress | The hard break in `RouteLab.tsx` deliberately separates “The model.” and “Its limits.” Keep that editorial pairing where it fits, but verify the larger size does not create additional awkward wraps under zoom, fallback fonts or translation. Use auto heights and wrapping; no clipping, nowrap or reduced leading to force fit. The variable font includes 700, so no missing heading weight is apparent from registration. |
| Delivery | Both active families are local variable WOFF2 files with `display: "swap"`; archived serif assets are not registered in `layout.tsx`. No added asset or font family is needed. Registration supports visible fallback text, but fallback metrics and actual layout shift were not measured; leave delivery changes out of this narrow proposal unless parent verification exposes a problem. |

### Make the personal-file answer visible

Yes, current source already supports personal 2D and 3D input through `.file-drawer`: PNG/JPG/WebP floorplans and self-contained GLB/glTF scenes. These files are read locally. The floorplan must be calibrated and collision objects traced; 3D imports require review of projected collision boxes. This is not unrestricted mesh physics.

Suggested visible copy inside `.method-content`, immediately before the disclosures: “Bring your own 2D floorplan (PNG, JPG or WebP) or self-contained 3D scene (GLB/glTF) through Scene files. Files stay on your device. Trace floorplan obstacles or review the model’s collision boxes before testing.” Keep deeper approximation details in the existing import disclosure. This states capabilities already evidenced by the file inputs and handlers, rather than proposing a new upload feature.

Parent's bounded visual confirmation: desktop title/column balance; tablet title fit; 320px and 200% zoom wrapping; all disclosures open; keyboard focus and source-link wrapping. These remain verification tasks, not results of this assessment.
