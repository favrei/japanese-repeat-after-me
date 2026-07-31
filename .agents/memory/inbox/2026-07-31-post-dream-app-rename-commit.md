# Application rename committed after dreaming

- Nested `app/` commit `dd38928` (`Rename application identifiers`) records the
  package, service-worker cache, test, README, and TTS-tool naming cleanup.
- The application directory move itself is represented by the outer workspace
  references and ignore rule because a nested repository does not version its
  containing directory name.
- `app/` has no configured Git remote, so commit `dd38928` cannot be pushed
  until the user chooses a remote for the nested repository.
