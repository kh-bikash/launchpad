# LaunchPad

LaunchPad is a shared launch-operations workspace for product, engineering, and marketing teams. It turns a launch idea into an editable plan with real ownership, due dates, checklist progress, and a single readiness view.

## Watch the real product walkthrough

https://github.com/user-attachments/assets/156244dd-b835-41de-885b-5e87466183c8

The recording uses the real application and shows:

1. Creating a launch plan
2. Generating a workflow-based checklist
3. Activating the plan
4. Assigning an owner and completing work
5. Watching the saved dashboard readiness update

## What LaunchPad does

- Creates durable launch plans for product launches, feature releases, and campaigns.
- Generates editable task checklists from practical workflow templates.
- Lets teams assign task owners, due dates, and completion state.
- Calculates launch and workspace readiness from saved task data.
- Keeps launch records in a D1 database so they persist across reloads.

## Run locally

Prerequisites: Node.js 22.13 or newer.

    npm install
    npm run dev

Open the local URL printed by the server. The app provisions its local development database automatically when it first loads.

## Autosana verification demo

LaunchPad is also the real application used for the Autosana agent-verification demo. The intended loop is:

    Build or change a LaunchPad feature
            ↓
    Autosana runs the real create → assign → complete → dashboard flow
            ↓
    The coding agent fixes any functional or UI/UX finding
            ↓
    Autosana reruns the exact flow and verifies the result

