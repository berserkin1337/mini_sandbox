# AI Agent Workflow

This project uses AI agents as accelerators, not as the source of architecture.
The goal is to keep the human reasoning loop intact:

```text
read -> predict -> change -> test -> internalize
```

Agents should help with reading, tracing, implementation, and verification, but
the developer should be able to explain the code path and diff before accepting
changes.

## Operating Rules

1. Start read-only for non-trivial work.
   - Inspect the relevant files before editing.
   - Explain the existing code path, state ownership, and side effects.
   - Name the exact files and functions involved.

2. Plan before changing code.
   - Propose the smallest change that fits the current architecture.
   - Explain why the bug happens before proposing a fix.
   - Show how the fix would work, including the relevant code path or patch
     shape, without applying it yet.
   - List the files expected to change and why.
   - Call out risky areas and what should stay untouched.
   - Wait for explicit confirmation before making any edits.

3. Keep edits narrow.
   - Edit only after the plan has been confirmed.
   - Do not refactor unrelated code.
   - Do not introduce a new abstraction unless it removes real complexity.
   - Do not add dependencies without an explicit reason and approval.
   - Prefer existing project patterns over new styles.

4. Explain the diff after implementation.
   - For each changed file, explain why the change belongs there.
   - Mention behavior that deliberately did not change.
   - Highlight any assumptions or remaining risk.

5. Verify with project checks.
   - Run `pnpm run check` for normal code changes.
   - Run `pnpm run build` when changing Vite, React Compiler, or production
     build configuration.
   - If a check cannot be run, state why.

## Prompt Templates

### Understand A Code Path

```text
Do not edit anything yet.
Help me understand this code path starting from <file/function>.
Explain:
1. What owns the state
2. What calls what
3. What side effects happen
4. What assumptions exist
5. Where a change should be made
6. What would be risky to touch
Use exact file and function references.
```

### Plan A Change

```text
Do not edit yet.
Give me the smallest implementation plan for <goal>.
First explain why the issue is happening from the current code path.
Then show how you would fix it, including the files and functions involved.
Follow existing project patterns.
List the files you expect to touch and why.
Tell me what you will deliberately avoid changing.
Wait for explicit confirmation before implementation.
```

### Diagnose A Performance Issue

```text
Do not edit yet.
Trace the performance issue from the event source to the rendered component.
Explain:
1. What state changes
2. Which object identities change
3. Which selectors, memos, or effects are invalidated
4. Why that causes extra work
5. The narrowest fix
6. The exact files and functions that would change
Show the intended patch shape, but wait for explicit confirmation before editing.
```

### Implement A Change

```text
Implement only the confirmed plan.
Keep the diff narrow.
Do not refactor unrelated code.
Do not add dependencies unless already approved.
After editing, explain the diff file-by-file and run the relevant checks.
```

### Review A Diff

```text
Review this diff as a senior engineer.
Prioritize bugs, behavioral regressions, maintainability issues, overengineering,
and missing tests.
Lead with findings and include exact file references.
Only summarize after the findings.
```

## Acceptance Checklist

Before accepting agent-written code, confirm:

- [ ] I can explain the changed code path without reading the agent's summary.
- [ ] The diff is smaller than the problem, not larger.
- [ ] The change follows nearby project patterns.
- [ ] No unrelated files or formatting churn were introduced.
- [ ] New abstractions have a concrete reason.
- [ ] The agent listed what it deliberately did not change.
- [ ] `pnpm run check` passed, or the failure is understood.
- [ ] `pnpm run build` passed if build configuration changed.

## When To Avoid Agent Edits

Use the agent only for explanation or review when:

- You cannot describe the current architecture yet.
- The agent proposes a broad rewrite for a narrow bug.
- The implementation requires product or architecture judgment you have not made.
- The diff introduces unfamiliar patterns you would not write yourself.
- The code passes checks but you cannot explain why it is correct.
