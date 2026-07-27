# Five-post X thread

Replace `[VIDEO]` after recording.

## Post 1

Can an AI coding agent test—and fix—its own work?

We connected a coding agent to Autosana, gave it a feature to build, and
deliberately introduced a functional bug plus a mobile UX regression.

Here’s what happened:

Attach: `[VIDEO]`

## Post 2

The demo is intentionally small and reproducible.

The agent builds a launch-checklist flow. We seed two regressions:

1. “Review launch plan” opens the wrong screen.
2. The primary CTA is clipped on a 320 px mobile viewport.

The disclosure matters: we’re testing the repair loop, not trying to hide the
setup.

## Post 3

Autosana runs the real flow against the local app through MCP.

The E2E result catches the wrong destination. The UI/UX Agent reviews the same
run and surfaces the small-device CTA problem.

One run, two different kinds of evidence.

Attach: before screenshots.

## Post 4

The coding agent reads those findings and makes two focused changes:

- Correct the review destination.
- Replace the fixed-width CTA with a responsive action.

Autosana then runs the exact same flow again—on the exact same small viewport.
This time it reaches the review screen and the CTA fits.

Attach: diff plus passing result.

## Post 5

The interesting part wasn’t generating tests. It was closing the loop between
writing code, verifying the real user flow, fixing the failure, and testing
again.

Full setup + repo: https://github.com/kh-bikash/launchpad

Technical walkthrough:
https://github.com/kh-bikash/launchpad/blob/main/docs/ARTICLE.md

Suggested experiment by Build Fast with AI. Built with Autosana.
