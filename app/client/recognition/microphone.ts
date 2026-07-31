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
