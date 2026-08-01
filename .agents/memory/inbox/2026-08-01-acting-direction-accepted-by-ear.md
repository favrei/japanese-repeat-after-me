# Acting direction accepted by ear (2026-08-01)

The user listened to the three-way delivery comparison and accepted the
feature. Verbatim: "it does changes, but not that dramatic. Still acceptable
though, I will take it."

This is a human listening verdict, not a measurement — it closes the QA gap
left open in [[2026-08-01-tts-manifest-acting-direction]], where the clips had
been generated but nobody had heard them.

What was auditioned: 「お決まりになりましたら、お呼びください。」, voice
`dylan`, seed 20261733 pinned across all three so direction was the only
variable.

1. undirected (ships today)
2. "Speak quickly, as if busy behind the counter."
3. "Speak gently and unhurriedly, with a small pause before the final phrase."

The user's ear agrees with the measurement in
[[2026-08-01-tts-speed-field-is-a-noop]]: direction is audible but subtle
(~2% shorter for fast, ~5% longer for slow+gentle). Expectations for future
work should be set accordingly — `instruct` buys tone and feel, not a
dramatically rushed or drawn-out read. Do not promise more than that.

Caveat on the verdict's scope: the user commented on degree of change and
acceptability. They did NOT explicitly say whether they heard breaths or other
non-verbal artifacts, which was the specific disqualifying risk flagged in the
tool README. Treat breath QA as untested rather than passed, and keep checking
it per clip as directions roll out.

Status: mechanism built, verified backward compatible, and now accepted. No
shipped manifest carries direction yet, so the app still sounds unchanged.
Writing directions for the taproom and café lines is the open next step and had
not been started as of this note.
