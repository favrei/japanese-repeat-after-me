# Diverged application safety snapshots preserved as archive tags

- Two nested-repository safety branches were not ancestors of its `main`.
  Their unique WIP snapshot commits are retained in the unified root repository
  as annotated tags rather than as another Git repository:
  - `archive/app/pre-story-selection-main-20260731` -> `06b5291`
  - `archive/app/pre-tts-merge-ui-20260730` -> `9f4e9bb`
- All other imported branch tips are ancestors of app head `dd38928` and are
  therefore preserved through the flattening merge parent.
