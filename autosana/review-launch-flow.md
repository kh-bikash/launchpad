# Autosana flow: Review a launch plan

Create this flow through the Autosana dashboard or MCP server.

## Flow name

Review a launch plan

## Instructions

1. Open the application.
2. Select **Create launch checklist**.
3. Enter `Autosana agent demo` as the project name.
4. Keep all three launch workstreams selected.
5. Select **Review launch plan**.
6. Verify that the **Ready for review** screen appears.
7. Confirm that the primary action is fully visible and understandable on a small mobile device.

## Expected first run

- Functional failure: **Review launch plan** opens the Template library instead of the review screen.
- UI/UX finding: the primary CTA is clipped on a small mobile viewport.

## Expected second run

- The review screen opens.
- The CTA is fully visible and clearly states what happens next.
- The flow passes without the equivalent UI/UX finding.
