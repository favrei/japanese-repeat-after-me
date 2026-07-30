# Future Local Training and Quantization

## User direction

- In a future phase, train or fine-tune the relevant speech models locally on
  the Apple M3 MacBook.
- Use Metal acceleration rather than assuming cloud training.
- Quantize the trained models for efficient local deployment.
- Treat the recovered private voice recordings as a potential training or
  evaluation input only after their contents, labels, consent, and retention
  rules are understood.

## Current boundary

- This is a future direction, not an approved model architecture or an
  immediate implementation task.
- The training framework remains open. Candidate M3 paths such as MLX or
  PyTorch MPS require evidence before selection.
- Preserve an unquantized baseline and compare quality, size, initialization
  time, latency, memory, and battery/thermal behavior after quantization.
- Quantization must not silently reduce acceptance quality or localized
  feedback reliability.

## Deployment direction

- Deploy a local-first PWA to GPT Sites.
- Keep private recordings and training-only artifacts out of the deployed
  package.
- Ship the application separately from the model. Download a versioned,
  quantized model only after the user enables local recognition, then cache it
  for offline reuse.
- Keep a verified WASM CPU path as the compatibility baseline. Use WebGPU as an
  optional acceleration path selected through runtime capability detection.
- Validate the packaged model and browser runtime on macOS Chrome first, then
  representative Android Chrome devices.
- Treat MLX or PyTorch MPS as candidate M3 training paths and an
  ONNX/WebGPU/WASM-compatible artifact as a candidate deployment path. Do not
  fix these choices until model conversion, operator support, quality, size,
  initialization, latency, memory, and thermal evidence are available.

## Device deployment gate

- Before fixing the production runtime, publish a temporary private benchmark
  site that can be opened on every device in the target lineup.
- Let the tester enter a clear device label rather than infer identity from the
  user agent alone.
- Always run a WASM CPU correctness and performance test.
- When WebGPU is available, run an equivalent WebGPU compute test and compare
  correctness and timing with the WASM path.
- Record browser/device capability details, timing distributions, correctness,
  selected adapter features and limits, and failures server-side.
- Provide an exportable comparison across macOS, Android, Linux, and iOS
  devices.
- Do not deploy private recordings, training data, or model weights in this
  temporary capability test.

## Open decisions

- Which model and training objective should be adapted?
- Are the recordings sufficient and appropriately labeled for training, or
  only for evaluation?
- Which train/validation/test split and human reference labels are required?
- Which quantization format and precision fit the eventual browser/WASM,
  WebGPU, MLX, or native runtime?
- What licenses and redistribution limits apply to the base model, derived
  weights, and private recordings?
