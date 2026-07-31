class LocalVoiceCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = new Float32Array(4096);
    this.offset = 0;
    this.port.onmessage = (event) => {
      if (event.data?.type !== "flush") return;
      this.flush();
      this.port.postMessage({ type: "flushed" });
    };
  }

  flush() {
    if (this.offset === 0) return;
    const samples = this.buffer.slice(0, this.offset);
    this.port.postMessage({ type: "samples", samples }, [samples.buffer]);
    this.offset = 0;
  }

  process(inputs) {
    const samples = inputs[0]?.[0];
    if (!samples) return true;

    let sourceOffset = 0;
    while (sourceOffset < samples.length) {
      const remaining = this.buffer.length - this.offset;
      const count = Math.min(remaining, samples.length - sourceOffset);
      this.buffer.set(
        samples.subarray(sourceOffset, sourceOffset + count),
        this.offset,
      );
      this.offset += count;
      sourceOffset += count;
      if (this.offset === this.buffer.length) this.flush();
    }

    return true;
  }
}

registerProcessor("local-voice-capture", LocalVoiceCaptureProcessor);
