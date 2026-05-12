import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

type ProjectAuth = {
  authType: string;
  githubToken?: string | null;
  githubAppId?: string | null;
  githubAppPrivateKey?: string | null;
  githubInstallationId?: string | null;
};

export function createOctokit(token: string) {
  return new Octokit({ auth: token });
}

export function createOctokitForProject(project: ProjectAuth): Octokit {
  if (
    project.authType === "GITHUB_APP" &&
    project.githubAppId &&
    project.githubAppPrivateKey &&
    project.githubInstallationId
  ) {
    return new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: project.githubAppId,
        privateKey: project.githubAppPrivateKey,
        installationId: parseInt(project.githubInstallationId),
      },
    });
  }

  // Fallback: PAT do projeto ou GITHUB_TOKEN do ambiente
  return new Octokit({
    auth: project.githubToken ?? process.env.GITHUB_TOKEN ?? "",
  });
}

export function parsePRUrl(url: string): { owner: string; repo: string; number: number } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2], number: parseInt(match[3]) };
}

export async function fetchPRComments(
  octokit: Octokit,
  owner: string,
  repo: string,
  options: { maxPages?: number } = {}
) {
  const { maxPages = 10 } = options;
  const allComments: Array<{
    prNumber: number;
    prTitle: string;
    body: string;
    type: string;
    filePath?: string;
    lineNumber?: number;
    author: string;
  }> = [];

  const prs = await octokit.paginate(
    octokit.rest.pulls.list,
    { owner, repo, state: "closed", per_page: 100 },
    (response) => response.data
  );

  const batch = prs.slice(0, maxPages * 10);

  for (const pr of batch) {
    const [reviewComments, issueComments] = await Promise.all([
      octokit.rest.pulls.listReviewComments({ owner, repo, pull_number: pr.number }),
      octokit.rest.issues.listComments({ owner, repo, issue_number: pr.number }),
    ]);

    for (const c of reviewComments.data) {
      if (c.body && c.body.trim().length > 20) {
        allComments.push({
          prNumber: pr.number,
          prTitle: pr.title,
          body: c.body,
          type: "inline",
          filePath: c.path,
          lineNumber: c.line ?? undefined,
          author: c.user?.login ?? "unknown",
        });
      }
    }

    for (const c of issueComments.data) {
      if (c.body && c.body.trim().length > 20) {
        allComments.push({
          prNumber: pr.number,
          prTitle: pr.title,
          body: c.body,
          type: "general",
          author: c.user?.login ?? "unknown",
        });
      }
    }
  }

  return allComments;
}

export async function fetchPRDiff(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
): Promise<{ title: string; description: string; diff: string; author: string }> {
  const [pr, files] = await Promise.all([
    octokit.rest.pulls.get({ owner, repo, pull_number: prNumber }),
    octokit.rest.pulls.listFiles({ owner, repo, pull_number: prNumber }),
  ]);

  const diff = files.data
    .map((f) => `--- a/${f.filename}\n+++ b/${f.filename}\n${f.patch ?? ""}`)
    .join("\n\n");

  return {
    title: pr.data.title,
    description: pr.data.body ?? "",
    diff,
    author: pr.data.user?.login ?? "unknown",
  };
}

export async function postReviewComments(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  comments: Array<{ filePath?: string; lineNumber?: number; body: string }>
): Promise<number[]> {
  const postedIds: number[] = [];

  const pr = await octokit.rest.pulls.get({ owner, repo, pull_number: prNumber });
  const headSha = pr.data.head.sha;

  for (const comment of comments) {
    try {
      if (comment.filePath && comment.lineNumber) {
        const response = await octokit.rest.pulls.createReviewComment({
          owner,
          repo,
          pull_number: prNumber,
          body: comment.body,
          path: comment.filePath,
          line: comment.lineNumber,
          commit_id: headSha,
        });
        postedIds.push(response.data.id);
      } else {
        const response = await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: prNumber,
          body: comment.body,
        });
        postedIds.push(response.data.id);
      }
    } catch {
      // Skip failed comments (e.g., line no longer in diff)
    }
  }

  return postedIds;
}
