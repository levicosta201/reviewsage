import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createOctokit, fetchPRComments } from "@/lib/github";
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

  // Start sync in background
  syncProjectHistory(project.id, project.githubOwner, project.githubRepo, project.githubToken).catch(console.error);

  await db.project.update({ where: { id: projectId }, data: { syncStatus: "SYNCING" } });

  return NextResponse.json({ message: "Sync started" });
}

async function syncProjectHistory(projectId: string, owner: string, repo: string, token: string | null) {
  try {
    const octokit = createOctokit(token ?? process.env.GITHUB_TOKEN ?? "");
    const comments = await fetchPRComments(octokit, owner, repo, { maxPages: 5 });

    let imported = 0;
    for (const comment of comments) {
      const existing = await db.pRCommentEmbedding.findFirst({
        where: { projectId, prNumber: comment.prNumber, commentBody: comment.body },
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
          gen_random_uuid(), ${projectId}, ${comment.prNumber}, ${comment.prTitle ?? null},
          ${comment.body}, ${comment.type}, ${comment.filePath ?? null},
          ${comment.lineNumber ?? null}, ${comment.author}, ${vector}::vector, NOW()
        )
        ON CONFLICT DO NOTHING
      `;
      imported++;
    }

    await db.project.update({
      where: { id: projectId },
      data: {
        syncStatus: "COMPLETED",
        lastSyncAt: new Date(),
        commentCount: { increment: imported },
      },
    });
  } catch (err) {
    await db.project.update({
      where: { id: projectId },
      data: { syncStatus: "FAILED" },
    });
    throw err;
  }
}
