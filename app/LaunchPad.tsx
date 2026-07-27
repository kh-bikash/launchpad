"use client";

import { FormEvent, useState } from "react";

type Screen = "dashboard" | "create" | "templates" | "review";

const tasks = [
  {
    id: "landing",
    title: "Landing page",
    detail: "Publish the launch page and verify the primary CTA.",
  },
  {
    id: "analytics",
    title: "Analytics",
    detail: "Confirm product and conversion events are arriving.",
  },
  {
    id: "announcement",
    title: "Announcement",
    detail: "Prepare the launch post and customer update.",
  },
];

export function LaunchPad() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [projectName, setProjectName] = useState("");
  const [selectedTasks, setSelectedTasks] = useState(
    new Set(["landing", "analytics", "announcement"]),
  );

  function goTo(next: Screen) {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleTask(id: string) {
    setSelectedTasks((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function reviewLaunch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    goTo("review");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={() => goTo("dashboard")}
          aria-label="LaunchPad home"
        >
          <span className="brand-mark">LP</span>
          <span>LaunchPad</span>
        </button>
        <div className="demo-pill">
          <span className="live-dot" />
          Autosana loop demo
        </div>
        <button className="avatar" type="button" aria-label="Open account menu">
          BF
        </button>
      </header>

      <div className="workspace">
        <aside className="sidebar" aria-label="Primary navigation">
          <nav>
            <button
              className={screen === "dashboard" ? "nav-item active" : "nav-item"}
              type="button"
              onClick={() => goTo("dashboard")}
            >
              <span className="nav-icon">⌂</span>
              Overview
            </button>
            <button
              className={screen === "create" ? "nav-item active" : "nav-item"}
              type="button"
              onClick={() => goTo("create")}
            >
              <span className="nav-icon">＋</span>
              New launch
            </button>
            <button
              className={
                screen === "templates" ? "nav-item active" : "nav-item"
              }
              type="button"
              onClick={() => goTo("templates")}
            >
              <span className="nav-icon">◇</span>
              Templates
            </button>
          </nav>
          <div className="sidebar-note">
            <span>Experiment 01</span>
            <strong>Agent verification loop</strong>
          </div>
        </aside>

        <section className="content" aria-live="polite">
          {screen === "dashboard" && (
            <Dashboard onCreate={() => goTo("create")} />
          )}
          {screen === "create" && (
            <CreateLaunch
              projectName={projectName}
              onProjectNameChange={setProjectName}
              selectedTasks={selectedTasks}
              onTaskToggle={toggleTask}
              onSubmit={reviewLaunch}
              onCancel={() => goTo("dashboard")}
            />
          )}
          {screen === "templates" && (
            <Templates onBack={() => goTo("create")} />
          )}
          {screen === "review" && (
            <Review
              projectName={projectName}
              selectedCount={selectedTasks.size}
              onBack={() => goTo("create")}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function Dashboard({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="page page-dashboard">
      <div className="eyebrow">Build fast with AI</div>
      <div className="hero-row">
        <div>
          <h1>Ship the right thing, confidently.</h1>
          <p className="lede">
            Turn a rough idea into a focused launch plan your whole team can
            follow.
          </p>
        </div>
        <button
          className="primary-button compact"
          type="button"
          onClick={onCreate}
          data-testid="create-launch"
        >
          <span>＋</span>
          Create launch checklist
        </button>
      </div>

      <div className="metric-grid">
        <article className="metric-card accent-card">
          <span className="card-label">Readiness score</span>
          <strong>84%</strong>
          <div className="meter">
            <span />
          </div>
          <p>Up 12% since last week</p>
        </article>
        <article className="metric-card">
          <span className="card-label">Active launches</span>
          <strong>03</strong>
          <p>Two are ready for review</p>
        </article>
        <article className="metric-card">
          <span className="card-label">Tasks completed</span>
          <strong>21</strong>
          <p>Across your launch workspace</p>
        </article>
      </div>

      <section className="recent-panel">
        <div className="section-heading">
          <div>
            <span className="card-label">In progress</span>
            <h2>Recent launches</h2>
          </div>
          <button type="button" className="text-button">
            View all
          </button>
        </div>
        <div className="launch-row">
          <div className="launch-monogram coral">MD</div>
          <div>
            <strong>Mobile dashboard</strong>
            <span>Product launch · 8 of 10 tasks</span>
          </div>
          <span className="status-badge">Review</span>
        </div>
        <div className="launch-row">
          <div className="launch-monogram blue">AP</div>
          <div>
            <strong>Analytics playbook</strong>
            <span>Content launch · 5 of 8 tasks</span>
          </div>
          <span className="status-badge muted">Draft</span>
        </div>
      </section>
    </div>
  );
}

type CreateLaunchProps = {
  projectName: string;
  onProjectNameChange: (value: string) => void;
  selectedTasks: Set<string>;
  onTaskToggle: (id: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

function CreateLaunch({
  projectName,
  onProjectNameChange,
  selectedTasks,
  onTaskToggle,
  onSubmit,
  onCancel,
}: CreateLaunchProps) {
  return (
    <div className="page create-page">
      <button className="back-button" type="button" onClick={onCancel}>
        ← Back to overview
      </button>
      <div className="create-heading">
        <div>
          <div className="eyebrow">New launch</div>
          <h1>Build your launch checklist.</h1>
          <p>
            Start with the essentials. You can fine-tune owners and due dates
            after review.
          </p>
        </div>
        <div className="step-indicator">
          <span className="current">1</span>
          <i />
          <span>2</span>
          <small>Details</small>
          <small>Review</small>
        </div>
      </div>

      <form className="form-shell" onSubmit={onSubmit}>
        <div className="field-group">
          <label htmlFor="project-name">Project name</label>
          <input
            id="project-name"
            name="project-name"
            placeholder="e.g. Autosana agent demo"
            value={projectName}
            onChange={(event) => onProjectNameChange(event.target.value)}
            required
          />
          <span>Keep it short and recognizable to your team.</span>
        </div>

        <fieldset>
          <legend>What should this launch include?</legend>
          <p>Select the workstreams you want in your first checklist.</p>
          <div className="task-list">
            {tasks.map((task) => (
              <label className="task-option" key={task.id}>
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.id)}
                  onChange={() => onTaskToggle(task.id)}
                />
                <span className="custom-check">✓</span>
                <span>
                  <strong>{task.title}</strong>
                  <small>{task.detail}</small>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            Save as draft
          </button>
          <button
            className="primary-button review-cta"
            type="submit"
            data-testid="review-launch"
          >
            Review launch plan
            <span>→</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function Templates({ onBack }: { onBack: () => void }) {
  return (
    <div className="page simple-page" data-testid="templates-screen">
      <button className="back-button" type="button" onClick={onBack}>
        ← Back
      </button>
      <div className="wrong-screen-flag">Unexpected destination</div>
      <div className="eyebrow">Template library</div>
      <h1>Start from a proven playbook.</h1>
      <p className="lede">
        Choose a reusable template for your next product or content launch.
      </p>
      <div className="template-grid">
        <article>
          <span>01</span>
          <strong>Product launch</strong>
          <p>Positioning, rollout, analytics, and feedback.</p>
        </article>
        <article>
          <span>02</span>
          <strong>Feature release</strong>
          <p>QA, documentation, announcement, and adoption.</p>
        </article>
      </div>
    </div>
  );
}

function Review({
  projectName,
  selectedCount,
  onBack,
}: {
  projectName: string;
  selectedCount: number;
  onBack: () => void;
}) {
  return (
    <div className="page simple-page" data-testid="review-screen">
      <button className="back-button" type="button" onClick={onBack}>
        ← Edit checklist
      </button>
      <div className="success-mark">✓</div>
      <div className="eyebrow">Ready for review</div>
      <h1>{projectName || "Your launch plan"}</h1>
      <p className="lede">
        {selectedCount} workstreams are ready. Confirm the plan and invite your
        team when you are happy with it.
      </p>
      <div className="review-card">
        <span>Next step</span>
        <strong>Assign owners and due dates</strong>
        <button className="primary-button compact" type="button">
          Confirm launch plan
        </button>
      </div>
    </div>
  );
}
