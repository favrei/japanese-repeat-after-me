# Stage redesign — Qwen3 audio runaway

- The first full generation attempt was stopped after two pathological outputs:
  `いらっしゃいませ。` rendered as 17.04 seconds and
  `お決まりになりましたら、お呼びください。` reached the 1,024-token cap.
- The first three files may have been overwritten before the interruption; no
  batch metadata was written.
- Conclusion: a successful generation process is not an audio-quality gate.
  The authoring tool needs a short-line duration ceiling, a smaller token cap,
  retry seeds, and final listening QA.
