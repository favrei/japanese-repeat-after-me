# Experiment 002: Browser Microphone Capture

## Question

Can Chrome acquire microphone input and expose stable PCM frames suitable for local scoring?

## Status in the execution container

**Blocked before microphone acquisition.** Headless Chromium navigation was rejected by administrator policy in this environment. Therefore, no microphone or AudioWorklet result is claimed.

## Replay on macOS

From this directory:

```bash
python3 -m http.server 8765
```

Open `http://localhost:8765` in Chrome, grant microphone permission, speak for several seconds, and record:

- permission result;
- input sample rate;
- frame count;
- captured duration;
- RMS range;
- whether playback and recording can alternate repeatedly.

A proper interactive page should be added before this experiment is considered complete. This entry is retained to document that headless/container microphone testing is not representative of the target MacBook and Android environments.

## Recorded failure

```text
Attempt: launch headless Chromium against a local experiment page
Environment: Linux execution container
Result: navigation blocked by administrator policy; browser process did not complete normally
Consequence: getUserMedia and AudioWorklet were not tested
```
