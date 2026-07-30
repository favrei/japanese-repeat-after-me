# Stage redesign — scoring fixture followed conversation order

- The first redesigned `npm run qa` passed art validation, typecheck, lint,
  build, flow tests, rendered HTML, and privacy/PWA checks.
- Three scoring tests failed because their fixture used `FLOW[4]`. After the
  redesign, position 4 is an autoplay bubble, while the tests intended the
  stable `ordering-order` learner bubble.
- Fix the test fixture to select `ordering-order` by ID; scoring implementation
  and flow logic do not need changes.
