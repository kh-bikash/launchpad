export type LaunchTaskRecord = {
  id: string;
  launchId: string;
  title: string;
  detail: string;
  owner: string;
  dueDate: string;
  completed: boolean;
  position: number;
};

export type LaunchRecord = {
  id: string;
  name: string;
  description: string;
  launchDate: string;
  template: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tasks: LaunchTaskRecord[];
};

type D1Row = Record<string, string | number | null>;

const templateTasks: Record<
  string,
  Array<{ title: string; detail: string }>
> = {
  product: [
    {
      title: "Finalize positioning",
      detail: "Confirm the audience, problem statement, and launch narrative.",
    },
    {
      title: "Publish launch page",
      detail: "Ship the primary page and verify its conversion path.",
    },
    {
      title: "Validate analytics",
      detail: "Confirm product, funnel, and conversion events are arriving.",
    },
    {
      title: "Prepare announcement",
      detail: "Draft the launch post, customer email, and internal update.",
    },
    {
      title: "Run release QA",
      detail: "Test the critical journey across desktop and mobile.",
    },
  ],
  feature: [
    {
      title: "Complete release QA",
      detail: "Verify the feature path, permissions, and error states.",
    },
    {
      title: "Update documentation",
      detail: "Publish setup notes, examples, and known limitations.",
    },
    {
      title: "Prepare rollout plan",
      detail: "Define audience segments, flags, and rollback ownership.",
    },
    {
      title: "Notify customers",
      detail: "Prepare the changelog and customer-facing announcement.",
    },
  ],
  campaign: [
    {
      title: "Approve campaign brief",
      detail: "Lock the audience, channel mix, message, and success metric.",
    },
    {
      title: "Finish creative assets",
      detail: "Review final copy, design, links, and tracking parameters.",
    },
    {
      title: "Schedule distribution",
      detail: "Queue email, social, partner, and community placements.",
    },
    {
      title: "Prepare reporting",
      detail: "Create the launch dashboard and post-campaign review owner.",
    },
  ],
};

async function getD1() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) {
    throw new Error("The LaunchPad database is not available.");
  }
  return env.DB;
}

export async function ensureLaunchSchema() {
  const db = await getD1();
  await db.batch([
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS launches (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          launch_date TEXT NOT NULL DEFAULT '',
          template TEXT NOT NULL DEFAULT 'product',
          status TEXT NOT NULL DEFAULT 'draft',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        )`,
      ),
    db
      .prepare(
        `CREATE TABLE IF NOT EXISTS launch_tasks (
          id TEXT PRIMARY KEY,
          launch_id TEXT NOT NULL,
          title TEXT NOT NULL,
          detail TEXT NOT NULL DEFAULT '',
          owner TEXT NOT NULL DEFAULT '',
          due_date TEXT NOT NULL DEFAULT '',
          completed INTEGER NOT NULL DEFAULT 0,
          position INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (launch_id) REFERENCES launches(id) ON DELETE CASCADE
        )`,
      ),
    db.prepare(
      "CREATE INDEX IF NOT EXISTS launch_tasks_launch_id_idx ON launch_tasks(launch_id)",
    ),
  ]);
}

function mapTask(row: D1Row): LaunchTaskRecord {
  return {
    id: String(row.id),
    launchId: String(row.launch_id),
    title: String(row.title),
    detail: String(row.detail ?? ""),
    owner: String(row.owner ?? ""),
    dueDate: String(row.due_date ?? ""),
    completed: Boolean(row.completed),
    position: Number(row.position),
  };
}

function mapLaunch(row: D1Row, tasks: LaunchTaskRecord[]): LaunchRecord {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description ?? ""),
    launchDate: String(row.launch_date ?? ""),
    template: String(row.template),
    status: String(row.status),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    tasks,
  };
}

export async function listLaunches(): Promise<LaunchRecord[]> {
  await ensureLaunchSchema();
  const db = await getD1();
  const launchRows = await db
    .prepare("SELECT * FROM launches ORDER BY updated_at DESC")
    .all<D1Row>();
  const taskRows = await db
    .prepare("SELECT * FROM launch_tasks ORDER BY position ASC")
    .all<D1Row>();
  const tasksByLaunch = new Map<string, LaunchTaskRecord[]>();
  for (const row of taskRows.results) {
    const task = mapTask(row);
    const current = tasksByLaunch.get(task.launchId) ?? [];
    current.push(task);
    tasksByLaunch.set(task.launchId, current);
  }
  return launchRows.results.map((row) =>
    mapLaunch(row, tasksByLaunch.get(String(row.id)) ?? []),
  );
}

export async function getLaunch(id: string): Promise<LaunchRecord | null> {
  await ensureLaunchSchema();
  const db = await getD1();
  const launch = await db
    .prepare("SELECT * FROM launches WHERE id = ?")
    .bind(id)
    .first<D1Row>();
  if (!launch) return null;
  const taskRows = await db
    .prepare(
      "SELECT * FROM launch_tasks WHERE launch_id = ? ORDER BY position ASC",
    )
    .bind(id)
    .all<D1Row>();
  return mapLaunch(launch, taskRows.results.map(mapTask));
}

export async function createLaunch(input: {
  name: string;
  description: string;
  launchDate: string;
  template: string;
}) {
  await ensureLaunchSchema();
  const db = await getD1();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const selectedTemplate = templateTasks[input.template]
    ? input.template
    : "product";
  const tasks = templateTasks[selectedTemplate];
  await db.batch([
    db
      .prepare(
        `INSERT INTO launches
          (id, name, description, launch_date, template, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 'draft', ?, ?)`,
      )
      .bind(
        id,
        input.name.trim(),
        input.description.trim(),
        input.launchDate,
        selectedTemplate,
        now,
        now,
      ),
    ...tasks.map((task, index) =>
      db
        .prepare(
          `INSERT INTO launch_tasks
            (id, launch_id, title, detail, owner, due_date, completed, position)
            VALUES (?, ?, ?, ?, '', '', 0, ?)`,
        )
        .bind(crypto.randomUUID(), id, task.title, task.detail, index),
    ),
  ]);
  return getLaunch(id);
}

export async function updateLaunch(
  id: string,
  input: Partial<Pick<LaunchRecord, "name" | "description" | "launchDate" | "status">>,
) {
  await ensureLaunchSchema();
  const current = await getLaunch(id);
  if (!current) return null;
  const now = new Date().toISOString();
  const db = await getD1();
  await db
    .prepare(
      `UPDATE launches
       SET name = ?, description = ?, launch_date = ?, status = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(
      input.name ?? current.name,
      input.description ?? current.description,
      input.launchDate ?? current.launchDate,
      input.status ?? current.status,
      now,
      id,
    )
    .run();
  return getLaunch(id);
}

export async function updateTask(
  id: string,
  input: Partial<Pick<LaunchTaskRecord, "owner" | "dueDate" | "completed">>,
) {
  await ensureLaunchSchema();
  const db = await getD1();
  const current = await db
    .prepare("SELECT * FROM launch_tasks WHERE id = ?")
    .bind(id)
    .first<D1Row>();
  if (!current) return null;
  await db
    .prepare(
      `UPDATE launch_tasks
       SET owner = ?, due_date = ?, completed = ?
       WHERE id = ?`,
    )
    .bind(
      input.owner ?? String(current.owner ?? ""),
      input.dueDate ?? String(current.due_date ?? ""),
      input.completed ?? Boolean(current.completed) ? 1 : 0,
      id,
    )
    .run();
  const launchId = String(current.launch_id);
  await db
    .prepare("UPDATE launches SET updated_at = ? WHERE id = ?")
    .bind(new Date().toISOString(), launchId)
    .run();
  return getLaunch(launchId);
}
