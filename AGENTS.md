# Project Tooling

This project uses Vite directly with pnpm.

## AI Agent Workflow

Follow `docs/ai-agent-workflow.md` for non-trivial work. Start read-only,
explain the relevant code path, propose a narrow plan, and only then edit. Keep
changes scoped to the approved plan and explain the diff before handing work
back.

## Review Checklist

- [ ] Run `pnpm install` after pulling remote changes and before getting started.
- [ ] Run `pnpm run check` to run Prettier, ESLint, and TypeScript checks.
- [ ] Run `pnpm run build` when changing Vite, React Compiler, or production build configuration.
