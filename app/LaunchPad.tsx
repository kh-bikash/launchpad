"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Screen = "dashboard" | "create" | "templates" | "launch";
type TemplateId = "product" | "feature" | "campaign";

type LaunchTask = {
  id: string;
  launchId: string;
  title: string;
  detail: string;
  owner: string;
  dueDate: string;
  completed: boolean;
  position: number;
};

type Launch = {
  id: string;
  name: string;
  description: string;
  launchDate: string;
  template: TemplateId;
  status: "draft" | "active" | "ready";
  createdAt: string;
  updatedAt: string;
  tasks: LaunchTask[];
};

const templates: Array<{
  id: TemplateId;
  name: string;
  description: string;
  count: number;
}> = [
  {
    id: "product",
    name: "Product launch",
    description: "Positioning, launch page, analytics, announcement, and QA.",
    count: 5,
  },
  {
    id: "feature",
    name: "Feature release",
    description: "Release QA, documentation, rollout, and customer updates.",
    count: 4,
  },
  {
    id: "campaign",
    name: "Campaign",
    description: "Brief, creative assets, distribution, and reporting.",
    count: 4,
  },
];

function completion(launch: Launch) {
  if (!launch.tasks.length) return 0;
  return Math.round(
    (launch.tasks.filter((task) => task.completed).length / launch.tasks.length) *
      100,
  );
}

function formatDate(value: string) {
  if (!value) return "Date not set";
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function dateInTwoWeeks() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

export function LaunchPad() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateId>("product");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const loadLaunches = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/launches", { cache: "no-store" });
      const data = (await response.json()) as {
        launches?: Launch[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "Unable to load launches.");
      setLaunches(data.launches ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load launches.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLaunches();
  }, [loadLaunches]);

  function goTo(next: Screen) {
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function openLaunch(launch: Launch) {
    setSelectedLaunch(launch);
    goTo("launch");
  }

  async function createLaunch(input: {
    name: string;
    description: string;
    launchDate: string;
    template: TemplateId;
  }) {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/launches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = (await response.json()) as {
        launch?: Launch;
        error?: string;
      };
      if (!response.ok || !data.launch) {
        throw new Error(data.error ?? "Unable to create launch.");
      }
      setLaunches((current) => [data.launch!, ...current]);
      setSelectedLaunch(data.launch);
      showToast("Launch plan saved");
      goTo("launch");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create launch.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function patchTask(
    taskId: string,
    patch: Partial<Pick<LaunchTask, "owner" | "dueDate" | "completed">>,
  ) {
    if (!selectedLaunch) return;
    const optimistic = {
      ...selectedLaunch,
      tasks: selectedLaunch.tasks.map((task) =>
        task.id === taskId ? { ...task, ...patch } : task,
      ),
    };
    setSelectedLaunch(optimistic);
    setSaving(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await response.json()) as {
        launch?: Launch;
        error?: string;
      };
      if (!response.ok || !data.launch) {
        throw new Error(data.error ?? "Unable to update task.");
      }
      setSelectedLaunch(data.launch);
      setLaunches((current) =>
        current.map((launch) =>
          launch.id === data.launch!.id ? data.launch! : launch,
        ),
      );
      showToast("Task updated");
    } catch (updateError) {
      setSelectedLaunch(selectedLaunch);
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update task.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function setLaunchStatus(status: Launch["status"]) {
    if (!selectedLaunch) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/launches/${selectedLaunch.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as {
        launch?: Launch;
        error?: string;
      };
      if (!response.ok || !data.launch) {
        throw new Error(data.error ?? "Unable to update launch.");
      }
      setSelectedLaunch(data.launch);
      setLaunches((current) =>
        current.map((launch) =>
          launch.id === data.launch!.id ? data.launch! : launch,
        ),
      );
      showToast(status === "ready" ? "Launch marked ready" : "Launch activated");
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to update launch.",
      );
    } finally {
      setSaving(false);
    }
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
        <div className="workspace-pill">
          <span className="live-dot" />
          Live launch workspace
        </div>
        <div className="save-state" aria-live="polite">
          {saving ? "Saving…" : "All changes saved"}
        </div>
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
            <span>Team workspace</span>
            <strong>Your launch plans and task progress are saved.</strong>
          </div>
        </aside>

        <section className="content" aria-live="polite">
          {error && (
            <div className="error-banner" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>
                Dismiss
              </button>
            </div>
          )}
          {screen === "dashboard" && (
            <Dashboard
              launches={launches}
              loading={loading}
              onCreate={() => goTo("create")}
              onOpen={openLaunch}
            />
          )}
          {screen === "create" && (
            <CreateLaunch
              initialTemplate={selectedTemplate}
              saving={saving}
              onSubmit={createLaunch}
              onCancel={() => goTo("dashboard")}
            />
          )}
          {screen === "templates" && (
            <Templates
              onUse={(template) => {
                setSelectedTemplate(template);
                goTo("create");
              }}
            />
          )}
          {screen === "launch" && selectedLaunch && (
            <LaunchWorkspace
              launch={selectedLaunch}
              saving={saving}
              onBack={() => goTo("dashboard")}
              onTaskChange={patchTask}
              onStatusChange={setLaunchStatus}
            />
          )}
        </section>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function Dashboard({
  launches,
  loading,
  onCreate,
  onOpen,
}: {
  launches: Launch[];
  loading: boolean;
  onCreate: () => void;
  onOpen: (launch: Launch) => void;
}) {
  const metrics = useMemo(() => {
    const allTasks = launches.flatMap((launch) => launch.tasks);
    const completed = allTasks.filter((task) => task.completed).length;
    const readiness = allTasks.length
      ? Math.round((completed / allTasks.length) * 100)
      : 0;
    return {
      readiness,
      active: launches.filter((launch) => launch.status !== "ready").length,
      completed,
    };
  }, [launches]);

  return (
    <div className="page page-dashboard">
      <div className="eyebrow">Launch operations</div>
      <div className="hero-row">
        <div>
          <h1>Move every launch from plan to ready.</h1>
          <p className="lede">
            Build the checklist, assign the work, track progress, and keep the
            release moving from one shared workspace.
          </p>
        </div>
        <button
          className="primary-button compact"
          type="button"
          onClick={onCreate}
          data-testid="create-launch"
        >
          <span>＋</span>
          Create launch
        </button>
      </div>

      <div className="metric-grid">
        <article className="metric-card accent-card">
          <span className="card-label">Workspace readiness</span>
          <strong>{metrics.readiness}%</strong>
          <div className="meter">
            <span style={{ width: `${metrics.readiness}%` }} />
          </div>
          <p>Calculated from your saved launch tasks</p>
        </article>
        <article className="metric-card">
          <span className="card-label">Open launches</span>
          <strong>{String(metrics.active).padStart(2, "0")}</strong>
          <p>Draft and active plans</p>
        </article>
        <article className="metric-card">
          <span className="card-label">Tasks completed</span>
          <strong>{metrics.completed}</strong>
          <p>Across your launch workspace</p>
        </article>
      </div>

      <section className="recent-panel">
        <div className="section-heading">
          <div>
            <span className="card-label">Saved work</span>
            <h2>Recent launches</h2>
          </div>
          <span className="record-count">
            {launches.length} {launches.length === 1 ? "launch" : "launches"}
          </span>
        </div>
        {loading ? (
          <div className="loading-state">Loading your workspace…</div>
        ) : launches.length ? (
          launches.slice(0, 6).map((launch) => (
            <button
              className="launch-row"
              type="button"
              key={launch.id}
              onClick={() => onOpen(launch)}
            >
              <div className="launch-monogram">
                {launch.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <strong>{launch.name}</strong>
                <span>
                  {formatDate(launch.launchDate)} · {completion(launch)}% complete
                </span>
              </div>
              <span className={`status-badge ${launch.status}`}>
                {launch.status}
              </span>
            </button>
          ))
        ) : (
          <div className="empty-state">
            <strong>Your first launch starts here.</strong>
            <p>Create a plan and LaunchPad will turn it into actionable work.</p>
            <button className="secondary-button" type="button" onClick={onCreate}>
              Create your first launch
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function CreateLaunch({
  initialTemplate,
  saving,
  onSubmit,
  onCancel,
}: {
  initialTemplate: TemplateId;
  saving: boolean;
  onSubmit: (input: {
    name: string;
    description: string;
    launchDate: string;
    template: TemplateId;
  }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [launchDate, setLaunchDate] = useState(dateInTwoWeeks);
  const [template, setTemplate] = useState<TemplateId>(initialTemplate);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ name, description, launchDate, template });
  }

  return (
    <div className="page create-page">
      <button className="back-button" type="button" onClick={onCancel}>
        ← Back to overview
      </button>
      <div className="create-heading">
        <div>
          <div className="eyebrow">New launch</div>
          <h1>Create an operational launch plan.</h1>
          <p>
            Choose the right workflow, set the launch date, and start with a
            practical checklist your team can own.
          </p>
        </div>
      </div>

      <form className="form-shell" onSubmit={submit}>
        <div className="form-grid">
          <div className="field-group">
            <label htmlFor="project-name">Launch name</label>
            <input
              id="project-name"
              name="project-name"
              placeholder="e.g. Billing insights release"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="launch-date">Target date</label>
            <input
              id="launch-date"
              name="launch-date"
              type="date"
              value={launchDate}
              onChange={(event) => setLaunchDate(event.target.value)}
              required
            />
          </div>
        </div>

        <div className="field-group description-field">
          <label htmlFor="project-description">Goal</label>
          <textarea
            id="project-description"
            name="project-description"
            placeholder="What are you launching, for whom, and what outcome matters?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </div>

        <fieldset>
          <legend>Choose a workflow</legend>
          <p>LaunchPad will create an editable checklist from this template.</p>
          <div className="template-options">
            {templates.map((item) => (
              <label
                className={`template-option ${
                  template === item.id ? "selected" : ""
                }`}
                key={item.id}
              >
                <input
                  type="radio"
                  name="template"
                  value={item.id}
                  checked={template === item.id}
                  onChange={() => setTemplate(item.id)}
                />
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.description}</small>
                </span>
                <b>{item.count} tasks</b>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="primary-button review-cta"
            type="submit"
            disabled={saving}
            data-testid="create-plan"
          >
            {saving ? "Creating…" : "Create launch plan"}
            <span>→</span>
          </button>
        </div>
      </form>
    </div>
  );
}

function Templates({ onUse }: { onUse: (template: TemplateId) => void }) {
  return (
    <div className="page templates-page">
      <div className="eyebrow">Workflow library</div>
      <h1>Start with work that launches actually need.</h1>
      <p className="lede">
        Each template creates a practical checklist that stays fully editable
        after the plan is saved.
      </p>
      <div className="template-grid">
        {templates.map((template, index) => (
          <article key={template.id}>
            <span>0{index + 1}</span>
            <strong>{template.name}</strong>
            <p>{template.description}</p>
            <button
              className="secondary-button"
              type="button"
              onClick={() => onUse(template.id)}
            >
              Use template
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function LaunchWorkspace({
  launch,
  saving,
  onBack,
  onTaskChange,
  onStatusChange,
}: {
  launch: Launch;
  saving: boolean;
  onBack: () => void;
  onTaskChange: (
    id: string,
    patch: Partial<Pick<LaunchTask, "owner" | "dueDate" | "completed">>,
  ) => Promise<void>;
  onStatusChange: (status: Launch["status"]) => Promise<void>;
}) {
  const completedCount = launch.tasks.filter((task) => task.completed).length;
  const progress = completion(launch);
  const canMarkReady =
    launch.tasks.length > 0 && completedCount === launch.tasks.length;

  return (
    <div className="page launch-page" data-testid="launch-workspace">
      <button className="back-button" type="button" onClick={onBack}>
        ← All launches
      </button>
      <div className="launch-heading">
        <div>
          <div className="eyebrow">Launch workspace</div>
          <h1>{launch.name}</h1>
          <p className="lede">{launch.description}</p>
          <div className="launch-meta">
            <span>Target {formatDate(launch.launchDate)}</span>
            <span>{launch.template} workflow</span>
            <span className={`status-badge ${launch.status}`}>
              {launch.status}
            </span>
          </div>
        </div>
        <div className="progress-card">
          <strong>{progress}%</strong>
          <span>
            {completedCount} of {launch.tasks.length} tasks complete
          </span>
          <div className="meter">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <section className="task-panel">
        <div className="section-heading">
          <div>
            <span className="card-label">Execution plan</span>
            <h2>Launch checklist</h2>
          </div>
          {launch.status === "draft" ? (
            <button
              className="secondary-button small-button"
              type="button"
              disabled={saving}
              onClick={() => onStatusChange("active")}
              data-testid="activate-launch"
            >
              Activate plan
            </button>
          ) : (
            <button
              className="primary-button small-button"
              type="button"
              disabled={saving || !canMarkReady || launch.status === "ready"}
              onClick={() => onStatusChange("ready")}
              data-testid="mark-ready"
            >
              {launch.status === "ready" ? "Launch ready ✓" : "Mark ready"}
            </button>
          )}
        </div>

        <div className="task-table">
          <div className="task-table-head">
            <span>Task</span>
            <span>Owner</span>
            <span>Due date</span>
          </div>
          {launch.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onTaskChange={onTaskChange}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function TaskRow({
  task,
  onTaskChange,
}: {
  task: LaunchTask;
  onTaskChange: (
    id: string,
    patch: Partial<Pick<LaunchTask, "owner" | "dueDate" | "completed">>,
  ) => Promise<void>;
}) {
  const [owner, setOwner] = useState(task.owner);

  useEffect(() => {
    setOwner(task.owner);
  }, [task.owner]);

  return (
    <div className={`work-task ${task.completed ? "completed" : ""}`}>
      <label className="task-main">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(event) =>
            onTaskChange(task.id, { completed: event.target.checked })
          }
          aria-label={`Complete ${task.title}`}
        />
        <span className="task-check">✓</span>
        <span>
          <strong>{task.title}</strong>
          <small>{task.detail}</small>
        </span>
      </label>
      <input
        className="task-input owner-input"
        aria-label={`Owner for ${task.title}`}
        placeholder="Assign owner"
        value={owner}
        onChange={(event) => setOwner(event.target.value)}
        onBlur={() => {
          if (owner !== task.owner) void onTaskChange(task.id, { owner });
        }}
      />
      <input
        className="task-input"
        type="date"
        aria-label={`Due date for ${task.title}`}
        value={task.dueDate}
        onChange={(event) =>
          void onTaskChange(task.id, { dueDate: event.target.value })
        }
      />
    </div>
  );
}
