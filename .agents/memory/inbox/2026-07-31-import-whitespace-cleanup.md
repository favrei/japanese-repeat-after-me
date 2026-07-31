# Imported prompt-template whitespace cleanup

- Root `git diff --check` exposed a pre-existing trailing blank line in the
  inner repository's `art-system/PROMPT_TEMPLATE.md` because the file is new to
  the outer tree.
- The trailing blank line was removed during flattening. This is the only
  tracked application-file content delta from imported inner head `dd38928`;
  application behavior is unchanged.
