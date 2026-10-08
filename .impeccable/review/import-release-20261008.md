# Import discoverability and methodology layout — release review

## Scope and changes

The existing Impeccable layout/type A/B review was followed by a bounded edit and browser verification pass. UI/UX Pro Max informed responsive readability and focus management without replacing the approved typography or palette.

- Enlarged the methodology heading to 95.37 px on wide desktops, 76.29 px on smaller desktops, 48.83 px on tablets and 39.06 px on phones. Kept the exact 1.25 scale and 150% line height.
- Removed the unused grid column between heading and copy. Applied optical top alignment, a 65ch reading limit and a 32 px stacked phone gap.
- Added a homepage import action; moved the importer above the editor; exposed three explicit choices: 2D floorplan, 3D model and saved experiment.
- Added the floorplan next step, focused model review, return-to-editor focus and long-filename wrapping.
- Source links target the release branch, not the older implementation on main.

## Verification

- `npm run check` and production static build passed: 66 tests, lint and TypeScript checks.
- Final Impeccable layout/typeset detector runs: no findings in the scoped changes.
- Desktop, tablet and phone screenshots inspected; final desktop capture confirms 95.37 px heading and 36 px optical copy offset. No horizontal document overflow at the checked widths.
- Fresh homepage import action opened the importer, focused its summary and placed it before the editor.
- Actual PNG import displayed the reference; the next-step button returned focus to the editor. Collision objects remained explicitly unchanged.
- Actual sample glTF import reported two projected boxes and one skipped mesh. Applying it produced a runnable, editable scene; keyboard object adjustment and Undo worked.
- A glTF referencing external resources was rejected without replacing the active experiment.
- A 120-character model filename at 320 px width wrapped inside the review; document and review did not overflow.
- Screenshots: `method-desktop-20261008.png`, `method-tablet-20261008.png`, `method-phone-20261008.png`.

# Check — SceneBreaker

Reviewed the public route-lab source, local production build, import validation, font/software notices and launch configuration. Assumption: Canadian personal, noncommercial portfolio demo for worldwide visitors; no accounts, payments or application data service. This is a practical risk review, not legal advice.

## Blockers — fix before this goes live

None identified in the reviewed scope. This is not a compliance certification or proof of real-world robot safety.

## Should fix — soon after launch

No known launch-blocking accessibility or privacy defect found. Full assistive-technology testing remains outside this pass; perform that before making a formal accessibility-conformance claim.

## Polish — when there is time

The repository does not declare a license for its own original source. Third-party notices are present. A chosen source license and dated copyright line would clarify reuse; they are not prerequisites for hosting this personal demo.

## Needs a decision from you

None required for this release. Do not infer a commercial entity, legal address, refund promise or open-source license.

## What I fixed

- `src/components/lab/RouteLab.tsx`: visible import entry points, honest format instructions, focused import review, explicit next steps, release-source links.
- `src/app/globals.css`: heading hierarchy, grid alignment, reading width, responsive spacing and filename/error wrapping.
- `tests/navigation.test.ts`: regression checks for import discoverability/order and disclosures.

## Eight-area evidence

1. Legal pages: footer links to the actual local-file/privacy and simulation-limit disclosure (`RouteLab.tsx`, privacy details). No sales, accounts or commercial promises; refund terms are inapplicable.
2. Consent: no app analytics, nonessential storage, embedded trackers or personal-data submission forms found. No artificial cookie banner added.
3. Data collection: scene inputs/files stay in tab memory; export is a user-initiated local download. External model resources are blocked. No credentials, application API routes or client environment secrets found in the reviewed source. Hosting access logs are explicitly distinguished from app file handling.
4. Third parties: fonts bundled locally. GitHub links are ordinary external navigation, not embeds. No remote font service, analytics pixel or iframe in the route-lab entry point.
5. Accessibility: ink `#17191f` on paper `#f5f6f8` measures 16.25:1; accent `#2547d0` measures 6.72:1; 76% ink/paper muted text (`#4c4e53`) measures 7.70:1. Automated contrast tests cover other semantic surfaces. Named controls, skip link, focus indicators, textual outcomes, numeric geometry editing and alert/status regions exist. Import focus and keyboard geometry adjustment were exercised. Not a full screen-reader audit.
6. Marketing honesty: no fabricated testimonials, customer logos or rankings. Results are deterministic calculated runs, not safety certification. Visible copy says image tracing is manual and 3D collision geometry is an approximation; no automatic floorplan understanding claim.
7. Business details: named personal creator and GitHub source/profile route, no payments, prices, registered-business assertion or invented address. Real commercial/contact obligations must be reassessed if the product changes purpose.
8. Copyright: font OFL files and bundled-library/icon notices exist in `public/fonts` and `public/third-party-notices.txt`, linked from the footer. New floorplan fixtures are authored geometric test data; no stock or externally sourced image was added.

## Boundaries

No 10/10 score or perfection claim is made. Image plans still require manual collision tracing; glTF/GLB conversion produces editable axis-aligned approximations, not articulated mesh physics. This release improves discovering and completing those real workflows rather than claiming additional capabilities.
