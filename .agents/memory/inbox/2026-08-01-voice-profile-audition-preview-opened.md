# Voice-profile audition page verified and opened

The existing VoiceDesign audition contains 20 profile anchors, all saying
「今日はいい天気ですね。」. Every referenced WAV existed and passed
`ffprobe`; the page returned 20 audio controls and the Ao sample returned HTTP
200 through the local preview at `http://localhost:4179/audition.html`. The
page was opened in the user's default browser, and the preview server was left
running intentionally for listening.
