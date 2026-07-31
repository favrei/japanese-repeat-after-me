# Ignored-asset validation shell failure

- A read-only ignored-asset validation used `path` as a zsh loop variable.
  In zsh, that variable is tied to `PATH`, so subsequent `git` invocations in
  the loop failed with `command not found` and produced invalid status labels.
- No repository state changed. The check was rerun with a non-special variable
  name and an explicit Git executable path.
