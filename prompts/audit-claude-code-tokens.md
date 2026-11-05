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
   user and project `CLAUDE.md` or `AGENTS.md`, every `@`-imported file (follow imports recursively), rules without
   `paths:`, auto-memory `MEMORY.md`, output style. Flag anything above ~200 lines or ~3k tokens.
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

- **The biggest lever is usually the always-loaded context.** Keep `CLAUDE.md`/`AGENTS.md` under ~200 lines. Move
  task-specific instructions to skills or to docs read on demand; replace long `@` imports with a short index plus
  "search with `rg`". Move content, never delete it silently.
- **Cache discipline.** Pick model and effort at the start of a session; switching model (including `opusplan` toggles),
  fast mode, MCP/plugin changes or tool deny rules mid-session invalidates the cache. Use `/clear` between unrelated
  tasks, `/rewind` to abandon a path (reuses the cache), `/compact` at natural breaks only. A break longer than the
  cache TTL (5 min, or 1 h on subscriptions for the main conversation) re-bills the whole context.
- **Model routing.** Use the strongest model for design and coordination, a cheaper one for routine work. Set
  `CLAUDE_CODE_SUBAGENT_MODEL=haiku` (default, not forced) and override the built-in `Explore` agent with a user agent
  named `Explore` using `model: haiku` (on subscriptions it otherwise uses the Opus alias). Set `omitClaudeMd: true` on
  subagents that don't need project rules.
- **Subagents are not free.** Each starts a fresh context (system prompt, CLAUDE.md, delegation message), does not reuse
  the parent's cache and gets a 5-minute cache. Delegate high-volume work (logs, test output, broad searches), not
  small lookups. Agent teams cost about 7× a single session.
- **Effort and thinking** are output tokens, the most expensive kind; lower effort for routine tasks.
- **MCP**: disable unused servers; prefer CLIs (`gh`, cloud CLIs) to MCP servers that do the same.
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

Do not recommend a tool on its README numbers alone. When my setup already uses one of these tools, look at how it is
actually used here (for example, how many searches go through Bash) before judging it.

## Constraints

- Never print secrets (API keys, tokens, `.env` contents) found while reading settings.
- Back up every file before editing it, keep the user's content (move, don't delete), and list every changed file.
- After applying, tell me how to verify the effect (`/context` at session start, `/usage` after a few sessions).
