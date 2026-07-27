import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const launches = sqliteTable("launches", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  launchDate: text("launch_date").notNull().default(""),
  template: text("template").notNull().default("product"),
  status: text("status").notNull().default("draft"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const launchTasks = sqliteTable("launch_tasks", {
  id: text("id").primaryKey(),
  launchId: text("launch_id")
    .notNull()
    .references(() => launches.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  detail: text("detail").notNull().default(""),
  owner: text("owner").notNull().default(""),
  dueDate: text("due_date").notNull().default(""),
  completed: integer("completed", { mode: "boolean" }).notNull().default(false),
  position: integer("position").notNull().default(0),
});
