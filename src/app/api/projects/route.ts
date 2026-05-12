import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgUser = await db.organizationUser.findFirst({
    where: { userId: session.user.id },
  });
  if (!orgUser) return NextResponse.json({ projects: [] });

  const projects = await db.project.findMany({
    where: { organizationId: orgUser.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, githubOwner, githubRepo, authType, githubToken, githubAppId, githubAppPrivateKey, githubInstallationId } = await req.json();

  const orgUser = await db.organizationUser.findFirst({
    where: { userId: session.user.id },
  });
  if (!orgUser) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const project = await db.project.create({
    data: {
      name,
      githubOwner,
      githubRepo,
      authType: authType ?? "PAT",
      githubToken: authType === "GITHUB_APP" ? null : (githubToken || null),
      githubAppId: authType === "GITHUB_APP" ? (githubAppId || null) : null,
      githubAppPrivateKey: authType === "GITHUB_APP" ? (githubAppPrivateKey || null) : null,
      githubInstallationId: authType === "GITHUB_APP" ? (githubInstallationId || null) : null,
      organizationId: orgUser.organizationId,
    },
  });

  return NextResponse.json(project, { status: 201 });
}
