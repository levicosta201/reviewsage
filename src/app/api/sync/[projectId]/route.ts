import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createOctokitForProject, fetchPRComments } from "@/lib/github";
import { generateEmbedding } from "@/lib/ai";

export async function POST(req: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const orgUser = await db.organizationUser.findFirst({ where: { userId: session.user.id } });
  if (!orgUser) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const project = await db.project.findFirst({
    where: { id: projectId, organizationId: orgUser.organizationId },
  });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  syncProjectHistory(project).catch(console.error);

  await db.project.update({ where: { id: projectId }, data: { syncStatus: "SYNCING" } });

  return NextResponse.json({ message: "Sync started" });
}

async function syncProjectHistory(project: {
  id: string;
  githubOwner: string;
  githubRepo: string;
  authType: string;
  githubToken: string | null;
  githubAppId: string | null;
  githubAppPrivateKey: string | null;
  githubInstallationId: string | null;
}) {
  try {
    const octokit = createOctokitForProject(project);
    const comments = await fetchPRComments(octokit, project.githubOwner, project.githubRepo, { maxPages: 5 });

    let imported = 0;
    for (const comment of comments) {
      const existing = await db.pRCommentEmbedding.findFirst({
        where: { projectId: project.id, prNumber: comment.prNumber, commentBody: comment.body },
      });
      if (existing) continue;

      const embedding = await generateEmbedding(comment.body);
      const vector = `[${embedding.join(",")}]`;

      await db.$executeRaw`
        INSERT INTO "PRCommentEmbedding" (
          "id", "projectId", "prNumber", "prTitle", "commentBody",
          "commentType", "filePath", "lineNumber", "author", "embedding", "createdAt"
        )
        VALUES (
          gen_random_uuid(), ${project.id}, ${comment.prNumber}, ${comment.prTitle ?? null},
          ${comment.body}, ${comment.type}, ${comment.filePath ?? null},
          ${comment.lineNumber ?? null}, ${comment.author}, ${vector}::vector, NOW()
        )
        ON CONFLICT DO NOTHING
      `;
      imported++;
    }

    await db.project.update({
      where: { id: project.id },
      data: {
        syncStatus: "COMPLETED",
        lastSyncAt: new Date(),
        commentCount: { increment: imported },
      },
    });
  } catch (err) {
    await db.project.update({
      where: { id: project.id },
      data: { syncStatus: "FAILED" },
    });
    throw err;
  }
}
