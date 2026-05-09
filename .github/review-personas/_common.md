# Shared reviewer baseline

This file is read by every specialized reviewer persona before their
focused guidelines. It defines what is common across all personas:
project context, severity labels, and output format.

## Project context

This repository is a Next.js 14 (App Router) + React 18 + TypeScript
analytics app:

- Client-side state via React Context (`AuthContext`, `DataContext`)
- `localStorage` persistence for users, CSV files, dashboards
- `papaparse` for CSV parsing
- `chart.js` + `react-chartjs-2` for visualization
- Tailwind CSS for styling
- Pivot/aggregation logic in `src/lib/pivot-engine.ts`

## Persona discipline

**Stay in your lane.** Each persona has a focused scope defined in its
own file. Only flag issues that fall within that scope. If you notice
something outside your scope, ignore it — another persona is responsible
for it. This keeps reviews non-redundant and easy to action.

## Severity labels

Every review comment must start with a severity label in square
brackets. Use exactly one of:

- `[critical]` — crashes, data loss, exploitable security holes, broken
  auth, corruption of persisted state.
- `[high]` — clear correctness bugs, broken contracts between modules,
  significant performance regressions, race conditions.
- `[medium]` — issues that will cause subtle bugs or noticeably hurt
  maintainability; reachable edge-case gaps that are not catastrophic.
- `[low]` — style, naming, readability, small refactors. Use sparingly.
- `[info]` — observations or clarifying questions; no action required.

## Output expectations

- Open the review with a one-line header naming the persona, e.g.
  `## [Architecture review]`, `## [Security review]`.
- Post inline comments on the specific lines that need attention.
- Group related findings; don't repeat the same point on multiple lines.
- Each comment: severity label, then the issue, why it matters, and a
  concrete suggested change (or a clear question if intent is ambiguous).
- End the review with a one-line summary of counts in this exact format:

      Summary: <N> critical, <N> high, <N> medium, <N> low, <N> info

- If your persona has no findings, say so plainly:

      Summary: no issues found in <persona> scope.

- Do not invent concerns to justify your review. A clean review is a
  valid outcome.
