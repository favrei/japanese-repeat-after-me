# Application Git history flattened into the root repository

- The user confirmed that voice-data separation does not require a second Git
  repository and approved complete flattening.
- Inner `app/` head `dd38928` was imported under root path `app/` as the second
  parent of the flattening merge. The imported subtree and inner repository
  both resolved to exact tree `9ceda452a4273f433798fbc5a06a5c52f49dad9c`
  with 101 tracked files.
- Root `.gitignore` no longer ignores `/app/`. The nested `app/.git` directory
  was moved, not deleted, to the temporary recovery directory
  `/tmp/japanese-repeat-after-me-flatten.g5Dfv4/app.git`.
- A verified complete bundle containing all 10 inner branches is at
  `/tmp/japanese-repeat-after-me-flatten.g5Dfv4/app-history.bundle`, SHA-256
  `ba36adaf97a59c2e5d15d160bf32b22d2ce3412078649ffb10bb1e85612a1f41`.
- Ignored local build output, dependencies, Vosk model files, local Wrangler
  state, and the TTS environment remained in place and untracked.
- After the flattening commit is pushed, the root GitHub repository is the one
  source of truth for application, experiments, documents, and memory.
