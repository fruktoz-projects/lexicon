---
name: plan
description: Plan a task end-to-end first, split it into context-sized phases if it doesn't fit in one pass, explicitly flag deferred parts, and only implement once explicitly triggered
---

# Phased Plan

Use this skill whenever a request is a process, feature, or task large enough that it might not safely fit into a single implementation pass — before writing or modifying any code.

## Process

1. **Confirm scope.** Restate in 1–2 sentences what the full task is, so the user can correct scope before planning starts.

2. **Draft the complete plan first.** List every step needed to finish the *entire* request end-to-end, regardless of size. Don't pre-trim scope at this stage — the full picture has to exist before it gets split.

3. **Assess context fit.** Estimate whether the full plan — all steps, all files touched, all code to write/edit — can realistically be completed within the current context budget in one pass. Consider: number of files, amount of new/changed code, complexity and interdependency of steps.

4. **Split into phases if it doesn't fit.**
   - If the whole plan fits comfortably: present it as a single phase, ready to implement.
   - If it doesn't: break it into ordered phases, each sized to complete safely and coherently on its own (a phase should end at a working, testable checkpoint — not an arbitrary line-count cutoff).
   - For every phase beyond the first, say explicitly: **"Not included in this pass — planned for Phase N"**, with a one-line reason (e.g. depends on Phase 1's output, would exceed context budget alongside Phase 1).

5. **Present the plan.** Show the phase breakdown clearly: what's in the current phase, and what's explicitly deferred and why. Do not start implementing yet.

6. **Wait for an explicit trigger.** Do not modify files or execute code until the user gives an unambiguous go-ahead (e.g. the project's "Proceed" keyword, if one is defined). A soft acknowledgment ("looks good", "yes", "ok") is not a trigger — treat it as continued discussion, same as the project's execution rules require.

7. **Implement only the current phase's scope.** When triggered, execute strictly what was scoped for the current phase — nothing from the deferred phases, even if it would be quick to include. At the end, summarize what was actually done, restate what remains for the next phase, and stop. Do not auto-continue into the next phase without a fresh explicit trigger.

## Notes
- If a phase turns out bigger than estimated mid-implementation, stop, report the overrun honestly, and ask whether to split it further before continuing — don't silently push through and blow the context budget.
- This skill defers to whatever execution/approval rules already exist for the project (e.g. a required confirmation keyword); it adds phasing on top, it doesn't loosen those rules.
