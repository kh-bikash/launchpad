# Can a coding agent verify its own work?

LaunchPad is a small, reproducible experiment for the coding-agent →
Autosana → fix → retest loop.

The demo deliberately begins with two regressions:

- **Functional:** Review launch plan opens the wrong screen.
- **UI/UX:** The primary CTA is clipped at a small mobile width.

Autosana runs the real local user flow, reports both findings, and gives the
coding agent the evidence it needs to repair the application and rerun the
same test.

## Run locally

Prerequisites: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

## Run the experiment

1. Connect the Autosana MCP server to Codex or Cursor.
2. Create the flow in [`autosana/review-launch-flow.md`](autosana/review-launch-flow.md).
3. Give the coding agent the prompt in [`docs/AGENT-PROMPT.md`](docs/AGENT-PROMPT.md).
4. Record the first failed run and its functional and UI/UX findings.
5. Let the coding agent repair the route and responsive CTA.
6. Rerun the identical flow and capture the passing result.

## Autosana MCP configuration for Codex

Add this to `~/.codex/config.toml`, replacing the placeholder with an API key
from Autosana:

```toml
[mcp_servers.autosana]
url = "https://mcp.autosana.ai/mcp"
http_headers = { "x-api-key" = "<YOUR_API_KEY>" }
```

Restart Codex after changing the MCP configuration. Never commit the API key.

## Repository states

The public repository preserves two tags:

- `demo-broken` — reproduces both intentional regressions.
- `demo-fixed` — contains the repaired flow.

This disclosure is intentional: the experiment tests whether the agent can
close the verification loop, not whether it can be surprised by an undisclosed
bug.
