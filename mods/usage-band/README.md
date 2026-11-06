# usage-band

A Claude Code mod that draws a colored status band above the prompt:

```
Opus 5.5 · medium │ ctx ■■■■■■■■■■ 120k/1M 12% │ 7j ■■■■□□□□■■ 45% ↻ 3j12h →90%
```

- **Model and effort** of the current conversation. A `/model` or `/effort` change shows on the next turn.
- **Context**: tokens used, window size and percentage.
- **Weekly usage**: filled cells show usage, `□` cells show the projected landing, and `↻` counts down to the reset.
- **Landing** (`→NN%`): usage expected at reset if the average pace holds. Green under 80%, yellow from 80% to 99%,
  red from 100%. Elapsed time is floored at 10% of the window, because the first hours say little. The projection is
  linear, so it counts nights and days off, and it reads high midweek.

The band refreshes on each turn and every minute. Below 92 columns it stacks on two rows. `Ctrl+X Ctrl+A` collapses it.
Colors are tuned for a dark theme. It needs a claude.ai subscription for the weekly figures, and Claude Code 2.1.299 or
later.

The band sits above the prompt: a mod cannot set `statusLine`. To avoid a duplicate, remove `statusLine` from your
settings if it shows the same figures.

## Install

At the prompt of a terminal session:

```
/plugin install usage-band --marketplace cyberbobjr/claude-code-best-skills
```

Answer `y` to add the marketplace, then choose a scope. From a shell:

```bash
claude plugin install usage-band --marketplace cyberbobjr/claude-code-best-skills
```

## Develop

```bash
claude plugin validate mods/usage-band
claude plugin test mods/usage-band
```
