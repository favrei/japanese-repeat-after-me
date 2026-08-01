# Office-gig browser QA tooling notes

- The app does not install Playwright/Puppeteer as a local package, so the
  connected Browser runtime was used for responsive interaction QA.
- Creating a grouped Chrome tab failed because that window does not support
  grouping; claiming the newly opened blank tab and navigating it directly
  worked.
- The only console entries were the Chrome-extension message-channel warning,
  with no app-origin error or warning observed.
- `?art=office` is intentionally development-only; production visual QA used
  the actual office story screens instead.
