# Home-only design calibration

Current user scope: iterate only on `/`. Other routes retain their existing presentation. `src/app/home.css` is scoped under `.dashboard-scene`; desktop sidebar collapse is enabled only on home.

Removed the hero eyebrow, decorative ANALYZE/IMPROVE/DISCIPLINE/GROW block, redundant journal CTA, financial summary and sample-trader section. Home now contains the hero and feature carousel.

Restored restrained translucent black/emerald surfaces on home instead of the latest opaque green card treatment. Assets are unchanged pending user-supplied replacements. Hero font remains temporary Manrope, supporting Cyrillic and Latin; user will provide the desired type reference. No speculative font replacement or artificial letter spacing is applied.

Desktop navigation switches between a labelled 226px rail (190px on smaller desktop/tablet widths) and a 76px icon rail. State is saved locally. Icons retain accessible names and native title hints. Mobile drawer remains available; its presentation does not inherit desktop collapsed styles.

Content width is capped at 1600px plus adaptive gutters. Hero type, cards and background have bounded scaling. Three complete cards appear at desktop widths of 1000px and above; narrower widths use a focused swipeable card. Validated standard mobile/desktop sizes plus square 1080×1080, 1920×1080, 2560×1080 and 3440×1440.

Validation: production build, ESLint and strict TypeScript passed. All 30 Playwright checks passed, including icon-rail persistence, removed sections, complete desktop card geometry and wide/square layouts. Inspected desktop, mobile, square and ultrawide screenshots. Manually checked that /trading retains labelled navigation and does not show the home-only sidebar toggle.
