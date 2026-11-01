# Integration checks (requires configured Supabase)

These are planned manual checks, not a claim of execution.

1. Apply migration in a disposable project; create and confirm users A/B.
2. A creates a trade, strategy, note, tag and private image in A's folder.
3. B cannot SELECT, UPDATE, DELETE A's rows or INSERT a link to A's trade/strategy; direct REST and UI must agree.
4. B cannot read A's Storage object or upload into A's folder. Anonymous access must fail. Oversized and unsupported MIME uploads fail.
5. Neither user can create/update subscriptions, publish educational content, or assign an admin response/status to support requests.
6. Expired session refreshes through middleware; logout prevents access to /account.
7. Registration confirmation and password-reset callbacks work on localhost, Preview and production allowlisted URLs. Arbitrary redirect targets cannot be supplied.
8. Review CSRF protections of Server Actions, rate limits in Supabase Auth and app-level abuse limits before commercial deployment.

No admin UI, service-role endpoint or account-deletion endpoint is exposed in this iteration.
