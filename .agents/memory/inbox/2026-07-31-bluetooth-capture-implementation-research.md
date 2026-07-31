# Bluetooth capture implementation research

- The current recorder in `app/client/recognition/localVosk.ts` requests the
  browser default microphone. It does not enumerate, select, display, or guard
  a headset input.
- Desktop implementation: obtain permission, enumerate `audioinput` devices,
  require explicit user selection, then request the selected `deviceId` with an
  `exact` constraint. Correlate `MediaStreamTrack.getSettings().deviceId` and
  the track label with the selected device, expose that evidence in the UI,
  and fail closed on `devicechange`, `mute`, or `ended` until the headset is
  reselected.
- `deviceId` metadata proves the browser-selected source identifier, not by
  itself which physical microphone generated samples. A split-source physical
  test is still required.
- Android Chrome cannot be assumed to expose or select physical inputs the
  same way as desktop. Chromium's WebRTC Audio Device Module documents device
  enumeration/selection for desktop platforms only, and Android Bluetooth
  routing is managed below the web API. A 2024 Chromium Bluetooth-routing fix
  was reverted in 2025 in favor of `use_bt_sco_for_media`, so test the exact
  Android/Chrome versions.
- If Android Chrome exposes only a default input and cannot prove or retain the
  AirPods route, a strict in-app guarantee requires a small native Android
  wrapper using `AudioManager.setCommunicationDevice`; JavaScript cannot call
  that native API from a normal web page.
- Real-device QA should combine browser evidence with a split-source signal
  test: put a competing spoken code next to the Mac/phone while the AirPods
  wearer speaks a different code several metres away. The captured PCM must
  contain the headset code and reject/attenuate the built-in-mic code. Repeat
  after disconnect, reconnect, permission reset, and a cold browser start.
- On Android, capture `adb shell dumpsys audio` and
  `adb shell dumpsys media.audio_flinger` during recording as supplemental OS
  route evidence; output varies by device/version.

## Primary sources

- https://www.w3.org/TR/mediacapture-streams/
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/devicechange_event
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/selectAudioOutput
- https://webrtc.googlesource.com/src/+/HEAD/modules/audio_device/g3doc/audio_device_module.md
- https://chromium.googlesource.com/chromium/src/+/66c77cdee903944593f5ed97df5dc57e5c3b1d06%5E%21/
- https://developer.android.com/reference/android/media/AudioManager
- https://developer.android.com/tools/dumpsys
- https://source.android.com/docs/core/audio/debugging
