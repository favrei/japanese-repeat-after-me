# Sites deployment latency needs phase timing

Read-only Sites inspection showed versions 3–5 each stored an archive of about
121.6 MB and 1,232–1,235 files. The current local build/test gate takes about
6 seconds and packaging takes 4.6 seconds, so a multi-minute end-to-end delay
cannot be attributed to those local phases alone. Archive upload can explain
tens of seconds depending on upstream bandwidth, but the remaining likely
surface is remote version ingestion and the pending/building/publishing
deployment lifecycle.

The current Sites version and project reads expose archive size and current
project update state, but not historical phase timestamps or a deployment
history suitable for retrospective timing. On the next authorized deployment,
record separate wall-clock spans for build, package, source push,
`save_site_version`, initial deploy response, and each deployment status
transition. Do not change the product architecture until that evidence exists.

Security note: the Sites `get_site` structured response may include a Sign in
with ChatGPT bypass bearer token. Never print or persist the raw response; select
only nonsensitive fields when diagnosing this project. No token value was
written to the repository.
