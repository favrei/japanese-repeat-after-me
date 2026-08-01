# Voice-profile audition preview hit a sandbox-only `uv` failure

Starting the existing 20-profile audition page with
`uv run python3 -m http.server 4179 --bind localhost` failed inside the
workspace sandbox because `uv` could not read
`/Users/peter/.cache/uv/sdists-v9/.git`. The audition HTML itself and all 20
referenced WAV files had already passed existence and `ffprobe` checks. This
was an execution-permission failure, not an audio-generation or page failure.
