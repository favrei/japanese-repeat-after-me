# Current Vosk model storage path

The Vosk model is not stored in Sites R2. Locally, the ignored
`app/public/models/` directory contains the 49,654,706-byte full tar archive,
six production chunks totaling the same bytes, and their manifest. The build
explicitly removes the full archive because it exceeds the Sites per-file
limit, but copies the six chunks and manifest into `dist/client/models/`.
Those approximately 47.4 MiB are therefore included in every Sites deployment
archive.

At runtime, `localVosk.ts` requests the logical same-origin tar URL. The service
worker intercepts it, fetches the six static chunks, streams them as one gzip
response, and retains them in browser Cache Storage. The configured `PACKS` R2
binding currently serves only `/packs/...` objects and has no model object or
model route.
