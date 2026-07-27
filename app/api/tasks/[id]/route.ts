import { updateTask } from "../../../../db/launches";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const launch = await updateTask(id, body);
    if (!launch) {
      return Response.json({ error: "Task not found." }, { status: 404 });
    }
    return Response.json({ launch });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to update task." },
      { status: 500 },
    );
  }
}
