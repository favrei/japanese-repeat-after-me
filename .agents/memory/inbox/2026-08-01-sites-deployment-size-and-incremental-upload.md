# Sites deployment size and incremental upload

Measured the current fresh `app/dist/` and packaged it with the installed Sites
hosting helper. The tar.gz is 136,612,405 bytes (about 130.3 MiB), and packaging
took 4.6 seconds. Major uncompressed payload groups are about 48.8 MiB of art,
47.4 MiB of split Vosk model parts, 29.7 MiB across 1,157 WOFF/WOFF2 font files,
5.5 MiB of Vosk browser JavaScript, and 1.7 MiB of audio.

Current official Sites documentation describes immutable saved versions followed
by deployment of a selected version. The installed `save_site_version` connector
accepts one complete tar archive and exposes no changed-file or delta-upload
input. No documented incremental artifact upload was found as of 2026-08-01.
Git source pushes can be incremental, and an already saved version can be
redeployed without rebuilding or reuploading it, but changed code that needs a
new Sites version currently uses a complete deployment archive.

The practical speed path is artifact reduction or moving stable large assets to
versioned object storage: first remove redundant WOFF fallbacks or subset fonts,
then compress art with visual QA, and consider hosting the Vosk model once in
R2 or another stable origin while retaining service-worker caching.

The first inbox-note patch attempt was malformed because one added line lacked
its patch prefix; `apply_patch` rejected it without changing any file, and this
retry succeeded.
