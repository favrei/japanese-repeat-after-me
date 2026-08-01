# Peter confirmed the opening audio is fixed on his hardware

After the output-route settle landed
([[2026-08-01-output-route-settle-before-story]]): "ok, better now."

This is the first **real-hardware** confirmation in this thread — everything
before it was Chrome with fake audio devices. It says the two changes were the
right ones: attaching the output device before the microphone opens, and
holding the story until `AudioContext.currentTime` is advancing and
`outputLatency` has stopped moving.

Read it as "the broken voice at the start is gone", not as a full AirPods pass.
Nobody has yet checked reconnects, route changes mid-stage, or teardown, and
the standing platform gate still wants those proven on macOS and Android.
