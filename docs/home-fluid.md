# Home: viewport-wide calibration and mixed-market strip

Only home presentation is changed. The existing stone/image files are untouched.

## Layout/material corrections

- Removed the 1600px content cap. Main/header/footer use available width after the sidebar, with adaptive gutters.
- Sidebar, typography, cards and artwork scale separately with viewport width and height. Wide-screen type and card size grow instead of staying a small centered group. Natural scrolling remains available for zoom/short windows.
- One continuous ambient layer spans the workspace. Removed the extra legacy pseudo-layer; the stone layer feathers horizontally and vertically within its own bounds, independently of the carousel or markets position. Canvas rendering preserves viewport aspect ratio at bounded resolution.
- Headline uses the already-localized Manrope 500 weight instead of 400.
- Glass blur reduced from 9px to 2px on cards and from 3px to 1px on small glass surfaces.
- Icon badges use explicit centered grid alignment with reset SVG padding/margins/position.
- Arrow and logo share one vertical position variable in expanded/collapsed rails. Sidebar/content transitions share timing; navigation SVGs interpolate horizontally without a vertical jump.

## Markets

The selection is EUR/USD, GBP/USD, gold, NASDAQ 100, S&P 500, BTC and ETH. Primary mini-charts are loaded from Yahoo Finance's public chart endpoint with 15-minute observations for the last available session. Null observations are excluded; percentage change is computed against chartPreviousClose. This is labelled **last session / previous close**, not an exact rolling 24-hour statistic, and may be delayed or closed-market data. Gold in this source is the GC futures contract, identified in the UI.

Initial curl requests encountered HTTP 429; normal Node.js requests from the application subsequently succeeded for all seven instruments. The endpoint can be temporarily unavailable. The application has a no-key official TradingView ticker-tape fallback configured with FX:EURUSD, FX:GBPUSD, OANDA:XAUUSD (spot gold), NASDAQ:NDX, SP:SPX, BITSTAMP:BTCUSD and BITSTAMP:ETHUSD, preserving attribution. The fallback is the vendor's standard scrolling quote display, including prices, rather than the custom sparkline row. If the external embed is blocked, a source link/error is displayed. No fictitious or synthetic market series are substituted.

The original CoinGecko-only provider has been removed. Partial primary responses do not quietly turn the selection back into crypto-only quotes. Each primary request is cached for 5 minutes; the browser refreshes on the same cadence. HTTPS proxy requirements of the managed cloud remain unchanged.

## Validation

Production build, lint, strict TypeScript, 12 unit tests and 58 Playwright checks passed. Browser checks include actual font/card growth from 1920×1080 to 3440×1440, full available content width, constant arrow Y throughout collapse, centered icon geometry, viewport-height fit, and TradingView fallback instrument configuration. Primary live application response displayed all seven markets in browser screenshots. These checks are not proof of Vercel deployment or future provider availability.
