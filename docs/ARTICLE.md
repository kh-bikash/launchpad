# Can a coding agent verify its own work?

AI coding tools make it easy to produce a feature quickly. The harder question
is whether the same agent can verify that feature through a real user flow,
understand the failure, repair it, and prove that the repair worked.

We designed a small, reproducible experiment to test that loop with a coding
agent and Autosana.

## The experiment

The application is LaunchPad, a responsive launch-checklist demo. A user enters
a project name, selects three workstreams, and chooses **Review launch plan**.
The expected destination is a review screen summarizing the checklist.

We deliberately introduced two regressions:

- A functional bug sent the user to the Template library.
- A fixed-width primary action extended beyond a 320 px mobile viewport.

Both regressions are disclosed and preserved in the `demo-broken` Git tag. The
goal is not to surprise the agent. It is to see whether functional and
experience-level evidence can close the implementation loop.

## Why Autosana

Autosana’s local-testing workflow lets a coding agent run a flow against a
local browser, simulator, emulator, or connected device without uploading a
build. Its documented loop is straightforward: build a feature, test it
locally, fix what fails, and repeat until the flow passes.

Autosana announced its UI/UX Agent on July 14, 2026. It evaluates the same E2E
run for functional, visual, and usability findings. That makes this experiment
more useful than a simple navigation assertion: the run can reveal both where
the user landed and whether the action held up on the smaller screen.

- [Autosana local testing](https://docs.autosana.ai/local-testing)
- [Autosana UI/UX Agent announcement](https://autosana.ai/blogs/launching-the-ui-ux-agent)

## Set up the project

Clone the repository and install the dependencies:

```bash
git clone [REPO URL]
cd launchpad-autosana-demo
npm install
npm run dev
```

The project requires Node.js 22.13 or newer. Keep the local URL printed by the
development server running.

## Connect the coding agent

Create an Autosana API key, then add the MCP server to Codex:

```toml
[mcp_servers.autosana]
url = "https://mcp.autosana.ai/mcp"
http_headers = { "x-api-key" = "<YOUR_API_KEY>" }
```

Restart Codex after editing its configuration. Do not store the real key in the
repository.

For Cursor, use the equivalent MCP configuration described in Autosana’s
[MCP documentation](https://docs.autosana.ai/mcp-setup).

## Create the flow

Create a flow using `autosana/review-launch-flow.md`. In short, the flow:

1. Opens the application.
2. Creates a launch checklist named `Autosana agent demo`.
3. Keeps the three workstreams selected.
4. Chooses **Review launch plan**.
5. Verifies that **Ready for review** appears.
6. Checks that the primary action is fully visible and understandable on a
   small mobile device.

Use the prompt in `docs/AGENT-PROMPT.md` to tell the coding agent to run the
flow locally, fix the findings, and retest.

## First run: two findings

Check out the intentionally broken state:

```bash
git checkout demo-broken
npm install
npm run dev
```

The first run should produce two pieces of evidence:

- The functional flow cannot verify **Ready for review** because the Template
  library appears instead.
- At 320 px, the CTA is 420 px wide and is visibly clipped by its container.

Capture the Autosana result, issue details, and screenshots before changing the
code.

## The repair

The functional fix changes the destination from `templates` to `review`.

The responsive fix removes the mobile `min-width: 420px` constraint and lets
the action use the available width:

```css
.review-cta {
  min-width: 0;
  width: 100%;
}
```

These are deliberately small changes. The important part is that they are
driven by evidence from the executed user flow.

## Retest

Run the identical Autosana flow again on the same target. A successful second
run should:

- Reach the **Ready for review** screen.
- Display the complete **Review launch plan** CTA within the mobile viewport.
- Avoid producing the equivalent functional and UI/UX findings.

The `demo-fixed` tag preserves this final state.

## What this demonstrates

Generating a test is useful. Closing the feedback loop is more valuable:

**Code → Test → Find bug → Fix → Retest**

The experiment is intentionally narrow, but the pattern can extend to local
web apps, mobile simulators and emulators, connected devices, and parallel
device coverage. The repository gives others a small starting point for
testing that workflow themselves.
