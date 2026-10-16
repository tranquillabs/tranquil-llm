<!-- For agents working on Tranquil's repos. Never shipped. -->

# GitHub CLI

`gh` is installed with Homebrew at `/opt/homebrew/bin/gh` and authenticated for the `tranquillabs`
organization (scopes `repo`, `workflow`, `gist`, `read:org`), so it can create repos and push.

It is not on the PATH of a non-interactive shell. Prepend Homebrew first:

```sh
export PATH="/opt/homebrew/bin:$PATH"
gh ...
```

If another tool seems missing, check `/opt/homebrew/bin` before concluding it isn't installed.

Creating a repo, pushing, or anything else visible outside the machine waits for an explicit
go-ahead (see [rules/git.md](../rules/git.md)). No pull requests for owned repos.
