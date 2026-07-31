# Persistent microphone local preview handed off

- The normal development host exposed a known Vite HMR `send` error overlay in the retained Chrome environment.
- The QA-passed production build was started locally instead at `http://localhost:3000/`; a reload showed the expected four-stage library with no visible error overlay.
- The Chrome tab was left open as the user-facing deliverable, and the local production server remains running for the user's AirPods test.
- No microphone permission was accepted and no ambient audio was captured automatically; the user will perform the real hardware turn test.
