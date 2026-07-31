# Source-inspection test glob failed in zsh

- A read-only source inspection used `app/client/**/*.test.ts` without enabling null-glob behavior.
- zsh rejected the unmatched glob before the final `rg` command ran.
- The earlier explicit file reads and status check succeeded; test discovery was rerun with `rg --files` instead.
