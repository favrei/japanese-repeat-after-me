# Initial-commit parent query failure

- A diagnostic `git show d0bd4bd^..d0bd4bd` failed because `d0bd4bd` is the
  root commit of the nested application repository and therefore has no parent.
- The ordinary `git show d0bd4bd` output succeeded and supplied the required
  timestamp, commit message, and initial file inventory. No state changed.
