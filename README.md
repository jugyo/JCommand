# JCommand

VSCode Extension to run and manage shell commands

## Commands

- `JCommand: Run` runs command you select
- `JCommand: Edit` opens `~/.vscode/jcommand.json` that contains all commands

Example of `~/.vscode/jcommand.json`:

```json
[
  "yarn mocha -r ts-node/register %f",
  "spring rspec %f",
  "npm run %s",
  "gh browse %f:%ls-%le --branch `git symbolic-ref --short HEAD # Browse on GitHub`
]
```

`%` will be replace with the active file path or empty string when no active file
