import assert from "node:assert/strict";
import test from "node:test";

import {
  chooseRememberedMicrophone,
  GameMicrophoneSession,
  inspectMicrophoneRoute,
  listAudioInputs,
  MicrophoneRouteError,
} from "../../client/recognition/microphone.ts";

class FakeAudioTrack extends EventTarget {
  label = "Peter's AirPods";
  readyState = "live";
  stopCalls = 0;

  getSettings() {
    return { deviceId: "airpods-id" };
  }

  stop() {
    this.stopCalls += 1;
    this.readyState = "ended";
  }
}

const inputs = [
  {
    deviceId: "default",
    groupId: "mac",
    kind: "audioinput",
    label: "",
  },
  {
    deviceId: "airpods-id",
    groupId: "airpods",
    kind: "audioinput",
    label: "Peter's AirPods",
  },
  {
    deviceId: "speaker-id",
    groupId: "speaker",
    kind: "audiooutput",
    label: "MacBook Speakers",
  },
];

test("lists only audio inputs with an honest default label", () => {
  assert.deepEqual(listAudioInputs(inputs), [
    {
      deviceId: "default",
      groupId: "mac",
      label: "System default microphone",
    },
    {
      deviceId: "airpods-id",
      groupId: "airpods",
      label: "Peter's AirPods",
    },
  ]);
});

test("restores a remembered microphone but does not guess among many", () => {
  const listed = listAudioInputs(inputs);
  assert.equal(
    chooseRememberedMicrophone(listed, "airpods-id")?.label,
    "Peter's AirPods",
  );
  assert.equal(chooseRememberedMicrophone(listed, "missing"), null);
  assert.equal(
    chooseRememberedMicrophone([listed[1]], null)?.deviceId,
    "airpods-id",
  );
});

test("reports an exact browser route match without claiming hardware QA", () => {
  assert.deepEqual(
    inspectMicrophoneRoute(
      { deviceId: "airpods-id", label: "Peter's AirPods" },
      "airpods-id",
      "Peter's AirPods",
    ),
    {
      activeDeviceId: "airpods-id",
      activeLabel: "Peter's AirPods",
      requestedDeviceId: "airpods-id",
      status: "matched",
    },
  );
});

test("keeps browser-default and missing settings explicitly unverified", () => {
  assert.equal(
    inspectMicrophoneRoute(
      { deviceId: "default", label: "System default microphone" },
      "built-in-id",
      "Built-in Microphone",
    ).status,
    "browser-default",
  );
  assert.equal(
    inspectMicrophoneRoute(
      { deviceId: "airpods-id", label: "Peter's AirPods" },
      undefined,
      "Peter's AirPods",
    ).status,
    "unverifiable",
  );
});

test("rejects silent fallback to a different browser device", () => {
  assert.throws(
    () =>
      inspectMicrophoneRoute(
        { deviceId: "airpods-id", label: "Peter's AirPods" },
        "built-in-id",
        "Built-in Microphone",
      ),
    (error) =>
      error instanceof MicrophoneRouteError &&
      error.code === "route-mismatch",
  );
});

test("keeps one microphone stream alive until the game session closes", () => {
  const track = new FakeAudioTrack();
  const stream = {
    getAudioTracks: () => [track],
    getTracks: () => [track],
  };
  let routeLostCalls = 0;
  const session = new GameMicrophoneSession(
    stream,
    { deviceId: "airpods-id", label: "Peter's AirPods" },
    {
      activeDeviceId: "airpods-id",
      activeLabel: "Peter's AirPods",
      requestedDeviceId: "airpods-id",
      status: "matched",
    },
    () => {
      routeLostCalls += 1;
    },
  );

  assert.equal(session.active, true);
  assert.equal(track.stopCalls, 0);

  track.dispatchEvent(new Event("mute"));
  track.dispatchEvent(new Event("ended"));
  assert.equal(routeLostCalls, 1);

  session.close();
  session.close();
  assert.equal(session.active, false);
  assert.equal(track.stopCalls, 1);
});
