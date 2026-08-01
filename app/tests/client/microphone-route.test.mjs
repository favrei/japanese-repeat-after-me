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
  muted = false;
  readyState = "live";
  stopCalls = 0;

  getSettings() {
    return { deviceId: "airpods-id" };
  }

  stop() {
    this.stopCalls += 1;
    this.readyState = "ended";
  }

  setMuted(muted) {
    this.muted = muted;
    this.dispatchEvent(new Event(muted ? "mute" : "unmute"));
  }
}

function openSession(track, onRouteLost = () => {}) {
  return new GameMicrophoneSession(
    {
      getAudioTracks: () => [track],
      getTracks: () => [track],
    },
    { deviceId: "airpods-id", label: "Peter's AirPods" },
    {
      activeDeviceId: "airpods-id",
      activeLabel: "Peter's AirPods",
      requestedDeviceId: "airpods-id",
      status: "matched",
    },
    onRouteLost,
  );
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
  let routeLostCalls = 0;
  const session = openSession(track, () => {
    routeLostCalls += 1;
  });

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

test("treats a recovered mute as warm-up, not a lost route", async () => {
  const track = new FakeAudioTrack();
  let routeLostCalls = 0;
  const session = openSession(track, () => {
    routeLostCalls += 1;
  });

  track.setMuted(true);
  assert.equal(session.ready, false);

  const ready = session.waitUntilReady(1000);
  track.setMuted(false);

  assert.equal(await ready, true);
  assert.equal(session.ready, true);
  assert.equal(routeLostCalls, 0);
  session.close();
});

test("stops waiting for a microphone that never reports it can capture", async () => {
  const track = new FakeAudioTrack();
  const session = openSession(track);

  track.setMuted(true);
  assert.equal(await session.waitUntilReady(10), false);
  session.close();
});
