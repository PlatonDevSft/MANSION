# Home materials, motion and markets

Home-only changes: per-line headline shading, stationary clear-glass icon surfaces and translucent carousel panels, neutral graphite/cyan sidebar, integrated sidebar arrow and viewport-height-aware composition. Other page layouts remain untouched.

The pasted snippets import implementations that were not included. Local equivalents are supplied: LiquidGlass uses layered specular edges plus CSS backdrop blur/saturation, with an opaque fallback. It does not claim physical Apple refraction and never follows the pointer. Velaris renders a custom 2D simplex-noise field in a low-resolution WebGL canvas at up to 24 fps; it stops drawing offscreen/hidden, disposes resources, and uses a static CSS fallback for reduced motion or unavailable/lost WebGL. No new runtime dependency was needed. The original stone image is retained; screen blending lets the animated field appear behind its black areas.

## Market strip

`/api/markets` reads the documented CoinGecko public markets endpoint. The initial set is BTC, ETH, SOL, BNB and XRP in USD. No API key is required for that endpoint; provider availability/rate limits still apply. No gold, oil or index quotes are implied. Those need an appropriate licensed/dedicated provider if added later.

The strip intentionally displays no current price: only a sparkline and the provider's 24-hour percentage. The sparkline uses the final 25 hourly samples of CoinGecko's 7-day series, so its accessible label and tooltip say **approximately 24 hours**. Percentage change is the provider's actual 24h statistic, not inferred from the sparkline. Upstream data are validated; failures return HTTP 503 and show a retry state, never fabricated fallback quotes. Previously loaded data remain visibly timestamped. Source attribution, UTC update time and external source links are retained.

Server revalidation and CDN cache are 5 minutes; visible clients refresh every 5 minutes. Browser tests mock provider success/failure for repeatability; a separate live check returned 200 and all five assets.

In this managed environment, Node.js 24 must use the supplied HTTP proxy for outbound requests: `NODE_USE_ENV_PROXY=1 npm run dev` (or `npm run start` after build). This is environment-specific; Vercel normally has direct outbound access and needs no proxy variable. TLS verification remains enabled.

Desktop/tablet spacing is based on both width and viewport height. Typical desktop and laptop sizes retain the entire hero/carousel in the viewport; mobile uses a compact primary composition. Browser zoom and unusually short windows may still require natural scrolling; content is never clipped or made inaccessible to force a fit.

Validation: production build, lint, strict TypeScript, 12 unit tests and 52 Playwright checks passed. Live application /api/markets returned HTTP 200, provider CoinGecko, five assets and 25 samples per asset. Hero/full-carousel viewport checks cover 1920×1080, 1920×900, 1366×768, 1280×720, 800×600 and 375×667/812, 390×844. Reduced-motion fallback and provider-error retry are covered.
