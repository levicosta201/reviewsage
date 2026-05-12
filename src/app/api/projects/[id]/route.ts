import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const orgUser = await db.organizationUser.findFirst({ where: { userId: session.user.id } });
  if (!orgUser) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const project = await db.project.findFirst({
    where: { id, organizationId: orgUser.organizationId },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.project.update({
    where: { id },
    data: {
      name: body.name ?? project.name,
      authType: body.authType ?? project.authType,
      githubToken: body.authType === "PAT" ? (body.githubToken ?? project.githubToken) : null,
      githubAppId: body.authType === "GITHUB_APP" ? (body.githubAppId ?? project.githubAppId) : null,
      githubAppPrivateKey: body.authType === "GITHUB_APP" ? (body.githubAppPrivateKey ?? project.githubAppPrivateKey) : null,
      githubInstallationId: body.authType === "GITHUB_APP" ? (body.githubInstallationId ?? project.githubInstallationId) : null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const orgUser = await db.organizationUser.findFirst({ where: { userId: session.user.id } });
  if (!orgUser) return NextResponse.json({ error: "No organization" }, { status: 400 });

  await db.project.deleteMany({ where: { id, organizationId: orgUser.organizationId } });

  return NextResponse.json({ ok: true });
}
