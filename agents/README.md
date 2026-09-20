# Shared agents

`audit-agent.md` and `fix-agent.md` in this folder are the single source of
truth for these agents' instructions. They're shared between Claude Code and
GitHub Copilot, which each expect the file in their own directory:

- `.claude/agents/<name>.md` (Claude Code)
- `.github/agents/<name>.agent.md` (GitHub Copilot)

Those are plain committed copies, not symlinks (symlinks break on Windows
checkouts). After editing a file here, run:

```
npm run sync-agents
```

to regenerate both copies (this also runs automatically after `npm install`
via the `prepare` script). Don't hand-edit the files under `.claude/agents/`
or `.github/agents/` directly — edit the version here instead.
