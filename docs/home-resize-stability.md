# VANTAGE home: resize stability and account placement

The WebGL background previously reassigned canvas.width/canvas.height in ResizeObserver. Each assignment cleared the drawing buffer, while the next regular paint could be delayed by the 24fps throttle. This could briefly expose a dark frame during resizing.

The renderer now allocates a bounded drawing buffer once. ResizeObserver updates an aspect-ratio uniform and immediately repaints, without reallocating/clearing the buffer. CSS stretches the existing rendered frame until the projection is refreshed; alpha is enabled and opacity is raised only after a successful first paint. Reduced-motion and lost-context static fallbacks remain.

Home rail/content width transitions now run only for explicit collapse/expand clicks, not continuously while viewport dimensions change. Resize cancels an active toggle transition; reduced motion still disables transitions. Existing fluid scale formulas remain unchanged.

Home UI: VANTAGE logo/footer/tab title; no top search/demo/profile bar; Membership followed by the original avatar and account menu. Removed the extra subscription upsell link and slogan from the sidebar bottom. The demo state remains explicit in the Membership description and footer. The native popover renders above the rail without being clipped when collapsed. Other routes keep their existing shell presentation/search for this home-only iteration.

Validation: build, lint and strict TypeScript passed. 66 Playwright checks passed, including repeated viewport changes without canvas dimension mutations, no resize transition lag, preserved viewport fit, user-menu placement/open/Escape/navigation in collapsed and expanded rails, and existing carousel/market workflows. The automated checks target the identified clear-frame cause; compositor behavior still depends on the user's browser/GPU.
