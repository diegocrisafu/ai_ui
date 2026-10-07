# Practical pre-launch review — Route Laboratory

This is an implementation review, not legal advice or a guarantee of regulatory compliance.

## Privacy and honesty

- No accounts, forms collecting personal details, analytics, advertising, cookies or persistent browser storage.
- Files are read locally through browser APIs. The application has no upload endpoint.
- Fonts are hosted with the static app. No external model resources are allowed.
- Hosting-provider access logs remain outside the application's control and are disclosed.
- Original images/models are not embedded in JSON downloads; this is stated before export.
- No unsupported claims about AI, NVIDIA integration, safety, accuracy, minimal failures, commercial users or recruiter outcomes.
- Simulation assumptions and import approximations are visible in the interface and methodology.
- No cookie banner is added to pretend consent is needed for tracking the app does not perform.

## Accessibility implementation

Semantic headings, named numeric controls, inline invalid-number messages, keyboard route/object movement, undo/redo, playback pause and scrubbing, text equivalents for outcomes, non-colour heatmap symbols, and visible focus treatment are implemented. Motion does not auto-start. CSS honours reduced-motion preferences.

Palette tests cover text and control-boundary contrast for semantic surfaces. They do not certify every rendered pixel or third-party 3D material. Browser and independent critique evidence must be considered alongside the unit tests.

## Files and resource bounds

Experiments: validated versioned schema, bounded room/point/object counts, finite values, unique IDs and valid motion legs. Imported result fields are ignored.

Images: PNG/JPG/WebP, 8 MB and 20 MP limits. Models: self-contained GLB/glTF, 15 MB, 250,000 vertices, room bounds and a maximum of 24 projected collision objects. These are defensive limits, not a sandbox certification for hostile graphics assets.

Static deployment excludes environment files and private local tooling. No secrets are required.

## Attribution

Instrument Serif, Familjen Grotesk and Azeret Mono are bundled with full SIL OFL notices. React, Next.js, Three.js, Lucide and archived font notices are retained in the public credits. The example glTF geometry was authored in this repository; no external image or robot model is represented as original work.

## Release gate

Run `npm run check`, `npm run build`, and the production dependency audit. Verify local imports, worker output, responsive views and the public URL after deployment. A local successful build is not evidence of a public release or independent user validation.
