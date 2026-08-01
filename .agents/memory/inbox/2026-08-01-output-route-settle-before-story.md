# The opening voice broke because the *output* route moved twice

Peter, after the first preflight landed: "I still feel the voice at the
beginning... why is it silent, or unstable at the beginning?"

The first gate waited on the wrong half. `waitUntilReady()` reads
`MediaStreamTrack.muted` — that is the **capture** side saying it can deliver
audio. It says nothing about the speaker. Worse, the ordering guaranteed a
second disturbance: `prewarmRecognitionAudio()` ran *after* the microphone
opened, and creating that `AudioContext` is what attaches the output device.
So the route moved twice — once when capture started, once when the graph
grabbed the speaker — and the second landed directly under the first line.

On a Bluetooth headset the first move is also the expensive one: opening a
microphone forces the headset out of its playback-only profile into the
two-way headset profile, and the output is muted or garbled while that
renegotiates. The input can report ready before the output has finished.

Fixes, both status-driven:

- `runMicrophonePreflight` now prewarms the audio graph **before**
  `configureMicrophone`, so the output device is already attached and the
  headset makes one switch, not two.
- New `settleRecognitionOutput()` in `client/recognition/localVosk.ts` waits on
  two real signals, not a counter: `AudioContext.currentTime` must be
  advancing (the clock only moves while the device actually renders) and
  `AudioContext.outputLatency` must hold still (it changes the moment the
  route underneath changes). Three consecutive quiet 100 ms samples release
  the story; `OUTPUT_SETTLE_TIMEOUT_MS` = 4 s is only a ceiling.
- The preflight card names what it is waiting on
  (`data-testid="preflight-step"`): attaching the output device, opening the
  microphone, waiting for the route to hold still.

Traced in Chrome with fake devices: `AudioContext` at t=1103 ms, `getUserMedia`
at 1160 ms, and after a device was chosen the settle ran 6245 → 7102 ms — about
860 ms against a 300 ms floor, so it really did observe an unsteady route and
keep waiting. First narration at 7114 ms. `outputLatency` there was 181 ms.

Still unverified on actual AirPods, which is the only case that matters.
