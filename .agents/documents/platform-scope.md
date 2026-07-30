# Platform Scope

## Development environment

The current development machine is a MacBook with Apple M3.

The project should remain compatible with a standard TypeScript and web-development workflow on macOS. Platform-specific native tooling is not required for the first version.

## Hosting

The intended hosting target is GPT Sites.

The application should therefore be designed as a static or mostly static web application unless GPT Sites later provides a required backend capability. Recognition, scoring, lesson storage, and progress tracking should run in the browser wherever practical.

Hosting assumptions should be verified before implementation, especially:

- static asset size limits
- support for large model files
- cache-control behavior
- MIME types for WebAssembly and model files
- cross-origin isolation headers
- service-worker support
- deployment update behavior

## Primary target platforms

### macOS with Chrome

This is the primary development and validation environment.

Expected capabilities include:

- microphone access
- AudioWorklet
- Web Workers
- WebAssembly
- IndexedDB and OPFS
- service workers
- PWA installation
- WebGPU on supported Chrome and hardware configurations

The first performance baseline should be measured on the M3 MacBook, but the application should not assume Apple Silicon performance is representative of mobile devices.

### Android with Chrome

Android Chrome is a primary runtime target.

Important constraints include:

- lower and more variable memory limits
- thermal throttling
- slower model download and initialization
- microphone interruptions
- device-dependent sample rates
- aggressive browser-tab suspension
- limited background execution
- storage eviction

The application should remain usable with a WASM CPU path. WebGPU may be used as an optimization but should not be the only supported execution path.

## Optional target platforms

### Linux AMD64 with Chrome

Linux AMD64 should require little application-specific work if the browser path is standards-compliant.

Compatibility should still be tested for:

- microphone permissions and audio devices
- installed Japanese system voices
- WebGPU availability and drivers
- PWA installation behavior
- local storage quotas

Linux support should not require a native desktop package during the scoping stage.

### iOS with Chrome or installed PWA

This is an optional, separately validated target.

Chrome on iOS should not be assumed to behave like desktop or Android Chrome. Browser-engine restrictions and platform lifecycle behavior can affect:

- WebAssembly performance
- WebGPU availability
- AudioWorklet behavior
- microphone capture
- service workers
- persistent storage
- model caching
- memory limits
- PWA installation and updates

The application should degrade gracefully if local recognition is not practical on a particular iOS device. Possible fallback behavior includes simpler acoustic checks or an explicitly optional remote scorer, but no remote dependency is assumed in the current scope.

## PWA expectations

The application should support:

- installation from Chrome where available
- offline lesson access after initial download
- local progress storage
- cached recognition model files
- an explicit model-download screen
- recovery when cached models are removed by the browser
- clear microphone permission handling

The recognition model should not be bundled into the initial JavaScript payload. It should be downloaded separately and cached after the user chooses to enable local recognition.

## Runtime capability tiers

A capability-based design is preferable to relying only on device names.

### Tier A: enhanced local runtime

- WebGPU available
- sufficient memory and storage
- full local recognizer
- acoustic alignment and visualization

### Tier B: standard local runtime

- WebAssembly available
- sufficient memory for the small model
- local recognizer with reduced concurrency or slower evaluation

### Tier C: limited local runtime

- insufficient resources for the recognizer
- basic recording, signal quality, timing, and reference comparison
- no claim of detailed pronunciation diagnosis

The application should detect capabilities at runtime and communicate the selected mode clearly.
