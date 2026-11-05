# Prompt — Audit and slim down a Claude Code setup for token usage

Copy everything below the line into a Claude Code session started in the project (or home folder) you want to audit.

---

You are auditing my Claude Code configuration to reduce token usage **systematically, on every project on this
machine**, without lowering the quality of the work. Reply in my language. Work in two phases and **do not change
anything before I approve the plan**.

## Phase 1 — Measure (read-only)

Collect facts on this machine. Prefer cheap commands; do not read large files in full when a size or a heading list is
enough.

1. **Context loaded at every session start.** For the current folder and its parents, list every file Claude Code loads
   automatically and its size in characters and estimated tokens (≈ 4 chars/token in English, ≈ 3 for French or code):
   user and project instruction files, every `@`-imported file (follow imports recursively), rules without `paths:`,
   auto-memory `MEMORY.md`, output style. Flag anything above ~200 lines or ~3k tokens.
   - **Instruction files: `CLAUDE.md` and `AGENTS.md`.** Claude Code reads `AGENTS.md` as well as `CLAUDE.md`. Check
     the `instructionFiles` setting: with its default (`claude-md-or-agents-md`), a folder's `AGENTS.md` loads like a
     `CLAUDE.md` when that folder has no `CLAUDE.md`. Report which file actually loads in each folder, flag a stray
     (even empty) `CLAUDE.md` that shadows an `AGENTS.md`, and flag duplicated content between the two. The same
     size rules apply to both; every advice below about `CLAUDE.md` applies to `AGENTS.md` too.
2. **Settings.** Read `~/.claude/settings.json`, project `.claude/settings*.json`: model, effort level, `env`
   (`CLAUDE_CODE_SUBAGENT_MODEL`, `MAX_THINKING_TOKENS`, cache TTL variables), hooks, enabled plugins, status line,
   `idleCompaction`, prompt suggestions.
3. **Subagents and skills.** List `~/.claude/agents/` and project agents with their `model`, `omitClaudeMd` and the
   length of their `description` (descriptions load every session). Note whether `Explore` is overridden.
4. **MCP servers and plugins.** List configured servers and how many tools each exposes. Deferred tools still cost
   their names and server instructions in every request. Flag servers unused in recent work.
5. **Hooks and output filters** (RTK or others): what they cover (Bash only? built-in Read/Grep/Glob?) and their own
   statistics, if any.
6. **Usage data.** Ask me to run `/usage` (plan breakdown, prompt-cache line) and `/context`, and paste the result, or
   read them yourself if you can.

## Phase 2 — Report and plan

Produce a short report, ranked by **estimated saving per session**, each line with: finding, evidence (file, size,
command output), proposed change, estimated effect, risk. Then wait for my go.

Apply these principles, which come from measured evidence (see "Evidence" below), not vendor claims:

- **The biggest lever is usually the always-loaded context.** Keep each loaded `CLAUDE.md`/`AGENTS.md` under ~200
  lines. Write in it what the project is for and its non-obvious pitfalls, not what Claude can read in the code, not
  rules repeated elsewhere, not every case that might happen; prefer "match the surrounding code" to absolute bans that
  contradict each other. Move procedures (verification, review, release) to skills it references, and reference docs
  to files read on demand; replace long `@` imports with a short index plus "search with `rg`". Move content, never
  delete it silently.
- **Model first, then effort.** The model is the largest lever. `medium` effort is often the cheapest setting that still
  succeeds: `low` can cost more by taking several times more turns.
- **Cache discipline.** Pick model and effort at the start of a session; switching model (including `opusplan` toggles),
  fast mode, MCP/plugin changes or tool deny rules mid-session invalidates the cache. Use `/clear` between unrelated
  tasks, `/rewind` to abandon a path (reuses the cache), `/compact` at natural breaks only. A break longer than the
  cache TTL (5 min, or 1 h on subscriptions for the main conversation) re-bills the whole context.
- **Model routing.** Use the strongest model for design and coordination, a cheaper one for routine work. Set
  `CLAUDE_CODE_SUBAGENT_MODEL=haiku` (default, not forced) and override the built-in `Explore` agent with a user agent
  named `Explore` using `model: haiku` (on subscriptions it otherwise uses the Opus alias, and the built-in Explore
  ignores `CLAUDE_CODE_SUBAGENT_MODEL`). Set `omitClaudeMd: true` on subagents that don't need project rules (it skips
  the instruction files, `CLAUDE.md` or `AGENTS.md`). `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` imposes the model on every
  subagent, including ones that write code: mention it, don't apply it by default. A cheap model executes a precise
  plan well; it plans poorly on its own.
- **Subagents are not free.** Each starts a fresh context (system prompt, instruction files, delegation message), does
  not reuse the parent's cache and gets a 5-minute cache. Delegate high-volume work (logs, test output, broad searches),
  not small lookups: on a small bug fix, three subagents cost 2.6× a single session with no better result. Agent teams
  cost about 7× a single session.
- **Resume or restart.** Resuming after the cache has expired re-bills the whole context (measured 10× the cost of a
  resume within the hour). After a long break, start a fresh session or `/compact` before leaving.
- **Effort and thinking** are output tokens, the most expensive kind; lower effort for routine tasks.
- **MCP**: deferred tools cost about 15 tokens each per request — far less than a large instruction file. Disable
  servers you never use (large tool lists add up), enable servers per project, prefer CLIs (`gh`, cloud CLIs).
- **Watch the cache hit rate.** The `Prompt cache` line of `/usage` should stay high (≥ 90 %); a drop means something
  keeps changing the prefix.
- **Background usage**: idle compaction, prompt suggestions, `/loop` and scheduled tasks, goal check-ins resend the full
  context.
- **Judge any optimization by cost per successful task**, not by "tokens saved" counters, which usually compare against
  raw output that would never have entered the context (Claude Code already caps tool output) and ignore that most input
  is cheap cache reads. Check before/after with `/usage` on comparable work.

## Evidence (as of November 2026 — re-check if much later)

| Technique | Measured effect | Source |
| --- | --- | --- |
| Short CLAUDE.md, skills on demand, `/clear`, model choice, effort, MCP pruning | Official recommendations | code.claude.com/docs/en/costs |
| Cache behavior, TTLs, what invalidates the cache | Official | code.claude.com/docs/en/prompt-caching |
| Subagent model, `Explore` default model, `omitClaudeMd` | Official | code.claude.com/docs/en/sub-agents |
| "Caveman" terse-speech skill | −8.5 % output tokens on 82 agentic tasks, quality unchanged (advertised 65 % is chat prose); near-null in an arXiv study | JetBrains AI blog (2026-07); arXiv 2607.12161 |
| RTK (Bash output filter) | Bill −5 % to +17 % (Quesma), +7.6 % at low effort / 0 % at high effort (JetBrains). Covers Bash commands, including `grep`/`find` run through Bash, but not the built-in Read/Grep/Glob tools. Value depends on how much of your work goes through Bash | quesma.com; JetBrains AI blog (2026-07) |
| Tool-output compression in general | −38 % tool-output tokens gave +6.8 % cost (more turns, cache effects) | arXiv 2607.12161 "Token Reduction Is Not Cost Reduction" |
| jCodeMunch (symbol retrieval MCP) | ~80 % fewer tokens on single-symbol lookups (VirtusLab); ~5.7 % end-to-end in the project's own table; stale index, no call graph, commercial licence, telemetry | virtuslab.com; jcodemunch-mcp TOKEN_SAVINGS.md |
| Code intelligence (LSP) plugins for typed languages | Fewer file reads via go-to-definition (official recommendation) | code.claude.com/docs/en/costs |
| Settings changed one at a time on one bug fix (Claude Code 2.1.308, 8 hidden tests, 1–2 runs each) | `medium` effort cheapest passing; 3 subagents 2.6× (1.9× forced to Haiku); resume after cache expiry 10×; 700-word CLAUDE.md ≈ 1,600 tokens/request vs ≈ 15 tokens per MCP tool | devtoolpicks.com "What burns your Claude Code limit" |
| Lean instruction files, procedures in skills, short tool descriptions | Claude Code team: > 80 % of its own system prompt removed for current models with no measurable eval loss | claude.dev "The new rules of context engineering for Claude 5 generation models" |
| Cache as the first design constraint | Claude Code team monitors cache hit rate like uptime | claude.com/blog "Lessons from building Claude Code: prompt caching is everything" |
| Haiku executing vs planning | Matched Sonnet at 64 % lower cost when implementing a stronger model's plan; poor when planning itself (small sample) | dev.to "I tried an Opus orchestrator and killed it" |

Do not recommend a tool on its README numbers alone. When my setup already uses one of these tools, look at how it is
actually used here (for example, how many searches go through Bash) before judging it.

## Constraints

- Never print secrets (API keys, tokens, `.env` contents) found while reading settings.
- Back up every file before editing it, keep the user's content (move, don't delete), and list every changed file.
- After applying, tell me how to verify the effect (`/context` at session start, `/usage` after a few sessions).
