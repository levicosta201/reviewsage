import { NextRequest, NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await db.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { access_token: true },
  });

  if (!account?.access_token) {
    return NextResponse.json({ connected: false, repos: [] });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));

  const octokit = new Octokit({ auth: account.access_token });

  try {
    let items: GithubRepo[];

    if (q.trim()) {
      const { data } = await octokit.request("GET /search/repositories", {
        q: `${q} fork:true`,
        sort: "updated",
        per_page: 30,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      });
      items = data.items.map(mapRepo);
    } else {
      const { data } = await octokit.request("GET /user/repos", {
        affiliation: "owner,collaborator,organization_member",
        sort: "updated",
        per_page: 50,
        page,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      });
      items = data.map(mapRepo);
    }

    return NextResponse.json({ connected: true, repos: items });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status;
    if (status === 401 || status === 403) {
      return NextResponse.json({ connected: false, repos: [] });
    }
    throw err;
  }
}

type GithubRepo = {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  description: string | null;
  language: string | null;
  updatedAt: string | null;
  stars: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRepo(r: any): GithubRepo {
  return {
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    owner: r.owner?.login ?? "",
    private: r.private,
    description: r.description ?? null,
    language: r.language ?? null,
    updatedAt: r.updated_at ?? null,
    stars: r.stargazers_count ?? 0,
  };
}
