# Temporary release cleanup command rejected

After Sites version 6 was saved, the command runner rejected an exact-path
`rm -f` cleanup even though the temporary directory had been validated and
contained only `site.tar.gz`. Cleanup succeeded by using exact-file `unlink`
followed by `rmdir` instead.
