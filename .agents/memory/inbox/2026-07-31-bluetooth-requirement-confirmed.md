# Bluetooth capture requirement confirmed

- The existing platform and recognition cells agree on the requirement.
- macOS Chrome and Android Chrome must capture from a connected Bluetooth
  headset microphone, with AirPods as the primary acceptance device.
- QA must prove the selected input identity and recorded signal. Permission or
  a non-empty recording is insufficient, and silent fallback to a built-in
  microphone is a release failure.
- Reconnect, interruption, and route-change behavior remain unverified.
