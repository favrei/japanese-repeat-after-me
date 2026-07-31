# Drizzle generation starter-directory gotcha

- The first `npm run db:generate` in `poc/` found the pre-existing empty
  `drizzle/meta/` directory and failed to open `drizzle/meta/_journal.json`.
- Drizzle Kit still exited with status 0 despite printing the ENOENT error, so
  migration generation must be verified by checking the generated files, not
  only the command exit code.
- Removing only the empty starter directories allows a clean first generation.
