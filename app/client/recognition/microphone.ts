export const SAVED_MICROPHONE_KEY =
  "japanese-conversation-selected-microphone";

export type MicrophoneInput = {
  deviceId: string;
  groupId: string;
  label: string;
};

export type MicrophoneSelection = Pick<
  MicrophoneInput,
  "deviceId" | "label"
>;

export type MicrophoneRouteEvidence = {
  activeDeviceId: string;
  activeLabel: string;
  requestedDeviceId: string;
  status: "browser-default" | "matched" | "unverifiable";
};

/**
 * How long a track may sit muted before it counts as a lost route.
 *
 * `muted` is the spec's "the source cannot deliver data right now" flag, and a
 * microphone raises it both when the route really dies and while it is still
 * warming up — a Bluetooth headset renegotiating to its capture profile can
 * stay muted for the better part of a second. Treating the first `mute` as a
 * lost route killed sessions that were only starting; only a mute that never
 * recovers is a real loss.
 */
const MUTE_GRACE_MS = 1500;

/** Ceiling on waiting for a warming microphone before recording anyway. */
export const MICROPHONE_READY_TIMEOUT_MS = 2000;

export class GameMicrophoneSession {
  private closed = false;
  private muteTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly onRouteLost: () => void;
  private routeLost = false;
  public readonly route: MicrophoneRouteEvidence;
  public readonly selection: MicrophoneSelection;
  public readonly stream: MediaStream;
  public readonly track: MediaStreamTrack;

  constructor(
    stream: MediaStream,
    selection: MicrophoneSelection,
    route: MicrophoneRouteEvidence,
    onRouteLost: () => void,
  ) {
    this.stream = stream;
    this.selection = selection;
    this.route = route;
    this.onRouteLost = onRouteLost;
    const track = stream.getAudioTracks()[0];
    if (!track) {
      for (const streamTrack of stream.getTracks()) streamTrack.stop();
      throw new MicrophoneRouteError(
        "no-input",
        "Chrome returned no microphone track",
      );
    }

    this.track = track;
    this.track.addEventListener("mute", this.handleMuted);
    this.track.addEventListener("unmute", this.handleUnmuted);
    this.track.addEventListener("ended", this.handleRouteLost);
  }

  get active() {
    return !this.closed && this.track.readyState === "live";
  }

  /** The track is live and the source says it can deliver audio right now. */
  get ready() {
    return this.active && !this.track.muted;
  }

  /**
   * Resolves once the source reports it can deliver audio, or `false` when the
   * device never says so. Status-driven, with the timeout only as a ceiling so
   * a device that never reports cannot hang the turn.
   */
  waitUntilReady(timeoutMs = MICROPHONE_READY_TIMEOUT_MS) {
    if (this.ready) return Promise.resolve(true);
    if (!this.active) return Promise.resolve(false);

    return new Promise<boolean>((resolve) => {
      const settle = (ready: boolean) => {
        clearTimeout(timer);
        this.track.removeEventListener("unmute", handleUnmute);
        this.track.removeEventListener("ended", handleEnded);
        resolve(ready);
      };
      const handleUnmute = () => settle(this.ready);
      const handleEnded = () => settle(false);
      const timer = setTimeout(() => settle(this.ready), timeoutMs);

      this.track.addEventListener("unmute", handleUnmute);
      this.track.addEventListener("ended", handleEnded);
    });
  }

  private readonly handleMuted = () => {
    if (this.closed || this.routeLost || this.muteTimer !== null) return;
    this.muteTimer = setTimeout(() => {
      this.muteTimer = null;
      if (this.track.muted) this.handleRouteLost();
    }, MUTE_GRACE_MS);
  };

  private readonly handleUnmuted = () => {
    this.clearMuteTimer();
  };

  private readonly handleRouteLost = () => {
    if (this.closed || this.routeLost) return;
    this.clearMuteTimer();
    this.routeLost = true;
    this.onRouteLost();
  };

  private clearMuteTimer() {
    if (this.muteTimer === null) return;
    clearTimeout(this.muteTimer);
    this.muteTimer = null;
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    this.clearMuteTimer();
    this.track.removeEventListener("mute", this.handleMuted);
    this.track.removeEventListener("unmute", this.handleUnmuted);
    this.track.removeEventListener("ended", this.handleRouteLost);
    for (const streamTrack of this.stream.getTracks()) streamTrack.stop();
  }
}

export class MicrophoneRouteError extends Error {
  public readonly code: "no-input" | "route-mismatch";

  constructor(
    code: "no-input" | "route-mismatch",
    message: string,
  ) {
    super(message);
    this.name = "MicrophoneRouteError";
    this.code = code;
  }
}

export function listAudioInputs(
  devices: readonly Pick<
    MediaDeviceInfo,
    "deviceId" | "groupId" | "kind" | "label"
  >[],
): MicrophoneInput[] {
  return devices
    .filter((device) => device.kind === "audioinput")
    .map((device, index) => ({
      deviceId: device.deviceId,
      groupId: device.groupId,
      label:
        device.label.trim() ||
        (device.deviceId === "default"
          ? "System default microphone"
          : `Microphone ${index + 1}`),
    }));
}

export function chooseRememberedMicrophone(
  inputs: readonly MicrophoneInput[],
  rememberedDeviceId: string | null,
) {
  const remembered = inputs.find(
    (input) => input.deviceId === rememberedDeviceId,
  );
  if (remembered) return remembered;
  return inputs.length === 1 ? inputs[0] : null;
}

export function inspectMicrophoneRoute(
  selection: MicrophoneSelection,
  activeDeviceId: string | undefined,
  activeLabel: string,
): MicrophoneRouteEvidence {
  const normalizedActiveId = activeDeviceId ?? "";

  if (selection.deviceId === "default") {
    return {
      activeDeviceId: normalizedActiveId,
      activeLabel,
      requestedDeviceId: selection.deviceId,
      status: "browser-default",
    };
  }

  if (!normalizedActiveId) {
    return {
      activeDeviceId: "",
      activeLabel,
      requestedDeviceId: selection.deviceId,
      status: "unverifiable",
    };
  }

  if (normalizedActiveId !== selection.deviceId) {
    throw new MicrophoneRouteError(
      "route-mismatch",
      "Chrome did not retain the selected microphone",
    );
  }

  return {
    activeDeviceId: normalizedActiveId,
    activeLabel,
    requestedDeviceId: selection.deviceId,
    status: "matched",
  };
}

export async function discoverMicrophones() {
  if (
    !navigator.mediaDevices?.getUserMedia ||
    !navigator.mediaDevices.enumerateDevices
  ) {
    throw new MicrophoneRouteError(
      "no-input",
      "This browser cannot enumerate microphones",
    );
  }

  const permissionStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

  try {
    const inputs = listAudioInputs(
      await navigator.mediaDevices.enumerateDevices(),
    );
    if (inputs.length === 0) {
      throw new MicrophoneRouteError(
        "no-input",
        "No microphone input is available",
      );
    }
    return inputs;
  } finally {
    for (const track of permissionStream.getTracks()) track.stop();
  }
}

export async function openSelectedMicrophone(
  selection: MicrophoneSelection,
) {
  const microphone = await navigator.mediaDevices.getUserMedia({
    audio: {
      autoGainControl: true,
      channelCount: 1,
      deviceId: { exact: selection.deviceId },
      echoCancellation: true,
      noiseSuppression: true,
    },
    video: false,
  });
  const track = microphone.getAudioTracks()[0];

  if (!track) {
    for (const streamTrack of microphone.getTracks()) streamTrack.stop();
    throw new MicrophoneRouteError(
      "no-input",
      "Chrome returned no microphone track",
    );
  }

  try {
    return {
      evidence: inspectMicrophoneRoute(
        selection,
        track.getSettings().deviceId,
        track.label || selection.label,
      ),
      microphone,
      track,
    };
  } catch (error) {
    for (const streamTrack of microphone.getTracks()) streamTrack.stop();
    throw error;
  }
}

export async function openGameMicrophone(
  selection: MicrophoneSelection,
  onRouteLost: () => void,
) {
  const { evidence, microphone } = await openSelectedMicrophone(selection);

  try {
    return new GameMicrophoneSession(
      microphone,
      selection,
      evidence,
      onRouteLost,
    );
  } catch (error) {
    for (const track of microphone.getTracks()) track.stop();
    throw error;
  }
}
