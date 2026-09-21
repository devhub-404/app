export interface GithubContributor {
  id: number;
  login: string;
  html_url: string;
  avatar_url: string;
  contributions: number;
}

/** Loads contributor data from GitHub for the server-rendered home page. */
export async function loadGithubContributors(apiUrl: string, token?: string): Promise<GithubContributor[]> {
  const response = await fetch(apiUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error(`GITHUB_CONTRIBUTORS_${response.status}`);
  return response.json() as Promise<GithubContributor[]>;
}
