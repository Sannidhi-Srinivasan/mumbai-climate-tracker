@AGENTS.md

# Mumbai Climate Tracker — Project Rules

This is a Terra Studio Build 2 project: a website that tracks heat, air quality, and rain/flood
risk in Mumbai, India, and suggests local climate actions to visitors.

## Who this is for

The person building this is new to web development. When explaining anything:
- Use plain words. Explain any technical term the first time you use it (e.g. "API — a way
  for one program to ask another program for data").
- Don't assume familiarity with React, Next.js, or TypeScript concepts.

## How to build

- Write fresh code for this project. Don't copy code wholesale from any reference/template
  repo — use it only as inspiration for structure and approach.
- Every step of work should end with something visibly different in the browser. Avoid long
  stretches of invisible plumbing before showing a result.
- Keep steps small and runnable. After each change, the learner should be able to refresh the
  browser and see what happened.

## Tech stack (already set up)

- Next.js (App Router) + TypeScript
- Tailwind CSS for styling
- npm as the package manager
- Deployment target: Vercel (later step)

## Data & content rules

- Heat, air quality, and rain/flood data must come from live sources, not hardcoded numbers.
- Local climate action listings come from two learner-curated JSON files: verified actions and
  flagged (unverified) actions. If the learner hasn't produced these yet, use clearly-labeled
  placeholder/fictional entries — never present placeholder data as real.
- Any transparency/validation page must accurately reflect how entries were checked — don't
  fabricate validation results.

## Accessibility

- Level indicators (e.g. heat/air/rain severity) must stay distinguishable by more than color
  alone (add text labels or icons), even as the design is customized later.

## Out of scope for now

- Don't set up a GitHub remote or push anywhere — that happens in the final deployment step,
  only when explicitly asked.
