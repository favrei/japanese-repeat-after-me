# Sites version 6 deployed

The complete current repository state was committed as
`1c8e52ae6be7310c47ef33d37d14d0ac913358dd` (`Ship office story and
recognition improvements`) and deployed to production as Sites version 6.

- Production URL: `https://japanese-speaking-story.zenridge.chatgpt.site`
- The Sites source branch was verified at the exact deployed commit.
- `npm run qa` passed: typecheck, lint, production build, art/model checks,
  and all 50 app tests.
- Experiment 007 passed 7 unit tests; experiment 008 passed 10 unit tests.
- Release package creation: 4.8 seconds.
- Saved archive: 145,807,360 bytes and 1,282 files.
- Version save/upload and ingestion: 80.7 seconds.
- Production deploy/build/publish: 62.8 seconds.
- Final public HTTP check returned 200 with HTML in 4.0 seconds.

The source Git transfer was incremental, but Sites version saving still
uploaded and ingested the full deployment archive. The full archive step and
the subsequent publish, rather than the local build, accounted for most of the
release latency.
