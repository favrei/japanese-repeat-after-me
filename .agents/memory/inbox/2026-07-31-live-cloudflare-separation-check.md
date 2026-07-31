# Live local Cloudflare separation check

- Applied `drizzle/0000_overrated_otto_octavius.sql` successfully to the
  persistent local D1 database with `npm run db:migrate:local`.
- Started the actual Vinext/Cloudflare dev host at `http://localhost:3000/`.
- `GET /api/catalog` returned HTTP 200 with
  `{"schemaVersion":1,"entries":[]}` from local D1.
- The root page still returned all three expected library labels while the
  backend catalog was empty.
- The local host was stopped after the check.
