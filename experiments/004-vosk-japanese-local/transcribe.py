#!/usr/bin/env python3
import argparse
import json
import wave
from vosk import KaldiRecognizer, Model, SetLogLevel

parser = argparse.ArgumentParser()
parser.add_argument('--model', required=True)
parser.add_argument('--audio', required=True)
args = parser.parse_args()

SetLogLevel(-1)
with wave.open(args.audio, 'rb') as wav:
    if wav.getnchannels() != 1 or wav.getsampwidth() != 2:
        raise SystemExit('Expected mono 16-bit PCM WAV')
    recognizer = KaldiRecognizer(Model(args.model), wav.getframerate())
    recognizer.SetWords(True)
    partials = []
    while True:
        data = wav.readframes(4000)
        if not data:
            break
        if recognizer.AcceptWaveform(data):
            partials.append(json.loads(recognizer.Result()))
    partials.append(json.loads(recognizer.FinalResult()))

print(json.dumps({'audio': args.audio, 'sampleRate': wav.getframerate(), 'segments': partials}, ensure_ascii=False, indent=2))
