# Archive-tag display pattern failure

- The archive-tag creation command ended nonzero after both tags were created
  because `git show-ref` did not interpret `refs/tags/archive/app/*` as a glob.
- The tags and their peeled target commits were subsequently verified with
  exact tag names. No corrective repository mutation was needed.
