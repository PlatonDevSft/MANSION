# Mansion development

- Use this existing checkout in the isolated environment. Do not create worktrees unless explicitly requested.
- Next.js App Router + TypeScript strict. UI language Russian; move copy into typed locale dictionaries when adding English.
- Demo is local-only, visibly labelled. Never imply demo data is live, verified, synced or delivered.
- Never mix currencies or apply the linear P&L formula to unsupported instruments. Money inputs are decimal strings; calculations use Decimal.js; PostgreSQL uses numeric.
- Supabase client credentials must be anon/publishable only. Authorize server actions with getUser(); keep RLS on all tables. No service-role key in browser code.
- Keep private notes/trades separate from public posts. Do not expose trade screenshots publicly.
- Feature illustrations are intentional CSS/SVG fallback compositions, not temporary stock photos. No WebGL necessary.
- Run lint, typecheck, unit tests, build and relevant browser tests. Record external checks that remain unverified.
- AI/news/calendar/billing are extension points, not working integrations. Never fake success.
