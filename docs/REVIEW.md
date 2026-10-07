# check — SceneBreaker

Reviewed the implementation as a personal, non-commercial portfolio experiment for a Canadian owner and potentially worldwide visitors. Review date: 2026-10-07. No accounts, payments, personal-data forms or safety-critical use are in scope.

This is a practical risk review, not legal advice. Any commercial or safety-critical deployment needs appropriate professional review.

## Blockers — fix before this goes live

No unresolved production blocker was identified within the reviewed scope. This is not a legal-compliance, accessibility or security certification.

## Should fix — soon after launch

**Development-only dependency advisory** — `package-lock.json`, `package.json:30`

What's wrong: the full npm audit reports five high-severity entries in one chain: `eslint-config-next → @next/eslint-plugin-next → fast-glob → micromatch → braces`. The root advisory concerns stack exhaustion from deeply nested glob patterns. These packages are not application runtime dependencies.

Fix: monitor [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) and update when the compatible upstream fix is available. Do not force npm's proposed downgrade to Next 14 lint tooling. The CI job has read-only repository permissions and a 15-minute timeout. `npm audit --omit=dev` currently reports zero vulnerabilities.

**Accessibility coverage is bounded** — `src/components/scenebreaker/SceneView.tsx`, `src/app/globals.css`

What's wrong: browser checks are not a full screen-reader or cross-device audit. Some secondary technical labels are deliberately compact; orbiting the 3D view is a pointer interaction.

Fix: test with VoiceOver/NVDA and actual touch devices before broad release. All experimental outcomes have text equivalents; the top-view control, replay, settings and result comparison are keyboard accessible without orbiting.

## Polish — when there's time

**Actual deployment data handling** — `src/components/scenebreaker/SceneBreaker.tsx:1220`

What's wrong: app-level experiments stay local, but hosting access-log retention, infrastructure providers, domain ownership and any future analytics configuration are outside this code review.

Fix: review the selected host before treating the scope statement as a complete service-level privacy disclosure. Add a tailored policy if deployment collects personal data. Do not add a fictitious cookie banner or invented retention promises now.

## Needs a decision from you

No decision blocks this local, non-commercial implementation. Commercial terms, business identity, hosting retention and safety-sensitive uses would require new facts and a separate review; no such facts or commitments have been invented.

## What I fixed

- `src/app/globals.css`: strengthened text contrast, preserved visible keyboard focus, increased mobile body text, repaired the mobile result layout and honored reduced-motion preferences.
- `src/components/scenebreaker/SceneBreaker.tsx`: named the icon-only comparison control, associated labels with inputs, named the native modal, described external-link behavior and kept notification/result announcements accessible.
- `src/lib/simulation/engine.ts`: normalized replay timestamps so the scrubber can reach the final state; retained checked endpoint connections for off-grid routes.
- `src/lib/simulation/scenarios.ts`: bounded configuration values and rejected prototype-key scene IDs; ensured repeated validation does not fail due to floating-point rounding.
- `src/components/scenebreaker/SceneBreaker.tsx`: bounded imports at 2 MB, rejected incompatible report versions, and ignored imported result claims in favor of recomputation.
- `package.json` / `package-lock.json`: removed unused weather-app dependencies and upgraded Next.js to 16.4.0; the production dependency audit reports zero vulnerabilities.
- `public/third-party-notices.txt`: preserved React, React DOM, Next.js, Three.js, Lucide/Feather and Uncut Sans/Spline Sans notices, linked from the scope dialog.
- `README.md`, `docs/METHODOLOGY.md`: described 2D model limits, privileged A\* map access, finite-grid minimum claims, separate verification cost, fixed-preset benchmark bias and cross-runtime floating-point tolerance.

## Checklist coverage

| Area               | Finding                                                                                                                                                                                                          |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Legal pages        | Footer-linked scope/privacy explanation; no fabricated commercial terms or refund policy for a free portfolio demo. Host-level disclosure remains deployment-specific.                                           |
| Consent            | No app cookies, tracking, advertising, persistent storage or personal-data collection. No consent banner needed for the reviewed implementation.                                                                 |
| Data collection    | Only preset, seed, budget and shift settings. Files are read locally; no upload endpoint. No secrets required or referenced by application code.                                                                 |
| Analytics / embeds | No analytics scripts, iframes, pixels, social embeds or external runtime AI calls. Fonts are bundled locally and self-hosted; no font-service request at build or runtime. GitHub is an ordinary outbound link.  |
| Accessibility      | Labels, named controls, native modal focus/escape, keyboard range controls, text equivalents, visible focus, reduced motion, four responsive widths and measured contrast checked. Not a full conformance audit. |
| Honesty            | No fake users, awards, testimonials, safety guarantees or unmeasured performance claims. Search evidence is computed; random wins first-discovery speed on these presets and that is disclosed.                  |
| Business details   | No seller, payment or contractual service. Repository links identify the project; business addresses and registration details were not invented.                                                                 |
| Copyright          | Original programmatic scene geometry/SVGs; third-party library, icon and font notices included. No stock images, unlicensed media or company logos.                                                              |

## Measured color checks

Ratios calculated using relative sRGB luminance; normal text requires 4.5:1, large text and focus indicators 3:1. This is a representative palette check, not an exhaustive certification of every state.

| Usage                                | Foreground / background          |   Ratio |
| ------------------------------------ | -------------------------------- | ------: |
| Body / primary button                | `#183f35` / `#f5f3ec`            | 10.50:1 |
| Muted copy on paper                  | `#4d6a61` / `#f5f3ec`            |  5.33:1 |
| Muted copy on selected surface       | `#48665d` / `#e1e3dc`            |  4.87:1 |
| Failure copy                         | `#9d432c` / `#f0e8e0`            |  5.29:1 |
| Focus indicator on selected surface  | `#183f35` / `#e1e3dc`            |  9.01:1 |
| Control boundary on selected surface | 60% forest over selected surface |  3.24:1 |

See [the design system](DESIGN_SYSTEM.md) for type, grid, font sources and the later design-verification pass. The six new static design tests complement the 28 simulation tests below.

## Verification evidence

- 28 deterministic engine/validation tests, ESLint and TypeScript checks pass.
- Optimized Next.js production build passes; production-dependency audit reports zero vulnerabilities.
- The production worker found 1.15 m, 1.30 m and 1.20 m failures for the three respective presets. Lowering the range to 0.05 m showed an honest no-failure result.
- Synchronized replay shows the local controller stalled while A\* reaches the goal; scrubbing to the end correctly reports completion.
- A downloaded warehouse report was read from disk and compared with a fresh engine run: identical outcomes, configuration and trial sequence; maximum difference across 1,493 numeric values was 6.94e-18, within the documented 1e-9 tolerance.
- Imported both that real export and a fixture with fabricated result fields. Only validated settings were used. A prototype-key fixture was rejected without replacing the active experiment.
- At 375, 768, 1024 and 1440 px, document width matched viewport width and no visible button lacked an accessible name.
- Native dialog focus, Escape dismissal and focus return were verified. Production browser console had no captured warnings or errors during these checks.
- A 20-seed benchmark was rerun and matched the documented table. These are fixed demo presets, not held-out scientific validation.

The browser smoke checks above were performed interactively, not by a checked-in end-to-end test runner. CI covers the pure engine plus static/build checks.
