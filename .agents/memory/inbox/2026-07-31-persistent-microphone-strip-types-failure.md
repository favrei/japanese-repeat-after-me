# Persistent microphone test initially failed under strip-only TypeScript

- `npm run typecheck` passed after the persistent game-session microphone implementation.
- The first `npm run test:client` failed because Node 22 strip-only TypeScript does not support constructor parameter properties in the new `GameMicrophoneSession` class.
- The class was changed to explicit field declarations and assignments before rerunning the test gate.
