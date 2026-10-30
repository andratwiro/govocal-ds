# Chat progress

## When to use

- While the assistant works on a reply: one row, a teal spinner and "Thinking…".
- For a longer run (generate a report): a step trace whose rows go from the spinner to a tick one by one and stay
  above the answer.
- After the run was stopped: the step that was running gets a stop mark.

## When not to use

- For a page or a list still loading: use **Skeleton**.
- For progress you can measure (an upload, a vote count): use **Vote progress** or a progress bar in the part that owns it.
- For a message about the result: use **Chat message**.

## Anatomy

1. **Rows**: Small 12/16, secondary, 6 apart.
2. **Mark**: 12, 8 before the words: a spinner (a 1.5 accent ring, open at the top), a tick in the accent, or a stop
   square in the tertiary grey.
3. **Label**: what the step does as it does it.

## Behaviour

Not interactive: it can't be reached with Tab and answers no keys. Each row rises in as it is added; under reduced motion the spinner holds
still.

## Content

- A step says what it does, in the present continuous, with the real numbers: "Reading the 6 projects across 3
  spaces", "Drawing 11 charts".
- Add a step when it starts, mark it done when it ends; never list steps not started yet.
- "Thinking…", "Done" and "Stopped" come from `labels`.

## Accessibility

**The part gives you:** a named list, busy while it runs, with "Done" read before each finished step (the tick says it
only to the eye).

**You still own:**
- Putting it in a **Chat thread** as its last item while the turn runs, so the log announces new steps.
- Taking it away (or marking it done) when the reply arrives.

## Related

- **Chat thread**: where it sits.
- **Chat message**: the reply that follows it.
- **Assistant panel**: shows it while generating.

## Changes

- 30 Oct 2026: built (thinking, steps, done, stopped), with this page.
