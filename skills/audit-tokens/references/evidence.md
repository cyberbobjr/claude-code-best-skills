# Evidence (as of November 2026 — re-check if much later)

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

Do not recommend a tool on its README numbers alone.
