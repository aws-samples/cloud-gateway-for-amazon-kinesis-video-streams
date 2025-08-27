    git commit path/to/file1.[ch]

This will pop up an editor where you can create your commit message. It should
look something like:

    exampledemux: fix seeking without index in push mode

    Without an index we would refuse to seek in push mode. Make
    seeking without an index work by estimating the position
    to seek to. It might not be 100% accurate, but better than
    nothing.

Then exit the editor, and you should have a commit.

Please make sure your commits are as terse and precise as possible. Do not
include 'clean-ups' or non-functional changes, since they distract from the
real changes and make things harder to review, and also lower the chances that
the patch will still apply cleanly to the latest version in git. If you feel
there are things to clean up, please submit the clean-ups as a separate patch
that does not contain any functional changes. See
[Writing Good Commit Messages](#writing-good-commit-messages) for more

---

