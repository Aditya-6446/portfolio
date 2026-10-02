# Aditya Sharma — Portfolio

A responsive static portfolio with an editorial charcoal / warm-white design and one continuous animated node network.

## Run locally

No installation or build step is required. Open `index.html`, or run a static web server from this directory (for example `python -m http.server 4173`) and visit `http://localhost:4173`.

## Update the site

- `index.html`: biography, project cards, experience, learning, skills and contact links.
- `styles.css`: shared colors, typography, layout and responsive behavior.
- `app.js`: accessible mobile navigation and the continuous background network.
- `assets/`: résumé, dashboard PDF, project previews and favicon.

To add a project, duplicate an existing `<article class="project ...">` inside `#projects`, update its text and links, and add any preview image to `assets/`. Keep factual claims grounded in the project evidence. Use descriptive image text and include real image dimensions.

The résumé download is the corrected September 2026 DOCX. Replace `assets/Aditya-Sharma-Resume.docx` to update it, or change the three résumé links if switching to PDF.

## GitHub Pages

Publish the `main` branch from its root directory. `.nojekyll` keeps these static files unchanged. All local asset paths are relative, so the site supports both a user site and a project site URL.

## Accessibility and motion

The page includes semantic landmarks, keyboard focus states, a skip link, a responsive menu, native disclosure controls, and descriptive image text. The network is decorative and never intercepts input. It becomes stationary when reduced motion is enabled, can also be paused with the footer control, and suspends animation in a hidden tab.

## Maintenance

Keep `work/` out of published content: it contains source notes, temporary report copies, and verification artifacts. No runtime dependencies, analytics or external fonts are required.
