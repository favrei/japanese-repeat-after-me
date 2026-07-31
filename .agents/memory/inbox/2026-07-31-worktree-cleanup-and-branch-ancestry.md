# Worktree cleanup and branch ancestry

Date: 2026-07-31

- Removed the clean merged worktree
  `/Users/peter/workspaces/japanese-repeat-after-me-tts` with
  `git worktree remove`. Its branch `tts/qwen3-metal` remains at `ad3a356`,
  exactly equal to app `main`, so history is still recoverable.
- The remaining non-main worktrees are clean and their commits are genuinely
  absent from app `main`; `git cherry main <branch>` marked every branch commit
  `+`, so none is merely patch-equivalent under a different hash.
- `design/art-pack-system` is two commits ahead of `main`: `51cbcdb`,
  `e37d5c4`.
- `design/scene-transitions` is the same chain plus `6e6b83c`.
- `feature/story-selection` is the same chain plus `7a0f812`. Merging this
  branch includes the art-system and transition work, after which all three
  corresponding worktrees can be removed.
- `recognition/vosk-local-first` diverged from `d0bd4bd`: recognition has
  unique commit `18fcf55`, while `main` has unique commit `ad3a356`. It needs a
  separate rebase or merge decision and is not included in the story-selection
  chain.
- App `main` still has uncommitted changes; protect and reconcile them before
  advancing `main`.
