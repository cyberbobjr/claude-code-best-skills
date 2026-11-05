---
name: audit-tokens
description: Audit a Claude Code setup to cut token usage on every project of the machine without lowering quality — measure what loads at each session (CLAUDE.md / AGENTS.md and @-imports, memory, MCP servers, subagents, skills, hooks, model and effort, cache), rank fixes by saving per session with evidence, apply only after approval. Use for « optimise mes tokens », « réduire la consommation de Claude Code », « audit de configuration Claude Code », "reduce token usage", "Claude Code costs", "context too big", "/usage looks high".
---

# Audit tokens — slim down a Claude Code setup

Audit the user's Claude Code configuration to reduce token usage **systematically, on every project on this
machine**, without lowering the quality of the work. Reply in the user's language. Work in two phases and **do not
change anything before the user approves the plan**.

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
   - **Across projects**: when the user has several projects, compare their instruction files. A rule repeated in all of
     them belongs in the user-level file (`~/.claude/CLAUDE.md`, and `~/.codex/AGENTS.md` for Codex); a procedure
     repeated in several belongs in a shared skill under `~/.claude/skills/`.
2. **Settings.** Read `~/.claude/settings.json`, project `.claude/settings*.json`: model, effort level, `env`
   (`CLAUDE_CODE_SUBAGENT_MODEL`, `MAX_THINKING_TOKENS`, cache TTL variables), hooks, enabled plugins, status line,
   `idleCompaction`, prompt suggestions.
3. **Subagents and skills.** List `~/.claude/agents/` and project agents with their `model`, `omitClaudeMd` and the
   length of their `description` (descriptions load every session). Note whether `Explore` is overridden.
4. **MCP servers and plugins.** List configured servers (`claude mcp list`), their scope (user, project, local) and
   how many tools each exposes. Deferred tools still cost their names and server instructions in every request. Flag
   servers unused in recent work, and user-scope servers used by a single project.
5. **Hooks and output filters** (RTK or others): what they cover (Bash only? built-in Read/Grep/Glob?) and their own
   statistics, if any.
6. **Usage data.** Ask the user to run `/usage` (plan breakdown, prompt-cache line) and `/context`, and paste the
   result, or read them yourself if you can.

## Phase 2 — Report and plan

Produce a short report, ranked by **estimated saving per session**, each line with: finding, evidence (file, size,
command output), proposed change, estimated effect, risk. Then wait for the user's go.

Apply these principles, which come from measured evidence ([references/evidence.md](references/evidence.md)), not
vendor claims:

- **The biggest lever is usually the always-loaded context.** Keep each loaded `CLAUDE.md`/`AGENTS.md` under ~200
  lines. Write in it what the project is for and its non-obvious pitfalls, not what Claude can read in the code, not
  rules repeated elsewhere, not every case that might happen; prefer "match the surrounding code" to absolute bans that
  contradict each other. Only durable rules: no status log, no dated story, no counters. Move procedures
  (verification, review, release) to skills it references, and reference docs to files read on demand; replace long
  `@` imports with a short index plus "search with `rg`". Move content, never delete it silently.
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
  plan well; it plans poorly on its own; reviewing or judging code needs a stronger model.
- **Subagents are not free.** Each starts a fresh context (system prompt, instruction files, delegation message), does
  not reuse the parent's cache and gets a 5-minute cache. Delegate high-volume work (logs, test output, broad searches),
  not small lookups: on a small bug fix, three subagents cost 2.6× a single session with no better result. Agent teams
  cost about 7× a single session.
- **Resume or restart.** Resuming after the cache has expired re-bills the whole context (measured 10× the cost of a
  resume within the hour). After a long break, start a fresh session or `/compact` before leaving.
- **Effort and thinking** are output tokens, the most expensive kind; lower effort for routine tasks.
- **MCP**: deferred tools cost about 15 tokens each per request — far less than a large instruction file. Disable
  servers you never use (large tool lists add up), scope a server to the one project that uses it, prefer CLIs (`gh`,
  cloud CLIs).
- **Watch the cache hit rate.** The `Prompt cache` line of `/usage` should stay high (≥ 90 %); a drop means something
  keeps changing the prefix.
- **Background usage**: idle compaction, prompt suggestions, `/loop` and scheduled tasks, goal check-ins resend the full
  context.
- **Judge any optimization by cost per successful task**, not by "tokens saved" counters, which usually compare against
  raw output that would never have entered the context (Claude Code already caps tool output) and ignore that most input
  is cheap cache reads. Check before/after with `/usage` on comparable work.

Do not recommend a tool on its README numbers alone. When the setup already uses one of the tools listed in the
evidence file, look at how it is actually used here (for example, how many searches go through Bash) before judging
it, and respect the user's choice once stated.

## Evidence

Measured results and sources behind these principles: [references/evidence.md](references/evidence.md). Read it when a
finding involves one of the tools or techniques it lists, or when the user questions a recommendation.

## Constraints

- Never print secrets (API keys, tokens, `.env` contents) found while reading settings.
- Back up every file before editing it, keep the user's content (move, don't delete), and list every changed file.
- Do not commit or push in the user's repositories unless asked.
- After applying, tell the user how to verify the effect (`/context` at session start, `/usage` after a few sessions).
