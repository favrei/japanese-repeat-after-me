# Client test inspection used stale filenames

- A read-only inspection tried `tests/client/microphone.test.mjs` and `local-recognition.test.mjs`.
- Those files do not exist; the current route tests are in `tests/client/microphone-route.test.mjs`, and there is no direct local-recognition lifecycle test yet.
- The source search still completed and identified all current references.
