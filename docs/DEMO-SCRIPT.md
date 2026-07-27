# 75-second screen-recording script

Record at 1440 × 900 or 1920 × 1080. Keep the editor, local browser, and
Autosana results visible at a readable zoom. Cut setup and waiting time.

| Time | Visual | Voiceover / on-screen copy |
| --- | --- | --- |
| 0–6s | Open on the loop graphic. | “Can a coding agent verify—and fix—its own work?” |
| 6–14s | Show the LaunchPad feature in the editor and local browser. | “We gave a coding agent a small launch-checklist feature to build.” |
| 14–22s | Briefly reveal the seeded route and responsive regressions. | “Then we deliberately seeded two regressions: a wrong destination and a clipped mobile CTA.” |
| 22–34s | Run the Autosana flow locally through MCP. | “Autosana exercised the real user flow against the local app.” |
| 34–45s | Show the Template library failure and the 320 px clipped CTA screenshot. | “The functional test reached the wrong screen. The UI/UX review also flagged the CTA on the smaller device.” |
| 45–57s | Show the agent reading results and changing the route and CSS. | “The coding agent used that evidence to repair the route and make the action responsive.” |
| 57–68s | Rerun the identical Autosana flow. Show Ready for review and the fixed CTA. | “Then Autosana ran the same flow again.” |
| 68–75s | End on the loop graphic plus repository URL. | “Code. Test. Find the bug. Fix. Retest. The interesting part is closing the loop.” |

## Recording checklist

- Use the `demo-broken` tag for the failed run.
- Keep the Autosana run URL or issue view visible long enough to read.
- Show both the functional result and UI/UX finding.
- Switch to the fixed commit only when the coding-agent repair occurs.
- Use the same flow and device size for both runs.
- Add a clear disclosure: “Both regressions were intentionally introduced.”
- Use `github.com/kh-bikash/launchpad` in the end card.
