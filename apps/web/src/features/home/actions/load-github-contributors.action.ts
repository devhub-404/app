import {
  loadGithubContributors as loadGithubContributorsTransport,
  type GithubContributor,
} from '@/features/home/api/github-contributors.api.ts';

export type GithubContributorsResult =
  { ok: true; data: GithubContributor[] } | { ok: false; data: GithubContributor[] };

export async function loadGithubContributors(apiUrl: string): Promise<GithubContributorsResult> {
  try {
    return { ok: true, data: await loadGithubContributorsTransport(apiUrl) };
  } catch {
    return { ok: false, data: [] };
  }
}
