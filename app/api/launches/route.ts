import { createLaunch, listLaunches } from "../../../db/launches";

export async function GET() {
  try {
    return Response.json({ launches: await listLaunches() });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load launches." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      description?: string;
      launchDate?: string;
      template?: string;
    };
    if (!body.name?.trim()) {
      return Response.json({ error: "Project name is required." }, { status: 400 });
    }
    const launch = await createLaunch({
      name: body.name,
      description: body.description ?? "",
      launchDate: body.launchDate ?? "",
      template: body.template ?? "product",
    });
    return Response.json({ launch }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create launch." },
      { status: 500 },
    );
  }
}
