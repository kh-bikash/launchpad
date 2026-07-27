import { updateLaunch } from "../../../../db/launches";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const launch = await updateLaunch(id, body);
    if (!launch) {
      return Response.json({ error: "Launch not found." }, { status: 404 });
    }
    return Response.json({ launch });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to update launch." },
      { status: 500 },
    );
  }
}
