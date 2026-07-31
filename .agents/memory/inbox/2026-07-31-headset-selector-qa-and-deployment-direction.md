# Headset selector passed automated QA; hardware test remains open

- The user explicitly approved deployment without a current real-device
  Bluetooth test and asked that the test item remain open until the user closes
  it personally.
- Added an explicit Chrome microphone-input selector, device-local remembered
  preference, exact `deviceId` capture request, browser route evidence, and
  fail-closed cancellation on track mute/end or loss of the selected input.
- The UI always labels the Bluetooth hardware test as open; browser metadata is
  not presented as physical-route proof.
- Added five microphone-route unit tests and deployment-artifact assertions.
- Bumped the PWA shell cache from v10 to v11.
- `npm run qa` passed on 2026-07-31: art/model validation, typecheck, lint,
  production build, 28 client tests, 2 contract tests, 7 Worker tests, and 5
  integration tests.
- No real microphone, AirPods, Android, visual-browser, or physical-signal test
  was performed in this pass.
