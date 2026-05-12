import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parsePRUrl, fetchPRDiff, postReviewComments, createOctokit } from "@/lib/github";
import { generateEmbedding, findSimilarComments, generatePRReview } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { prUrl, projectId } = await req.json();
  if (!prUrl) return NextResponse.json({ error: "prUrl is required" }, { status: 400 });

  const parsed = parsePRUrl(prUrl);
  if (!parsed) return NextResponse.json({ error: "URL de PR inválida. Use: github.com/owner/repo/pull/N" }, { status: 400 });

  const orgUser = await db.organizationUser.findFirst({
    where: { userId: session.user.id },
    include: { organization: true },
  });
  if (!orgUser) return NextResponse.json({ error: "No organization" }, { status: 400 });

  // Find the project
  let project = projectId
    ? await db.project.findFirst({ where: { id: projectId, organizationId: orgUser.organizationId } })
    : await db.project.findFirst({
        where: {
          organizationId: orgUser.organizationId,
          githubOwner: parsed.owner,
          githubRepo: parsed.repo,
        },
      });

  if (!project) {
    // Auto-create project if not found
    project = await db.project.create({
      data: {
        name: `${parsed.owner}/${parsed.repo}`,
        githubOwner: parsed.owner,
        githubRepo: parsed.repo,
        organizationId: orgUser.organizationId,
      },
    });
  }

  // Create review session
  const session_ = await db.reviewSession.create({
    data: {
      organizationId: orgUser.organizationId,
      projectId: project.id,
      prUrl,
      prNumber: parsed.number,
      status: "PROCESSING",
    },
  });

  try {
    const octokit = createOctokit(project.githubToken ?? process.env.GITHUB_TOKEN ?? "");

    // Fetch PR diff
    const prData = await fetchPRDiff(octokit, parsed.owner, parsed.repo, parsed.number);

    // Generate embedding for the diff to find similar patterns
    const diffEmbedding = await generateEmbedding(prData.diff.slice(0, 8000));

    // Find similar historical comments
    const similarComments = await findSimilarComments(project.id, diffEmbedding, 12);

    // Generate review
    const reviewComments = await generatePRReview({
      prTitle: prData.title,
      prDescription: prData.description,
      diff: prData.diff,
      similarComments,
      projectContext: project.name,
    });

    // Estimate tokens (rough: input chars / 4 + output chars / 4)
    const tokensUsed = Math.round((prData.diff.length + prData.description.length) / 4 + reviewComments.length * 100);

    // Post comments to GitHub
    const postedIds = await postReviewComments(
      octokit,
      parsed.owner,
      parsed.repo,
      parsed.number,
      reviewComments.map((c) => ({ filePath: c.filePath, lineNumber: c.lineNumber ?? undefined, body: c.body }))
    );

    // Save review comments
    await db.reviewComment.createMany({
      data: reviewComments.map((c, i) => ({
        reviewSessionId: session_.id,
        filePath: c.filePath || null,
        lineNumber: c.lineNumber || null,
        body: c.body,
        severity: (c.severity as "CRITICAL" | "WARNING" | "SUGGESTION" | "INFO") ?? "SUGGESTION",
        postedAt: new Date(),
        githubCommentId: postedIds[i] ?? null,
      })),
    });

    // Update session
    await db.reviewSession.update({
      where: { id: session_.id },
      data: {
        status: "COMPLETED",
        prTitle: prData.title,
        prAuthor: prData.author,
        tokensUsed,
        commentsPosted: postedIds.length,
      },
    });

    return NextResponse.json({
      prTitle: prData.title,
      prNumber: parsed.number,
      commentsPosted: postedIds.length,
      tokensUsed,
      comments: reviewComments,
    });
  } catch (err) {
    await db.reviewSession.update({
      where: { id: session_.id },
      data: { status: "FAILED", error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json({ error: "Erro ao processar review. Verifique as permissões do token GitHub." }, { status: 500 });
  }
}
