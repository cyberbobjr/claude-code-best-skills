# sky-band

A Claude Code mod that draws a small sky above the prompt, two rows high, which follows the time of day.

- **Sky**: blue by day, with sunrise and sunset colors, and dark at night.
- **Sun and moon**: each one rises on the left, peaks, and sets on the right.
- **Stars**: at night, a few faint stars, plus one bright star for each commit made today in the current repository.

The sky refreshes every minute. It reads the local time zone with `date` and counts commits with `git rev-list`. It draws
only in a terminal, and needs Claude Code 2.1.318 or later (the version it was built on).

## Install

At the prompt of a terminal session:

```
/plugin install sky-band --marketplace cyberbobjr/claude-code-best-skills
```

Answer `y` to add the marketplace, then choose a scope. From a shell:

```bash
claude plugin install sky-band --marketplace cyberbobjr/claude-code-best-skills
```

## Develop

```bash
claude plugin validate mods/sky-band
claude plugin test mods/sky-band
```
