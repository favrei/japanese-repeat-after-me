# Site package cleanup used Trash after direct removal was rejected

- Direct removal of the explicit temporary Sites package directory was rejected
  by the command safety layer because `rm -rf` is not permitted.
- The directory was moved intact to the recoverable macOS Trash path
  `/Users/peter/.Trash/codex-site-package-2026-07-31-1819` instead.
